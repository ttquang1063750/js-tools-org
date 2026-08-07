"""Lesson 15 project: chunking strategies, ANN indexing and hybrid search.

Run:  python3 chunking_evaluation.py
Optional: Ollama with an embedding model (`ollama pull bge-m3`) for parts 1c
and 3. Everything else is standard library only.

Three questions, each answered with a measurement rather than a claim:
  1. Do the three chunking strategies actually differ? On what kind of text?
  2. How much does an approximate index really save, and what does it cost?
  3. When does keyword search beat semantic search, and vice versa?
"""

import heapq
import json
import math
import random
import re
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
EMBED_PREFERRED = ["bge-m3", "nomic-embed-text", "mxbai-embed-large"]

# A tidy document: every clause is its own well-punctuated paragraph.
NDA_DOCUMENT = """
Hợp đồng bảo mật thông tin (NDA) của JS-Tools quy định rõ:
[Điều 1] Mọi tài liệu thiết kế hệ thống và mã nguồn dự án đều được phân loại là Mật.
Nhân viên không được chia sẻ thông tin này ra ngoài dưới bất kỳ hình thức nào.
[Điều 2] Mức phạt vi phạm hành chính đối với trường hợp rò rỉ dữ liệu khách hàng lên tới 500,000,000 VND.
Hành vi vi phạm nghiêm trọng có thể dẫn đến việc chấm dứt hợp đồng lao động lập tức mà không bồi thường.
[Điều 3] Thời hạn hiệu lực của thỏa thuận bảo mật kéo dài 5 năm kể từ ngày chấm dứt hợp đồng làm việc tại công ty.
Mọi tranh chấp sẽ được giải quyết tại Tòa án Nhân dân Thành phố Hồ Chí Minh.
"""

# A messy document: a meeting transcript with no reliable sentence boundaries.
# This is the case where punctuation-based splitting has nothing to work with.
TRANSCRIPT_DOCUMENT = """
an ok vay minh chot lai phan deploy nhe ban build xong thi day len staging
truoc da dung day thang len prod nua nhe lan truoc bi roll back met lam
binh ukm ma cai server staging no het dung luong roi day
an vay thi don log di
binh ok de toi don
an chuyen khac nhe ve cai bao gia cho khach hang ben Q
binh cai do ben sales bao la ho muon giam 15 phan tram
an giam nhieu the a thoi de toi hop voi sep tuan sau roi quyet
"""


# ---------------------------------------------------------------------------
# Part 0 - shared helpers
# ---------------------------------------------------------------------------


def tokenize(text):
    return re.findall(r"\b\w+\b", text.lower())


def bag_cosine(text1, text2):
    """Cosine similarity over raw word counts. No semantics, just overlap."""
    counts1, counts2 = {}, {}
    for token in tokenize(text1):
        counts1[token] = counts1.get(token, 0) + 1
    for token in tokenize(text2):
        counts2[token] = counts2.get(token, 0) + 1
    vocab = set(counts1) | set(counts2)
    dot = sum(counts1.get(w, 0) * counts2.get(w, 0) for w in vocab)
    norm1 = math.sqrt(sum(v * v for v in counts1.values()))
    norm2 = math.sqrt(sum(v * v for v in counts2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def vector_cosine(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    return 0.0 if norm1 == 0 or norm2 == 0 else dot / (norm1 * norm2)


def ollama_models():
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as response:
            return [m["name"] for m in json.loads(response.read())["models"]]
    except urllib.error.URLError:
        return []


def pick_embed_model():
    names = ollama_models()
    for wanted in EMBED_PREFERRED:
        for name in names:
            if name == wanted or name.startswith(wanted + ":"):
                return name
    return None


def embed(text, model):
    body = json.dumps({"model": model, "prompt": text}).encode("utf-8")
    request = urllib.request.Request(
        f"{OLLAMA}/api/embeddings", data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())["embedding"]


# ---------------------------------------------------------------------------
# Part 1 - the three chunking strategies
# ---------------------------------------------------------------------------


def fixed_size_chunk(text, chunk_size=120):
    """Cut every chunk_size characters, regardless of what is there."""
    return [text[i:i + chunk_size].strip()
            for i in range(0, len(text), chunk_size)]


def recursive_character_chunk(text, chunk_size=120):
    """Split on punctuation first, then pack sentences up to chunk_size."""
    sentences = [s for s in re.split(r"(?<=[.\n])\s+", text.strip()) if s]
    chunks, current = [], ""
    for sentence in sentences:
        if current and len(current) + len(sentence) > chunk_size:
            chunks.append(current.strip())
            current = sentence
        else:
            current += " " + sentence
    if current.strip():
        chunks.append(current.strip())
    return chunks


def semantic_chunk(text, threshold=0.20, similarity=bag_cosine):
    """Start a new chunk wherever consecutive sentences stop being similar.

    `similarity` is injectable so the same function can run on word overlap
    (no dependencies) or on real embeddings (part 1c).
    """
    sentences = [s.strip() for s in re.split(r"(?<=[.\n])\s+", text.strip())
                 if s.strip()]
    if not sentences:
        return []
    chunks, current = [], sentences[0]
    for index in range(1, len(sentences)):
        if similarity(sentences[index - 1], sentences[index]) < threshold:
            chunks.append(current)
            current = sentences[index]
        else:
            current += " " + sentences[index]
    chunks.append(current)
    return chunks


def best_match(query, chunks, score=bag_cosine):
    scored = [(score(query, chunk), index) for index, chunk in enumerate(chunks)]
    return max(scored)


def compare_chunkers(label, document, query, embed_model=None):
    """Run all strategies over one document and report what each retrieves."""
    print(f"=== {label} ===")
    print(f"  query: {query}")
    strategies = [
        ("fixed-size (120 chars)", fixed_size_chunk(document, 120)),
        ("recursive (punctuation)", recursive_character_chunk(document, 120)),
        ("semantic (word overlap)", semantic_chunk(document, 0.20)),
    ]
    if embed_model:
        cache = {}

        def embed_similarity(a, b):
            for text in (a, b):
                if text not in cache:
                    cache[text] = embed(text, embed_model)
            return vector_cosine(cache[a], cache[b])

        strategies.append(("semantic (real embeddings)",
                           semantic_chunk(document, 0.55, embed_similarity)))

    results = {}
    for name, chunks in strategies:
        score, index = best_match(query, chunks)
        results[name] = (len(chunks), score, chunks[index])
        print(f"  {name:<28} {len(chunks):2} chunks  best {score:.4f}")
        print(f"  {'':<28} -> {chunks[index][:64]!r}")
    print()
    return results


# ---------------------------------------------------------------------------
# Part 2 - what an approximate index actually buys
# ---------------------------------------------------------------------------


def squared_distance(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b))


def build_graph(vectors, neighbours=16, sample=200):
    """A navigable small-world graph: every node linked to near neighbours.

    Real HNSW stacks several of these graphs in layers and uses a smarter
    neighbour-selection heuristic. This single layer is enough to show where
    the saving comes from, and where it stops.
    """
    graph = {i: set() for i in range(len(vectors))}
    for i in range(len(vectors)):
        candidates = random.sample(range(len(vectors)),
                                   min(len(vectors), sample))
        nearest = sorted((squared_distance(vectors[i], vectors[j]), j)
                         for j in candidates if j != i)[:neighbours]
        for _, j in nearest:
            graph[i].add(j)
            graph[j].add(i)
    return graph


def graph_search(vectors, graph, query, ef=64, entry=0):
    """Greedy best-first walk. Returns (best index, distance computations)."""
    calls = [0]

    def distance_to(i):
        calls[0] += 1
        return squared_distance(query, vectors[i])

    visited = {entry}
    candidates = [(distance_to(entry), entry)]
    best = [(-candidates[0][0], entry)]
    while candidates:
        current_distance, current = heapq.heappop(candidates)
        if -best[0][0] < current_distance and len(best) >= ef:
            break  # everything left in the queue is worse than what we hold
        for neighbour in graph[current]:
            if neighbour in visited:
                continue
            visited.add(neighbour)
            neighbour_distance = distance_to(neighbour)
            if len(best) < ef or neighbour_distance < -best[0][0]:
                heapq.heappush(candidates, (neighbour_distance, neighbour))
                heapq.heappush(best, (-neighbour_distance, neighbour))
                if len(best) > ef:
                    heapq.heappop(best)
    return sorted((-d, i) for d, i in best)[0][1], calls[0]


def make_clustered_vectors(count, dimension=64, clusters=50, spread=0.25):
    """Real embeddings sit in clusters, not spread evenly. Mimic that."""
    centres = [[random.gauss(0, 1) for _ in range(dimension)]
               for _ in range(clusters)]
    vectors = [[x + random.gauss(0, spread) for x in centres[i % clusters]]
               for i in range(count)]
    return centres, vectors


def measure_index(count, ef_values, trials=100):
    """Recall and distance computations against an exact brute-force scan."""
    random.seed(42)
    centres, vectors = make_clustered_vectors(count)
    graph = build_graph(vectors)
    rows = []
    for ef in ef_values:
        hits, total_calls = 0, 0
        for _ in range(trials):
            centre = centres[random.randrange(len(centres))]
            query = [x + random.gauss(0, 0.25) for x in centre]
            exact = min(range(count),
                        key=lambda i: squared_distance(query, vectors[i]))
            found, calls = graph_search(vectors, graph, query, ef=ef)
            hits += found == exact
            total_calls += calls
        rows.append((ef, hits / trials, total_calls / trials,
                     count / (total_calls / trials)))
    return rows


def report_index():
    print("=== What an approximate index really costs and saves ===")
    print("  brute force always computes N distances and is always exact.\n")
    for count in (5000, 20000):
        print(f"  N = {count} vectors, 64 dimensions, 50 clusters")
        print(f"  {'ef':>5} {'recall@1':>9} {'distances':>10} {'vs brute':>9}")
        for ef, recall, calls, speedup in measure_index(count, (16, 64, 256)):
            print(f"  {ef:>5} {recall:>8.0%} {calls:>10.0f} {speedup:>8.1f}x")
        print()


# ---------------------------------------------------------------------------
# Part 3 - hybrid search: BM25, dense, and RRF fusion
# ---------------------------------------------------------------------------

# Two documents that differ by a single digit in the fault code, plus two
# unrelated ones. This is the shape of a real support knowledge base.
SUPPORT_DOCS = [
    "Sự cố mã E-1042: quạt tản nhiệt của model NX-200 kêu to bất thường. "
    "Thay quạt theo quy trình bảo hành.",
    "Sự cố mã E-1024: quạt tản nhiệt của model NX-300 kêu to bất thường. "
    "Thay quạt theo quy trình bảo hành.",
    "Hướng dẫn vệ sinh bộ lọc bụi định kỳ ba tháng một lần cho toàn bộ dòng "
    "máy NX.",
    "Chính sách hoàn tiền áp dụng trong vòng 30 ngày kể từ ngày mua hàng.",
]


def bm25_scores(query, documents, k1=1.5, b=0.75):
    """Classic BM25: TF saturation plus length normalisation."""
    tokenised = [tokenize(d) for d in documents]
    average_length = sum(len(d) for d in tokenised) / len(tokenised)
    scores = []
    for document in tokenised:
        score = 0.0
        for term in tokenize(query):
            frequency = document.count(term)
            if frequency == 0:
                continue
            containing = sum(1 for d in tokenised if term in d)
            idf = math.log(1 + (len(tokenised) - containing + 0.5)
                           / (containing + 0.5))
            norm = 1 - b + b * len(document) / average_length
            score += idf * frequency * (k1 + 1) / (frequency + k1 * norm)
        scores.append(score)
    return scores


def ranks_from_scores(scores):
    """Position of each document, 1 = best."""
    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    ranks = [0] * len(scores)
    for position, index in enumerate(order, start=1):
        ranks[index] = position
    return ranks


def reciprocal_rank_fusion(rank_lists, k=60):
    """Combine rankings without ever comparing incomparable score scales."""
    return [sum(1 / (k + ranks[i]) for ranks in rank_lists)
            for i in range(len(rank_lists[0]))]


def report_hybrid(embed_model):
    print("=== Hybrid search: where each retriever alone fails ===")
    if embed_model is None:
        print("  skipped - no embedding model installed"
              " (`ollama pull bge-m3`)\n")
        return
    document_vectors = [embed(d, embed_model) for d in SUPPORT_DOCS]
    queries = [
        ("exact fault code   ", "E-1024", 1),
        ("paraphrased symptom", "máy của tôi phát ra tiếng ồn lớn ở phần làm mát", 0),
    ]
    for label, query, expected in queries:
        sparse = bm25_scores(query, SUPPORT_DOCS)
        query_vector = embed(query, embed_model)
        dense = [vector_cosine(query_vector, v) for v in document_vectors]
        fused = reciprocal_rank_fusion(
            [ranks_from_scores(sparse), ranks_from_scores(dense)])
        print(f"  {label}: {query}")
        for name, scores in (("bm25 ", sparse), ("dense", dense),
                             ("rrf  ", fused)):
            ordered = sorted(range(len(scores)), key=lambda i: scores[i],
                             reverse=True)
            mark = "ok  " if ordered[0] == expected else "MISS"
            top_scores = "  ".join(f"doc{i}={scores[i]:.3f}"
                                   for i in ordered[:3])
            print(f"    {name} [{mark}] {top_scores}")
        print()
    print("  On the exact code both find it, but look at the gap to the")
    print("  runner-up: BM25 is decisive, while the embedding barely separates")
    print("  E-1024 from E-1042 - two documents one digit apart.")
    print("  On the paraphrase BM25 picks the wrong document; RRF follows the"
          " retriever")
    print("  that was right, without ever comparing the two score scales")
    print("  directly. RRF numbers are always small and close together: with")
    print("  k=60, rank 1 scores 1/61 and rank 2 scores 1/62. Only the order")
    print("  matters, never the magnitude.\n")


def main():
    embed_model = pick_embed_model()
    if embed_model:
        print(f"Embedding model in use: {embed_model}\n")
    else:
        print("No embedding model found; parts 1c and 3 will be skipped.\n")

    tidy = compare_chunkers("Tidy document (NDA, clean punctuation)",
                            NDA_DOCUMENT,
                            "Mức phạt tiền vi phạm rò rỉ dữ liệu là bao nhiêu?",
                            embed_model)
    messy = compare_chunkers("Messy document (meeting transcript, no periods)",
                             TRANSCRIPT_DOCUMENT,
                             "khach hang ben Q muon giam gia bao nhieu phan tram?",
                             embed_model)

    # On tidy text, punctuation already sits on the semantic boundaries, so the
    # two strategies agree. That is a property of the text, not of the method.
    print("=== When does the strategy actually matter? ===")
    for label, results in (("tidy ", tidy), ("messy", messy)):
        fixed = results["fixed-size (120 chars)"]
        recursive = results["recursive (punctuation)"]
        print(f"  {label}: fixed-size {fixed[0]} chunks / best {fixed[1]:.4f}"
              f"   recursive {recursive[0]} chunks / best {recursive[1]:.4f}")
    print("  On tidy text the punctuation already sits on the semantic")
    print("  boundaries, so every smart strategy agrees and beats fixed-size.")
    print("  On the transcript there is no sentence punctuation at all, so the")
    print("  recursive splitter collapses to a single chunk and loses to the")
    print("  dumbest strategy in the file.\n")

    report_index()
    report_hybrid(embed_model)


if __name__ == "__main__":
    main()
