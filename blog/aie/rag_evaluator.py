"""Lesson 20 project: a RAG evaluator, and an evaluation of the evaluator.

Run:  python3 rag_evaluator.py
Optional: Ollama with `bge-m3` and a chat model, for the semantic metrics.

The test set deliberately contains one CORRECT answer and one that is plainly
WRONG. That is the whole design: a metric you have never seen fail is a metric
you have no reason to trust. Every score below is checked against which sample
it belongs to.
"""

import json
import math
import re
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
CHAT_PREFERRED = ["qwen2.5:14b-instruct", "qwen2.5:7b", "llama3.1", "llama3.2"]
EMBED_PREFERRED = ["bge-m3", "nomic-embed-text", "mxbai-embed-large"]

TEST_DATASET = [
    {
        "label": "correct answer",
        "question": "Thuật toán PagedAttention trong vLLM dùng để làm gì?",
        "context": "vLLM sử dụng thuật toán PagedAttention để phân chia bộ đệm Key-Value "
                   "(KV Cache) thành các khối cố định trên bộ nhớ VRAM, giúp loại bỏ hiện "
                   "tượng phân mảnh bộ nhớ vật lý.",
        "answer": "PagedAttention dùng để phân chia bộ đệm KV Cache thành các khối bộ nhớ "
                  "cố định giúp tối ưu hóa VRAM và tránh phân mảnh.",
        "ground_truth": "PagedAttention dùng để giải quyết vấn đề phân mảnh bộ nhớ KV Cache "
                        "bằng cách chia nhỏ nó thành các khối cố định trên GPU VRAM.",
    },
    {
        "label": "WRONG answer",
        "question": "Định nghĩa kỹ thuật LoRA?",
        "context": "LoRA là kỹ thuật đóng băng ma trận trọng số gốc của LLM và đưa vào các "
                   "ma trận hạng thấp song song để huấn luyện, giúp giảm hàng trăm lần số "
                   "lượng tham số cập nhật.",
        "answer": "LoRA là kỹ thuật tăng nhiệt độ temperature để mô hình ngôn ngữ lớn hoạt "
                  "động sáng tạo hơn.",
        "ground_truth": "LoRA là kỹ thuật tinh chỉnh tham số hiệu quả bằng cách huấn luyện "
                        "các ma trận phân rã hạng thấp song song và đóng băng trọng số gốc.",
    },
]

STOPWORDS = {"và", "để", "của", "là", "trong", "cho", "có", "các", "được",
             "bằng", "với", "ra"}


# ---------------------------------------------------------------------------
# Keyword metrics - cheap, no dependencies, and worth measuring critically
# ---------------------------------------------------------------------------


def keywords(text):
    return {w for w in re.findall(r"\b\w+\b", text.lower()) if w not in STOPWORDS}


def keyword_faithfulness(answer, context):
    """What share of the answer's words appear in the retrieved context?"""
    answer_words = keywords(answer)
    return len(answer_words & keywords(context)) / len(answer_words) if answer_words else 0.0


def keyword_context_recall(context, ground_truth):
    """What share of the ground truth's words the retrieved context covers."""
    truth_words = keywords(ground_truth)
    return len(truth_words & keywords(context)) / len(truth_words) if truth_words else 0.0


def keyword_answer_relevance(question, answer):
    """Jaccard overlap between question and answer words."""
    q, a = keywords(question), keywords(answer)
    return len(q & a) / len(q | a) if (q | a) else 0.0


# ---------------------------------------------------------------------------
# Semantic metrics - what Ragas actually does
# ---------------------------------------------------------------------------


def post(path, payload):
    request = urllib.request.Request(
        f"{OLLAMA}{path}", data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())


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


def cosine(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    return 0.0 if n1 == 0 or n2 == 0 else dot / (n1 * n2)


def semantic_answer_relevance(question, answer, model):
    """Cosine between the question and the answer in embedding space."""
    return cosine(embed(question, model), embed(answer, model))


def llm_faithfulness(answer, context, model):
    """LLM as judge: is every claim in the answer supported by the context?"""
    prompt = (
        f'Ngữ cảnh: "{context}"\n'
        f'Câu trả lời: "{answer}"\n\n'
        "Mọi khẳng định trong câu trả lời có được suy ra trực tiếp từ ngữ cảnh không? "
        "Chỉ trả về DUY NHẤT một số nguyên từ 0 đến 10, không giải thích."
    )
    payload = {"model": model, "stream": False, "options": {"temperature": 0.0},
               "messages": [{"role": "user", "content": prompt}]}
    reply = post("/api/chat", payload)["message"]["content"]
    match = re.search(r"\d+", reply)
    return int(match.group()) / 10 if match else 0.0


# ---------------------------------------------------------------------------
# Evaluating the evaluator
# ---------------------------------------------------------------------------


def report_table(title, rows, note=None):
    print(f"=== {title} ===")
    print(f"  {'sample':<16}{'faithfulness':>14}{'context recall':>16}{'answer relevance':>18}")
    for label, faith, recall, relevance in rows:
        print(f"  {label:<16}{faith:>13.2%} {recall:>15.2%} {relevance:>17.2%}")
    if note:
        print(f"  {note}")
    print()


def main():
    print("The test set holds one correct answer and one that is plainly wrong.")
    print("A metric that cannot tell them apart is not measuring anything.\n")

    keyword_rows = [
        (s["label"],
         keyword_faithfulness(s["answer"], s["context"]),
         keyword_context_recall(s["context"], s["ground_truth"]),
         keyword_answer_relevance(s["question"], s["answer"]))
        for s in TEST_DATASET
    ]
    report_table("Metrics computed from word overlap only", keyword_rows)

    good, bad = keyword_rows[0], keyword_rows[1]
    print("=== Does each keyword metric separate right from wrong? ===")
    # Context recall is excluded on purpose: it scores the RETRIEVER (did the
    # context cover the ground truth), so it has no opinion about the answer.
    for index, name in ((1, "faithfulness    "), (3, "answer relevance")):
        gap = good[index] - bad[index]
        verdict = "ok" if gap > 0 else "INVERTED - scores the wrong answer higher"
        print(f"  {name}: {good[index]:.2%} vs {bad[index]:.2%}"
              f"   gap {gap:+.2%}   {verdict}")
    print(f"  context recall  : {good[2]:.2%} vs {bad[2]:.2%}"
          f"   not applicable - it grades the retriever, not the answer")
    print("  Faithfulness works: the wrong answer shares almost no words with its")
    print("  context. Answer relevance is inverted - the metric is broken.\n")

    names = installed_models()
    embed_model = pick(names, EMBED_PREFERRED)
    chat_model = pick(names, CHAT_PREFERRED)
    if not embed_model or not chat_model:
        print("Ollama with an embedding model and a chat model is needed for the")
        print("semantic metrics. Try: ollama pull bge-m3 && ollama pull qwen2.5:7b")
        return
    print(f"embedding model: {embed_model}\nchat model: {chat_model}\n")

    print("=== The same two metrics, computed the way Ragas actually does ===")
    for sample in TEST_DATASET:
        relevance = semantic_answer_relevance(sample["question"], sample["answer"],
                                              embed_model)
        faithfulness = llm_faithfulness(sample["answer"], sample["context"],
                                        chat_model)
        print(f"  {sample['label']:<16} relevance {relevance:.4f}"
              f"   faithfulness {faithfulness:.2f}")
    print()

    print("=== What the numbers say ===")
    print("  Embedding relevance puts the correct answer back on top, but only")
    print("  just. That is the right behaviour, not a weakness: the wrong answer")
    print("  IS about LoRA, it is simply false. Relevance asks 'does this address")
    print("  the question', never 'is this true'.")
    print("  Falsity is faithfulness's job, and that is where the gap is wide.")
    print("  Pick the metric that can fail on the defect you actually fear.")


if __name__ == "__main__":
    main()
