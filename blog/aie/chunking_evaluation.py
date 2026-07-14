import re
import math

# Văn bản thử nghiệm chứa thông tin điều khoản bảo mật nội bộ
DOCUMENT = """
Hợp đồng bảo mật thông tin (NDA) của JS-Tools quy định rõ:
[Điều 1] Mọi tài liệu thiết kế hệ thống và mã nguồn dự án đều được phân loại là Mật.
Nhân viên không được chia sẻ thông tin này ra ngoài dưới bất kỳ hình thức nào.
[Điều 2] Mức phạt vi phạm hành chính đối với trường hợp rò rỉ dữ liệu khách hàng lên tới 500,000,000 VND.
Hành vi vi phạm nghiêm trọng có thể dẫn đến việc chấm dứt hợp đồng lao động lập tức mà không bồi thường.
[Điều 3] Thời hạn hiệu lực của thỏa thuận bảo mật kéo dài 5 năm kể từ ngày chấm dứt hợp đồng làm việc tại công ty.
Mọi tranh chấp sẽ được giải quyết tại Tòa án Nhân dân Thành phố Hồ Chí Minh.
"""

# Bộ tách từ và tính toán Cosine Similarity thô
def tokenize(text):
    return re.findall(r'\b\w+\b', text.lower())

def cosine_similarity(text1, text2):
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    
    vocab = list(set(tokens1 + tokens2))
    v1_dict = {}
    v2_dict = {}
    
    for t in tokens1: 
        v1_dict[t] = v1_dict.get(t, 0) + 1
    for t in tokens2: 
        v2_dict[t] = v2_dict.get(t, 0) + 1
        
    v1 = [v1_dict.get(word, 0) for word in vocab]
    v2 = [v2_dict.get(word, 0) for word in vocab]
    
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    
    if norm1 == 0 or norm2 == 0: 
        return 0.0
    return dot_product / (norm1 * norm2)

# 1. Chiến thuật Fixed-size Chunking (Cắt cứng theo số lượng ký tự)
def fixed_size_chunk(text, chunk_size=120):
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i+chunk_size].strip())
    return chunks

# 2. Chiến thuật Recursive Character-based Chunking (Cắt thông minh theo dấu chấm câu)
def recursive_character_chunk(text, chunk_size=120):
    # Chia theo dấu chấm câu trước để giữ trọn câu
    sentences = re.split(r'(?<=[.\n])\s+', text.strip())
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if not sentence: 
            continue
        # Nếu cộng dồn vượt quá size thì đẩy chunk cũ đi
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk += " " + sentence
            
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

# 3. Chiến thuật Semantic Chunking (Giả lập cắt dựa theo độ tương đồng câu)
def semantic_chunk(text, similarity_threshold=0.20):
    sentences = [s.strip() for s in re.split(r'(?<=[.\n])\s+', text.strip()) if s.strip()]
    chunks = []
    
    if not sentences: 
        return chunks
    
    current_chunk = sentences[0]
    for i in range(1, len(sentences)):
        # Đo độ tương đồng ngữ nghĩa giữa câu hiện tại và câu tiếp theo
        sim = cosine_similarity(sentences[i-1], sentences[i])
        
        # Nếu độ tương đồng giảm sâu dưới ngưỡng -> Cắt chunk mới
        if sim < similarity_threshold:
            chunks.append(current_chunk)
            current_chunk = sentences[i]
        else:
            current_chunk += " " + sentences[i]
            
    chunks.append(current_chunk)
    return chunks

# Bộ đánh giá tìm kiếm thử nghiệm
def evaluate_retrieval(query, chunks, chunking_name):
    print(f"\n--- Đánh giá kết quả của chiến thuật: {chunking_name} ---")
    print(f"Tổng số chunks tạo ra: {len(chunks)}")
    
    best_similarity = -1.0
    best_chunk = ""
    
    # Tìm kiếm đoạn văn có Cosine Similarity cao nhất đối với câu hỏi
    for idx, chunk in enumerate(chunks):
        sim = cosine_similarity(query, chunk)
        print(f"  * Chunk [{idx}] ({len(chunk)} ký tự): \"{chunk[:60]}...\" -> Độ khớp: {sim:.4f}")
        if sim > best_similarity:
            best_similarity = sim
            best_chunk = chunk
            
    print(f"🏆 Kết quả khớp nhất: \"{best_chunk}\" (Độ khớp: {best_similarity:.4f})")

if __name__ == "__main__":
    query_test = "Mức phạt tiền vi phạm rò rỉ dữ liệu là bao nhiêu?"
    
    print("=== ĐÁNH GIÁ CHẤT LƯỢNG CHUNKING TRÊN TÀI LIỆU NDA ===")
    print(f"Câu hỏi kiểm thử: '{query_test}'")
    
    # Thực hiện cắt
    chunks_fixed = fixed_size_chunk(DOCUMENT, chunk_size=120)
    chunks_recursive = recursive_character_chunk(DOCUMENT, chunk_size=120)
    chunks_semantic = semantic_chunk(DOCUMENT, similarity_threshold=0.20)
    
    # Đánh giá so sánh trực quan
    evaluate_retrieval(query_test, chunks_fixed, "Fixed-size Chunking (120 ký tự)")
    evaluate_retrieval(query_test, chunks_recursive, "Recursive Character Chunking")
    evaluate_retrieval(query_test, chunks_semantic, "Semantic Chunking (Similarity Threshold 0.20)")
