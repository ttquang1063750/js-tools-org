"""Lesson 14 project: a complete RAG pipeline, and a measurement of its weak spot.

Run:  python3 simple_rag.py
Needs: Ollama running (Lesson 13) for the generation step.
Optional: an embedding model (`ollama pull bge-m3`) for the comparison in part 4.

TF-IDF and cosine similarity are written out by hand rather than imported from
scikit-learn, so the maths stays visible.
"""

import json
import math
import re
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
CHAT_PREFERRED = ["qwen2.5:7b", "qwen2.5-coder:7b", "llama3.2", "llama3.1", "gemma2"]
EMBED_PREFERRED = ["bge-m3", "nomic-embed-text", "mxbai-embed-large"]

# The internal knowledge base. In a real system this is read from .txt/.pdf files.
KNOWLEDGE_BASE = """
Quy trình xin nghỉ phép của công ty JS-Tools:
Nhân viên cần gửi đơn xin nghỉ phép trước tối thiểu 3 ngày làm việc đối với nghỉ phép năm thông thường.
Trong trường hợp nghỉ ốm đột xuất, nhân viên phải thông báo cho quản lý trực tiếp qua Slack trước 9h00 sáng của ngày nghỉ và nộp giấy xác nhận của bác sĩ khi quay trở lại làm việc.
Nếu nghỉ phép dài hạn trên 5 ngày, đơn nghỉ phép bắt buộc phải được ký phê duyệt bởi Giám đốc điều hành (CEO).
Mọi đơn từ xin nghỉ phép đều phải được nhập dữ liệu chính thức lên hệ thống HR-Portal trực tuyến của công ty để bộ phận nhân sự chấm công cuối tháng.
"""

IN_SCOPE = "Tôi muốn nghỉ 10 ngày thì ai duyệt đơn nghỉ phép?"
OUT_OF_SCOPE = "Công ty thành lập vào năm nào?"


# ---------------------------------------------------------------------------
# Part 1 - chunking
# ---------------------------------------------------------------------------


def chunk_text(text, chunk_size=150, overlap=30):
    """Cut text into overlapping windows of characters."""
    if overlap >= chunk_size:
        # Without this guard the stride below is <= 0 and the loop never ends.
        raise ValueError("overlap must be smaller than chunk_size")
    chunks, start = [], 0
    while start < len(text):
        chunk = text[start:start + chunk_size].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def chunk_by_sentence(text, max_chars=250):
    """Cut on sentence boundaries instead of on a fixed character grid.

    A rule like "if the leave is longer than 5 days, the CEO must sign it" only
    works when the condition and the consequence stay in the same chunk.
    """
    parts = [p.strip() for p in
             re.split(r"(?<=[.:!?])\s*\n|(?<=[.!?])\s+", text) if p.strip()]
    chunks, current = [], ""
    for part in parts:
        if current and len(current) + 1 + len(part) > max_chars:
            chunks.append(current)
            current = part
        else:
            current = f"{current} {part}".strip()
    if current:
        chunks.append(current)
    return chunks


# ---------------------------------------------------------------------------
# Part 2 - TF-IDF and cosine similarity, by hand
# ---------------------------------------------------------------------------


class SimpleTFIDF:
    """A minimal TF-IDF vectoriser fitted on one list of documents."""

    def __init__(self, documents):
        self.documents = [self._tokenize(doc) for doc in documents]
        self.vocab = sorted({word for doc in self.documents for word in doc})
        self.idf = self._calculate_idf()

    def _tokenize(self, text):
        return re.findall(r"\b\w+\b", text.lower())

    def _calculate_idf(self):
        idf = {}
        total_docs = len(self.documents)
        for term in self.vocab:
            containing = sum(1 for doc in self.documents if term in doc)
            # A term in every document scores 0 or below: it separates nothing.
            idf[term] = math.log(total_docs / (1 + containing))
        return idf

    def transform(self, text):
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * len(self.vocab)
        return [tokens.count(term) / len(tokens) * self.idf.get(term, 0.0)
                for term in self.vocab]


def cosine_similarity(v1, v2):
    """The angle between two vectors, ignoring their lengths."""
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def rank(query_vector, chunk_vectors):
    """Score every chunk and return (score, index) sorted best first."""
    scored = [(cosine_similarity(query_vector, vector), index)
              for index, vector in enumerate(chunk_vectors)]
    return sorted(scored, reverse=True)


# ---------------------------------------------------------------------------
# Part 3 - talking to Ollama (the pattern from Lesson 13)
# ---------------------------------------------------------------------------


def installed_models():
    """Names of the models this Ollama has, or [] if it is not reachable."""
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as response:
            return [m["name"] for m in json.loads(response.read())["models"]]
    except urllib.error.URLError:
        return []


def pick(names, preferred):
    for wanted in preferred:
        for name in names:
            if name == wanted or name.startswith(wanted + ":"):
                return name
    return None


def post(path, payload):
    """POST JSON, and keep the two failure modes distinguishable."""
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


def embed(text, model):
    """One embedding vector from a real embedding model."""
    return post("/api/embeddings", {"model": model, "prompt": text})["embedding"]


def generate_answer(question, context, model):
    """Step 5: hand the retrieved context to the model and forbid guessing."""
    prompt = (
        "Hãy trả lời câu hỏi dựa duy nhất vào phần Ngữ cảnh dưới đây. "
        "Nếu thông tin không có trong ngữ cảnh, hãy trả lời đúng câu "
        "'Tôi không tìm thấy thông tin này trong tài liệu'.\n\n"
        f"Ngữ cảnh:\n{context}\n\nCâu hỏi: {question}\nCâu trả lời của bạn:"
    )
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }
    return post("/api/chat", payload)["message"]["content"].strip()


# ---------------------------------------------------------------------------
# Part 4 - the pipeline, and the measurement that exposes its weak spot
# ---------------------------------------------------------------------------


def show_ranking(label, question, scores, chunks):
    print(f"  {label} - {question}")
    for score, index in scores[:2]:
        print(f"    {score:.4f}  chunk {index}: {chunks[index][:52]!r}")


def compare_retrievers(chunks, embed_model):
    """Score both questions with TF-IDF, then with real embeddings.

    Returns the top score of each question under each retriever, so the claim
    at the end is checked rather than asserted in prose.
    """
    engine = SimpleTFIDF(chunks)
    tfidf_vectors = [engine.transform(c) for c in chunks]

    print("=== Retriever 1: TF-IDF (keyword overlap) ===")
    tfidf_top = {}
    for question in (IN_SCOPE, OUT_OF_SCOPE):
        scores = rank(engine.transform(question), tfidf_vectors)
        tfidf_top[question] = scores[0][0]
        show_ranking("tf-idf", question, scores, chunks)
    print()

    if embed_model is None:
        print("=== Retriever 2: skipped - no embedding model installed ===")
        print("    Install one with `ollama pull bge-m3` to run the comparison.\n")
        return tfidf_top, None

    print(f"=== Retriever 2: {embed_model} (real semantic embeddings) ===")
    chunk_vectors = [embed(c, embed_model) for c in chunks]
    print(f"  vector dimension: {len(chunk_vectors[0])}")
    embed_top = {}
    for question in (IN_SCOPE, OUT_OF_SCOPE):
        scores = rank(embed(question, embed_model), chunk_vectors)
        embed_top[question] = scores[0][0]
        show_ranking("embed ", question, scores, chunks)
    print()
    return tfidf_top, embed_top


def report_separation(tfidf_top, embed_top):
    """Can a similarity threshold tell the two questions apart?"""
    print("=== Can a threshold reject the out-of-scope question? ===")
    for label, top in (("tf-idf", tfidf_top), ("embeddings", embed_top)):
        if top is None:
            continue
        good, bad = top[IN_SCOPE], top[OUT_OF_SCOPE]
        gap = good - bad
        verdict = "YES" if gap > 0 else "NO - the wrong question scores higher"
        print(f"  {label:<11} in-scope {good:.4f}  out-of-scope {bad:.4f}"
              f"  gap {gap:+.4f}  -> {verdict}")
    print()


def run_pipeline(question, chunks, chat_model, embed_model, threshold=0.5):
    """The full five stages, with a retrieval threshold this time."""
    if embed_model:
        vectors = [embed(c, embed_model) for c in chunks]
        scores = rank(embed(question, embed_model), vectors)
        scorer = embed_model
    else:
        engine = SimpleTFIDF(chunks)
        scores = rank(engine.transform(question), [engine.transform(c) for c in chunks])
        scorer = "tf-idf"
    best_score, best_index = scores[0]
    print(f"  retrieved with {scorer}: {best_score:.4f}")

    if best_score < threshold:
        print(f"  below the {threshold} threshold - refusing to answer, and no")
        print("  tokens are spent calling the model at all.")
        return None
    print(f"  context: {chunks[best_index][:64]!r}")
    answer = generate_answer(question, chunks[best_index], chat_model)
    print(f"  answer : {answer}")
    return answer


def compare_chunking(chat_model, embed_model):
    """Same question, same model, same retriever - only the chunking changes."""
    print("=== Does the chunking change the answer? ===")
    grid = chunk_text(KNOWLEDGE_BASE, chunk_size=150, overlap=30)
    sentences = chunk_by_sentence(KNOWLEDGE_BASE)

    # The condition and its consequence are one sentence in the source. Does
    # each chunker keep them together? This part is deterministic.
    condition = "trên 5 ngày"
    grid_hit = next((c for c in grid if "Giám đốc điều hành" in c), "")
    sentence_hit = next((c for c in sentences if "Giám đốc điều hành" in c), "")
    print(f"  character grid  -> {len(grid)} chunks; the chunk naming the CEO "
          f"starts {grid_hit[:26]!r}")
    print(f"                     does it also contain '{condition}'? "
          f"{condition in grid_hit}")
    print(f"  sentence-aware  -> {len(sentences)} chunks; the chunk naming the CEO "
          f"starts {sentence_hit[:26]!r}")
    print(f"                     does it also contain '{condition}'? "
          f"{condition in sentence_hit}")
    print()

    answers = {}
    for label, chunks in (("character grid", grid), ("sentence-aware", sentences)):
        print(f"  --- {label} ---")
        answers[label] = run_pipeline(IN_SCOPE, chunks, chat_model, embed_model)
        print()

    # Structural, so it holds on every run regardless of what the model says.
    assert condition not in grid_hit, \
        "the grid chunk was expected to have lost the condition"
    assert condition in sentence_hit, \
        "the sentence chunk was expected to keep the condition"
    print("  PASS - the grid chunk states who approves but not WHEN it applies;")
    print("         the sentence chunk keeps the condition attached to the rule.")
    print("  The model's wording varies between runs; the missing condition does not.")
    return answers


def main():
    chunks = chunk_text(KNOWLEDGE_BASE, chunk_size=150, overlap=30)
    print(f"=== Chunking ===\n  {len(chunks)} chunks of at most 150 characters,"
          f" overlapping by 30\n")

    names = installed_models()
    if not names:
        print("Ollama is not reachable. Start it, then run this again.")
        return
    chat_model = pick(names, CHAT_PREFERRED) or names[0]
    embed_model = pick(names, EMBED_PREFERRED)

    tfidf_top, embed_top = compare_retrievers(chunks, embed_model)
    report_separation(tfidf_top, embed_top)

    print("=== The out-of-scope question, end to end ===")
    run_pipeline(OUT_OF_SCOPE, chunks, chat_model, embed_model)
    print()

    answers = compare_chunking(chat_model, embed_model)

    # The two claims this lesson makes, checked instead of asserted.
    assert tfidf_top[IN_SCOPE] < tfidf_top[OUT_OF_SCOPE], \
        "TF-IDF was expected to rank the out-of-scope question higher here"
    if embed_top:
        assert embed_top[IN_SCOPE] > embed_top[OUT_OF_SCOPE], \
            "embeddings were expected to rank the in-scope question higher"
        print("PASS - on this corpus TF-IDF ranks the wrong question higher,")
        print("       and semantic embeddings put it back in the right order.")


if __name__ == "__main__":
    main()
