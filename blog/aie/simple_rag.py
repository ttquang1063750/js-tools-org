import urllib.request
import json
import math
import re

# 1. Cơ sở dữ liệu tài liệu tri thức nội bộ giả lập (Thực tế đọc từ file .txt)
KNOWLEDGE_BASE = """
Quy trình xin nghỉ phép của công ty JS-Tools:
Nhân viên cần gửi đơn xin nghỉ phép trước tối thiểu 3 ngày làm việc đối với nghỉ phép năm thông thường.
Trong trường hợp nghỉ ốm đột xuất, nhân viên phải thông báo cho quản lý trực tiếp qua Slack trước 9h00 sáng của ngày nghỉ và nộp giấy xác nhận của bác sĩ khi quay trở lại làm việc.
Nếu nghỉ phép dài hạn trên 5 ngày, đơn nghỉ phép bắt buộc phải được ký phê duyệt bởi Giám đốc điều hành (CEO).
Mọi đơn từ xin nghỉ phép đều phải được nhập dữ liệu chính thức lên hệ thống HR-Portal trực tuyến của công ty để bộ phận nhân sự chấm công cuối tháng.
"""

# 2. Xây dựng bộ máy TF-IDF & Cosine Similarity bằng Python thuần túy
class SimpleTFIDF:
    def __init__(self, documents):
        self.documents = [self._tokenize(doc) for doc in documents]
        self.vocab = list(set([word for doc in self.documents for word in doc]))
        self.idf = self._calculate_idf()
        
    def _tokenize(self, text):
        # Làm sạch và tách từ cơ bản bằng Regular Expression
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        return words
        
    def _calculate_idf(self):
        idf = {}
        total_docs = len(self.documents)
        for term in self.vocab:
            # Đếm số lượng tài liệu chứa từ term
            containing_docs = sum(1 for doc in self.documents if term in doc)
            # Công thức IDF
            idf[term] = math.log(total_docs / (1 + containing_docs))
        return idf
        
    def transform(self, doc_text):
        tokens = self._tokenize(doc_text)
        vector = []
        doc_len = len(tokens)
        
        for term in self.vocab:
            if doc_len == 0:
                vector.append(0.0)
                continue
            # Tính TF
            tf = tokens.count(term) / doc_len
            # Tính TF-IDF
            tfidf = tf * self.idf.get(term, 0.0)
            vector.append(tfidf)
        return vector

def cosine_similarity(v1, v2):
    # Tính tích vô hướng của hai vector
    dot_product = sum(a * b for a, b in zip(v1, v2))
    
    # Tính độ dài vector L2 Norm
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(b * b for b in v2))
    
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

# 3. Kỹ thuật chia nhỏ tài liệu (Chunking)
def chunk_text(text, chunk_size=150, overlap=30):
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        # Trượt bước nhảy trừ đi khoảng overlap chồng gối
        start += (chunk_size - overlap)
        
    return chunks

# 4. Giao tiếp với API Ollama cục bộ
def query_ollama(prompt, context, model_name="llama3"):
    url = "http://localhost:11434/api/chat"
    
    # Lắp ghép prompt RAG hoàn chỉnh nhúng Context tìm được
    enriched_prompt = f"""Hãy trả lời câu hỏi dựa duy nhất vào phần Ngữ cảnh được cung cấp dưới đây. Nếu thông tin không có trong ngữ cảnh, hãy trả lời 'Tôi không tìm thấy thông tin này trong tài liệu'.

Ngữ cảnh:
{context}

Câu hỏi: {prompt}
Câu trả lời của bạn:"""

    payload = {
        "model": model_name,
        "messages": [
            {"role": "user", "content": enriched_prompt}
        ],
        "stream": False
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["message"]["content"]
    except Exception as e:
        return f"[Lỗi gọi Ollama]: {str(e)}. Hãy chắc chắn bạn đã khởi động Ollama."

# 5. Đường ống RAG tích hợp
def run_rag_pipeline(query):
    print(f"\n🙋 [Câu hỏi của người dùng]: '{query}'")
    
    # Bước 1: Chia nhỏ tài liệu tri thức thành các chunks
    chunks = chunk_text(KNOWLEDGE_BASE, chunk_size=150, overlap=30)
    print(f"-> Đã phân tách tài liệu thành {len(chunks)} chunks ngữ cảnh.")
    
    # Bước 2: Khởi tạo mô hình TF-IDF trên các chunks
    search_engine = SimpleTFIDF(chunks)
    
    # Bước 3: Biến đổi câu hỏi sang dạng vector
    query_vector = search_engine.transform(query)
    
    # Bước 4: So khớp tương đồng Cosine Similarity để tìm chunk tốt nhất
    best_similarity = -1.0
    best_chunk = ""
    
    for chunk in chunks:
        chunk_vector = search_engine.transform(chunk)
        sim = cosine_similarity(query_vector, chunk_vector)
        if sim > best_similarity:
            best_similarity = sim
            best_chunk = chunk
            
    print(f"🎯 [Tìm kiếm ngữ cảnh tương đồng nhất] (Độ khớp: {best_similarity:.4f}):")
    print(f"   Context: \"{best_chunk[:100]}...\"")
    
    # Bước 5: Gọi Ollama cục bộ tổng hợp câu trả lời dựa trên ngữ cảnh trích xuất
    print("🤖 Đang gọi Ollama local để sinh câu trả lời phản hồi...")
    answer = query_ollama(prompt=query, context=best_chunk)
    print(f"👉 [Phản hồi từ AI]: {answer}\n")

if __name__ == "__main__":
    # Kịch bản 1: Câu hỏi có trong tài liệu
    query_1 = "Tôi muốn nghỉ 10 ngày thì ai duyệt đơn nghỉ phép?"
    run_rag_pipeline(query_1)
    
    # Kịch bản 2: Câu hỏi hoàn toàn nằm ngoài tài liệu
    query_2 = "Công ty thành lập vào năm nào?"
    run_rag_pipeline(query_2)
