import torch
import torch.nn as nn

# 1. Định nghĩa từ điển hệ thống (Vocabulary)
vocab = {
    "vua": 0,
    "hoàng_hậu": 1,
    "nam": 2,
    "nữ": 3,
    "máy_tính": 4,
    "lập_trình": 5,
    "trí_tuệ_nhân_tạo": 6,
    "cà_phê": 7,
    "trà": 8
}
inverse_vocab = {v: k for k, v in vocab.items()}

# 2. Khởi tạo ma trận nhúng giả lập với số chiều d = 4
# Trọng số được thiết kế thủ công để mô tả mối quan hệ ngữ nghĩa rõ nét:
# Chiều 0: Hoàng gia, Chiều 1: Giới tính (Dương: Nam, Âm: Nữ), Chiều 2: Công nghệ, Chiều 3: Đồ uống.
embedding_weights = torch.tensor([
    [1.0,  0.9,  0.0,  0.0],  # vua
    [1.0, -0.9,  0.0,  0.0],  # hoàng_hậu
    [0.0,  1.0,  0.0,  0.0],  # nam
    [0.0, -1.0,  0.0,  0.0],  # nữ
    [0.0,  0.0,  1.0,  0.0],  # máy_tính
    [0.0,  0.0,  0.9,  0.0],  # lập_trình
    [0.0,  0.1,  1.0,  0.0],  # trí_tuệ_nhân_tạo
    [0.0,  0.0,  0.0,  1.0],  # cà_phê
    [0.0,  0.0,  0.0,  0.9]   # trà
], dtype=torch.float32)

# 3. Tạo lớp nn.Embedding của PyTorch và gán trọng số
vocab_size, embedding_dim = embedding_weights.shape
embed = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embedding_dim)
# Gán trọng số cố định không huấn luyện thêm (eval mode)
embed.weight = nn.Parameter(embedding_weights, requires_grad=False)

def calculate_cosine_similarity(vector_a, matrix_b):
    # vector_a: (1, d)
    # matrix_b: (V, d)
    # Tích vô hướng từng phần tử (Dot product): (V,)
    dot_product = torch.sum(vector_a * matrix_b, dim=1)
    
    # Tính Norm L2
    norm_a = torch.norm(vector_a, p=2, dim=1)       # (1,)
    norm_b = torch.norm(matrix_b, p=2, dim=1)       # (V,)
    
    # Tránh chia cho 0
    similarity = dot_product / (norm_a * norm_b + 1e-8)
    return similarity

def find_most_similar(target_word, top_n=3):
    if target_word not in vocab:
        print(f"Từ '{target_word}' không có trong từ điển.")
        return
        
    target_idx = vocab[target_word]
    # Lấy vector nhúng của từ mục tiêu (1, d)
    target_vector = embed(torch.tensor([target_idx]))
    
    # Lấy toàn bộ ma trận trọng số nhúng (V, d)
    all_vectors = embed.weight
    
    # Tính điểm tương đồng Cosine của từ mục tiêu với toàn bộ từ điển
    scores = calculate_cosine_similarity(target_vector, all_vectors)
    
    # Sắp xếp điểm số từ cao xuống thấp
    top_scores, top_indices = torch.topk(scores, k=len(vocab))
    
    print(f"--- Top các từ tương đồng nhất với '{target_word}': ---")
    count = 0
    for score, idx in zip(top_scores.tolist(), top_indices.tolist()):
        word = inverse_vocab[idx]
        # Bỏ qua chính từ đang truy vấn
        if word == target_word:
            continue
        print(f"{count+1}. {word:<20} | Cosine Score: {score:.4f}")
        count += 1
        if count >= top_n:
            break
    print()

if __name__ == "__main__":
    # Tìm kiếm từ đồng nghĩa đơn giản
    find_most_similar("cà_phê", top_n=2)
    find_most_similar("máy_tính", top_n=2)
    
    # 4. Thực hành tính đại số vector ngữ nghĩa kinh điển:
    # Vector lý thuyết: Vua - Nam + Nữ
    vua_idx = torch.tensor([vocab["vua"]])
    nam_idx = torch.tensor([vocab["nam"]])
    nu_idx = torch.tensor([vocab["nữ"]])
    
    analogy_vector = embed(vua_idx) - embed(nam_idx) + embed(nu_idx) # (1, 4)
    
    # So sánh vector kết quả với toàn bộ từ điển
    analogy_scores = calculate_cosine_similarity(analogy_vector, embed.weight)
    best_idx = torch.argmax(analogy_scores).item()
    
    print("=== Phép toán đại số từ vựng (Word Analogy) ===")
    print("Công thức: Vua - Nam + Nữ")
    print(f"Từ có vector gần nhất trong từ điển: '{inverse_vocab[best_idx]}' (Điểm Cosine: {analogy_scores[best_idx]:.4f})")
