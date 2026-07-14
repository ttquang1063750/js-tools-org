import urllib.request
import json
import re
import math

# Cở sở dữ liệu tri thức giả lập
DOCUMENTS = [
    {"id": "doc1", "text": "Hệ thống HR-Portal của JS-Tools yêu cầu nhân viên khai báo ngày nghỉ phép trước 3 ngày làm việc đối với phép năm."},
    {"id": "doc2", "text": "Khi bị ốm đột xuất, nhân viên cần nhắn Slack cho quản lý trực tiếp trước 9h00 sáng để được tính phép nghỉ ốm hợp lệ."},
    {"id": "doc3", "text": "Quy định phạt rò rỉ dữ liệu mật của công ty có mức phạt hành chính tối đa là 500 triệu đồng và chấm dứt hợp đồng."},
    {"id": "doc4", "text": "Thời hạn bảo mật NDA của nhân viên nghỉ việc kéo dài 5 năm kể từ thời điểm chấm dứt hợp đồng lao động chính thức."},
    {"id": "doc5", "text": "Mọi tranh chấp phát sinh từ NDA sẽ được phán quyết bởi Tòa án Nhân dân tại Thành phố Hồ Chí Minh."}
]

# Hàm tính Cosine Similarity thô
def cosine_similarity(text1, text2):
    t1 = re.findall(r'\b\w+\b', text1.lower())
    t2 = re.findall(r'\b\w+\b', text2.lower())
    vocab = list(set(t1 + t2))
    
    v1_dict = {w: t1.count(w) for w in t1}
    v2_dict = {w: t2.count(w) for w in t2}
    
    v1 = [v1_dict.get(word, 0) for word in vocab]
    v2 = [v2_dict.get(word, 0) for word in vocab]
    
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    
    if n1 == 0 or n2 == 0: 
        return 0.0
    return dot / (n1 * n2)

# 1. Giai đoạn 1: Query Rewriting sử dụng Ollama Cục Bộ
def rewrite_query(raw_query, model_name="llama3"):
    url = "http://localhost:11434/api/chat"
    
    prompt = f"""Bạn là một trợ lý RAG chuyên nghiệp. Nhiệm vụ của bạn là viết lại câu hỏi thô của người dùng thành một câu hỏi đầy đủ chủ ngữ, vị ngữ, sửa lỗi chính tả và tối ưu hóa cho tìm kiếm từ khóa ngữ nghĩa.
Chỉ trả về câu hỏi đã được viết lại, không giải thích gì thêm.

Câu hỏi thô: "{raw_query}"
Câu hỏi viết lại:"""

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            return res["message"]["content"].strip().replace('"', '')
    except Exception:
        # Nếu không có Ollama đang chạy, trả về câu hỏi gốc làm fallback
        return raw_query

# 2. Giai đoạn 2: Dense/Sparse Vector Search (Bi-Encoder Retrieval)
def retrieve_top_k(query, docs, k=3):
    results = []
    for doc in docs:
        sim = cosine_similarity(query, doc["text"])
        results.append((doc, sim))
    # Sắp xếp theo độ tương đồng giảm dần
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:k]

# 3. Giai đoạn 3: Cross-Encoder Reranking
def cross_encoder_rerank(query, retrieved_items):
    print("\n--- Bắt đầu giai đoạn Reranking với Cross-Encoder ---")
    reranked_results = []
    
    for doc, bi_score in retrieved_items:
        # Cross-Encoder tính toán tương tác từ khóa giao thoa chi tiết giữa câu hỏi và đoạn văn
        q_words = set(re.findall(r'\b\w+\b', query.lower()))
        d_words = set(re.findall(r'\b\w+\b', doc["text"].lower()))
        
        # Chỉ số trùng lặp từ khóa Jaccard Index làm điểm tương tác chéo
        intersection = q_words.intersection(d_words)
        union = q_words.union(d_words)
        cross_score = len(intersection) / len(union) if union else 0.0
        
        # Điểm số kết hợp (Hybrid score)
        final_score = (0.3 * bi_score) + (0.7 * cross_score)
        
        print(f"  * Document ID: {doc['id']}")
        print(f"    - Bi-Encoder (Cosine): {bi_score:.4f}")
        print(f"    - Cross-Encoder (Jaccard): {cross_score:.4f}")
        print(f"    - Điểm số kết hợp cuối cùng: {final_score:.4f}")
        
        reranked_results.append((doc, final_score))
        
    # Xếp hạng lại toàn bộ danh sách dựa trên điểm số kết hợp
    reranked_results.sort(key=lambda x: x[1], reverse=True)
    return reranked_results

# 4. Giai đoạn 4: Tổng hợp Generation gửi Ollama
def generate_response(query, context, model_name="llama3"):
    url = "http://localhost:11434/api/chat"
    enriched_prompt = f"Ngữ cảnh:\n{context}\n\nCâu hỏi: {query}\nTrả lời:"
    
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": enriched_prompt}],
        "stream": False
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            return res["message"]["content"]
    except Exception as e:
        return f"[Lỗi Generation]: {str(e)}"

if __name__ == "__main__":
    # Câu hỏi thô của người dùng (sai chính tả, tối nghĩa)
    raw_user_query = "nghi om can nhan slack luc nao"
    
    print(f"🙋 [Bước 1: Nhận câu hỏi thô từ người dùng]: '{raw_user_query}'")
    
    # Thực hiện Query Rewriter
    refined_query = rewrite_query(raw_user_query)
    print(f"📝 [Bước 2: Kết quả Query Rewriter]: '{refined_query}'")
    
    # Truy xuất tài liệu sơ bộ (Bi-Encoder)
    retrieved = retrieve_top_k(refined_query, DOCUMENTS, k=4)
    print("\n🔎 [Bước 3: Top 4 tài liệu lọc được từ Vector DB (Bi-Encoder)]:")
    for idx, (doc, score) in enumerate(retrieved):
        print(f"  [{idx}] ID: {doc['id']} (Cosine: {score:.4f}) -> {doc['text']}")
        
    # Chạy bộ Reranker
    reranked = cross_encoder_rerank(refined_query, retrieved)
    
    print("\n🏆 [Bước 4: Thứ hạng tài liệu sau khi sắp xếp lại (Rerank)]:")
    for idx, (doc, score) in enumerate(reranked):
        print(f"  [{idx}] ID: {doc['id']} (Score: {score:.4f}) -> {doc['text']}")
        
    # Lấy top 1 tài liệu tốt nhất làm ngữ cảnh
    best_context = reranked[0][0]["text"]
    
    # Sinh câu trả lời cuối cùng
    print("\n🤖 [Bước 5: Gọi Ollama cục bộ tổng hợp câu trả lời]...")
    ai_answer = generate_response(refined_query, best_context)
    print(f"👉 [AI Phản hồi]: {ai_answer}\n")
