"""Lesson 16 project: query rewriting, real reranking, and parent-child indexing.

Run:  python3 advanced_rag.py
Needs: Ollama with a chat model and an embedding model
       (`ollama pull qwen2.5:7b` and `ollama pull bge-m3`).

Unlike Lessons 14 and 15, nothing here is simulated with word counting. The
bi-encoder is a real embedding model and the cross-encoder is a real language
model scoring the query and the document together. That distinction is the
entire subject of the lesson, so faking it would defeat the point.
"""

import json
import math
import re
import time
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
# An instruct model first: a code-tuned model scores relevance far more harshly.
CHAT_PREFERRED = ["qwen2.5:14b-instruct", "qwen2.5:7b", "llama3.1", "llama3.2",
                  "qwen2.5-coder:7b"]
EMBED_PREFERRED = ["bge-m3", "nomic-embed-text", "mxbai-embed-large"]

# Seven documents that all talk about leave policy. A corpus of five unrelated
# topics would make retrieval trivially easy and prove nothing about reranking.
DOCUMENTS = [
    {"id": "doc1", "text": "Nhân viên xin nghỉ phép năm phải khai báo trên "
                           "HR-Portal trước ít nhất 3 ngày làm việc."},
    {"id": "doc2", "text": "Khi bị ốm đột xuất, nhân viên cần nhắn Slack cho "
                           "quản lý trực tiếp trước 9h00 sáng cùng ngày."},
    {"id": "doc3", "text": "Nghỉ phép dài trên 5 ngày phải được Giám đốc điều "
                           "hành ký duyệt trước khi nghỉ."},
    {"id": "doc4", "text": "Nhân viên nữ nghỉ thai sản được hưởng 6 tháng theo "
                           "quy định của Luật Bảo hiểm xã hội."},
    {"id": "doc5", "text": "Đơn xin nghỉ phép nộp muộn sẽ bị tính là nghỉ không "
                           "lương trong kỳ chấm công tháng đó."},
    {"id": "doc6", "text": "Nhân viên làm việc từ xa vẫn phải cập nhật trạng "
                           "thái trên Slack vào đầu mỗi ngày làm việc."},
    {"id": "doc7", "text": "Giấy xác nhận của bác sĩ phải được nộp cho bộ phận "
                           "nhân sự khi nhân viên quay lại làm việc sau kỳ nghỉ ốm."},
]

RAW_QUERY = "nghi om can nhan slack luc nao"


# ---------------------------------------------------------------------------
# Talking to Ollama - the pattern established in Lesson 13
# ---------------------------------------------------------------------------


def post(path, payload):
    request = urllib.request.Request(
        f"{OLLAMA}{path}", data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as exc:
        detail = json.loads(exc.read() or b"{}").get("error", "no detail")
        raise RuntimeError(f"Ollama answered HTTP {exc.code}: {detail}") from None
    except urllib.error.URLError as exc:
        raise RuntimeError(f"cannot reach Ollama at {OLLAMA} - {exc.reason}") from None


def installed_models():
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as response:
            return [m["name"] for m in json.loads(response.read())["models"]]
    except urllib.error.URLError:
        return []


def pick(names, preferred):
    for wanted in preferred:
        for name in names:
            if name == wanted or name.startswith(wanted):
                return name
    return None


def embed(text, model):
    return post("/api/embeddings", {"model": model, "prompt": text})["embedding"]


def chat(prompt, model, temperature=0.0):
    payload = {"model": model, "stream": False,
               "options": {"temperature": temperature},
               "messages": [{"role": "user", "content": prompt}]}
    return post("/api/chat", payload)["message"]["content"].strip()


# ---------------------------------------------------------------------------
# Similarity
# ---------------------------------------------------------------------------


def word_cosine(text1, text2):
    """Bag-of-words cosine: the keyword baseline from Lesson 14."""
    t1 = re.findall(r"\b\w+\b", text1.lower())
    t2 = re.findall(r"\b\w+\b", text2.lower())
    vocab = set(t1) | set(t2)
    v1 = [t1.count(w) for w in vocab]
    v2 = [t2.count(w) for w in vocab]
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    return 0.0 if n1 == 0 or n2 == 0 else dot / (n1 * n2)


def vector_cosine(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    return 0.0 if n1 == 0 or n2 == 0 else dot / (n1 * n2)


# ---------------------------------------------------------------------------
# Stage 1 - query rewriting
# ---------------------------------------------------------------------------


def rewrite_query(raw_query, model):
    """Ask a model to repair the query. Few-shot, to pin down the output shape.

    Note there is no `except` here. An earlier version of this project silently
    returned the raw query on any error, which meant the headline feature of
    the lesson quietly did nothing on a machine without the right model, and
    nobody could tell.
    """
    prompt = (
        "Ban la bo tien xu ly cau hoi cho he thong tim kiem tai lieu noi bo. "
        "Viet lai cau hoi tho thanh mot cau hoi day du, dung chinh ta, co dau. "
        "Giu nguyen y dinh goc, khong them thong tin moi. "
        "Chi tra ve cau hoi da viet lai.\n\n"
        "Cau hoi tho: xin nghi phep nam bao lau truoc\n"
        "Viet lai: Xin nghỉ phép năm cần báo trước bao lâu?\n\n"
        "Cau hoi tho: ai duyet don nghi dai ngay\n"
        "Viet lai: Ai là người duyệt đơn nghỉ phép dài ngày?\n\n"
        f"Cau hoi tho: {raw_query}\n"
        "Viet lai:"
    )
    return chat(prompt, model).strip().strip('"')


def report_rewriting(raw, rewritten, embed_model):
    """How much does rewriting help - for keywords, and for embeddings?"""
    print("=== Stage 1: query rewriting ===")
    print(f"  raw       : {raw}")
    print(f"  rewritten : {rewritten}")
    target = next(d for d in DOCUMENTS if d["id"] == "doc2")

    keyword = (word_cosine(raw, target["text"]),
               word_cosine(rewritten, target["text"]))
    print(f"  match against doc2 (the correct document):")
    print(f"    bag-of-words : {keyword[0]:.4f} -> {keyword[1]:.4f}"
          f"   ({keyword[1] / max(keyword[0], 1e-9):.1f}x)")

    target_vector = embed(target["text"], embed_model)
    dense = (vector_cosine(embed(raw, embed_model), target_vector),
             vector_cosine(embed(rewritten, embed_model), target_vector))
    print(f"    embeddings   : {dense[0]:.4f} -> {dense[1]:.4f}"
          f"   ({dense[1] / dense[0]:.1f}x)")
    print("  Rewriting rescues keyword search; it only tunes semantic search.\n")


# ---------------------------------------------------------------------------
# Stage 2 - bi-encoder retrieval, then cross-encoder reranking
# ---------------------------------------------------------------------------


def bi_encoder_retrieve(query, documents, embed_model, k=4):
    """Encode query and documents separately, compare the frozen vectors."""
    query_vector = embed(query, embed_model)
    scored = [(vector_cosine(query_vector, embed(d["text"], embed_model)), d)
              for d in documents]
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return scored[:k]


def cross_encoder_score(query, document, model):
    """Put query and document through ONE model together, and read the score.

    This is what makes it a cross-encoder: the two texts interact inside the
    network instead of being reduced to two independent vectors first.
    """
    prompt = (
        f'Cau hoi: "{query}"\n'
        f'Tai lieu: "{document}"\n\n'
        "Tai lieu nay tra loi truc tiep cau hoi o muc do nao? "
        "Chi tra ve DUY NHAT mot so nguyen tu 0 den 10, khong giai thich."
    )
    answer = chat(prompt, model)
    match = re.search(r"\d+", answer)
    return int(match.group()) if match else 0


def report_two_stage(query, embed_model, chat_model):
    print("=== Stage 2: bi-encoder retrieval, then cross-encoder reranking ===")
    start = time.time()
    candidates = bi_encoder_retrieve(query, DOCUMENTS, embed_model, k=4)
    bi_seconds = time.time() - start

    print(f"  bi-encoder top 4 ({bi_seconds:.2f}s for {len(DOCUMENTS)} documents)")
    for score, document in candidates:
        print(f"    {document['id']} {score:.3f}  {document['text'][:50]}")
    spread = candidates[0][0] - candidates[-1][0]
    lead = candidates[0][0] - candidates[1][0]
    print(f"    spread across all four: {spread:.3f};"
          f" lead over the runner-up: {lead:.3f}")

    start = time.time()
    reranked = [(cross_encoder_score(query, d["text"], chat_model), d)
                for _, d in candidates]
    cross_seconds = time.time() - start
    reranked.sort(key=lambda pair: pair[0], reverse=True)

    print(f"\n  cross-encoder rescoring ({cross_seconds:.2f}s for 4 documents)")
    for score, document in reranked:
        print(f"    {document['id']} {score:>2}/10  {document['text'][:50]}")
    print(f"    lead over the runner-up: {reranked[0][0] - reranked[1][0]} points")

    per_document = cross_seconds / 4
    whole_corpus = per_document * len(DOCUMENTS)
    print(f"\n  cost per document: {per_document:.2f}s. Running the"
          f" cross-encoder over")
    print(f"  all {len(DOCUMENTS)} documents would take {whole_corpus:.1f}s;"
          f" over a million it is")
    print(f"  {per_document * 1_000_000 / 3600:.0f} hours. That is why stage 1"
          f" exists.\n")
    return candidates, reranked


# ---------------------------------------------------------------------------
# Stage 3 - parent-child indexing
# ---------------------------------------------------------------------------

PARENT_DOCUMENT = """Quy trình nghỉ ốm của công ty gồm ba bước bắt buộc.
Khi bị ốm đột xuất, nhân viên cần nhắn Slack cho quản lý trực tiếp trước 9h00 sáng cùng ngày.
Nếu nghỉ quá hai ngày liên tiếp, nhân viên phải báo thêm cho bộ phận nhân sự.
Giấy xác nhận của bác sĩ phải được nộp khi nhân viên quay lại làm việc."""


def split_sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n", text) if s.strip()]


def report_parent_child(query, embed_model):
    """Search on small units, but hand the LLM the surrounding block."""
    print("=== Stage 3: parent-child indexing ===")
    children = split_sentences(PARENT_DOCUMENT)
    query_vector = embed(query, embed_model)
    scored = sorted(((vector_cosine(query_vector, embed(c, embed_model)), i)
                     for i, c in enumerate(children)), reverse=True)
    best_score, best_index = scored[0]
    print(f"  indexed {len(children)} child sentences from 1 parent block")
    print(f"  best child ({best_score:.3f}): {children[best_index]}")
    print(f"  child length : {len(children[best_index])} characters")
    print(f"  parent length: {len(PARENT_DOCUMENT)} characters")
    print("  The child is what gets matched; the parent is what the model reads.\n")
    return children[best_index], PARENT_DOCUMENT


def generate_answer(query, context, model):
    prompt = (
        "Chỉ dựa vào ngữ cảnh dưới đây để trả lời. "
        "Nếu không có thông tin, trả lời 'Không tìm thấy trong tài liệu'.\n\n"
        f"Ngữ cảnh:\n{context}\n\nCâu hỏi: {query}\nTrả lời:"
    )
    return chat(prompt, model)


def main():
    names = installed_models()
    if not names:
        print("Ollama is not reachable. Start it, then run this again.")
        return
    chat_model = pick(names, CHAT_PREFERRED)
    embed_model = pick(names, EMBED_PREFERRED)
    if not chat_model or not embed_model:
        print("This lesson needs both a chat model and an embedding model.")
        print("  ollama pull qwen2.5:7b")
        print("  ollama pull bge-m3")
        return
    print(f"chat model: {chat_model}\nembedding model: {embed_model}\n")

    rewritten = rewrite_query(RAW_QUERY, chat_model)
    report_rewriting(RAW_QUERY, rewritten, embed_model)

    question = "nghỉ ốm thì phải báo trước mấy giờ?"
    candidates, reranked = report_two_stage(question, embed_model, chat_model)

    child, parent = report_parent_child(question, embed_model)
    # Same question both times: the only variable is how much context we pass.
    broad = "Quy trình nghỉ ốm gồm những bước nào?"
    print("=== Same question, child context versus parent context ===")
    print(f"  question: {broad}\n")
    for label, context in (("child only", child), ("parent block", parent)):
        print(f"  from the {label} ({len(context)} chars):")
        for line in generate_answer(broad, context, chat_model).splitlines():
            print(f"    {line}" if line.strip() else "")
        print()


if __name__ == "__main__":
    main()
