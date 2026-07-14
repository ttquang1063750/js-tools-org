import json
import re

# 1. Tập dữ liệu kiểm thử giả lập (Test dataset)
# Mỗi bản ghi chứa: Câu hỏi, Context tìm được, Câu trả lời của LLM, và Đáp án chuẩn (Ground Truth)
TEST_DATASET = [
    {
        "question": "Thuật toán PagedAttention trong vLLM dùng để làm gì?",
        "context": "vLLM sử dụng thuật toán PagedAttention để phân chia bộ đệm Key-Value (KV Cache) thành các khối cố định trên bộ nhớ VRAM, giúp loại bỏ hiện tượng phân mảnh bộ nhớ vật lý.",
        "answer": "PagedAttention dùng để phân chia bộ đệm KV Cache thành các khối bộ nhớ cố định giúp tối ưu hóa VRAM và tránh phân mảnh.",
        "ground_truth": "PagedAttention dùng để giải quyết vấn đề phân mảnh bộ nhớ KV Cache bằng cách chia nhỏ nó thành các khối cố định trên GPU VRAM."
    },
    {
        "question": "Định nghĩa kỹ thuật LoRA?",
        "context": "LoRA là kỹ thuật đóng băng ma trận trọng số gốc của LLM và đưa vào các ma trận hạng thấp song song để huấn luyện, giúp giảm hàng trăm lần số lượng tham số cập nhật.",
        "answer": "LoRA là kỹ thuật tăng nhiệt độ temperature để mô hình ngôn ngữ lớn hoạt động sáng tạo hơn.",
        "ground_truth": "LoRA là kỹ thuật tinh chỉnh tham số hiệu quả bằng cách huấn luyện các ma trận phân rã hạng thấp song song và đóng băng trọng số gốc."
    }
]

# Helper function làm sạch văn bản và bóc tách các từ khóa/thực thể
def get_keywords(text):
    text = text.lower()
    # Loại bỏ dấu câu và bóc tách thành tập các từ đơn
    words = re.findall(r'\b\w+\b', text)
    # Lọc bỏ các stopword tiếng Việt cơ bản để giữ lại từ mang ngữ nghĩa
    stopwords = {"và", "để", "của", "là", "trong", "cho", "có", "các", "được", "bằng", "với", "ra"}
    return set([w for w in words if w not in stopwords])

# 2. Hàm tính toán chỉ số Faithfulness (Độ trung thực)
def calculate_faithfulness(answer, context):
    ans_words = get_keywords(answer)
    ctx_words = get_keywords(context)
    
    if not ans_words:
        return 0.0
        
    # Tính tỷ lệ từ khóa của câu trả lời nằm trong tài liệu Context dẫn chứng
    overlap = ans_words.intersection(ctx_words)
    return len(overlap) / len(ans_words)

# 3. Hàm tính toán chỉ số Context Recall
def calculate_context_recall(context, ground_truth):
    ctx_words = get_keywords(context)
    gt_words = get_keywords(ground_truth)
    
    if not gt_words:
        return 0.0
        
    # Tính tỷ lệ thông tin vàng trong Ground Truth được phủ trong tài liệu Context tìm được
    overlap = gt_words.intersection(ctx_words)
    return len(overlap) / len(gt_words)

# 4. Hàm tính toán chỉ số Answer Relevance (Sự liên quan)
def calculate_answer_relevance(question, answer):
    q_words = get_keywords(question)
    ans_words = get_keywords(answer)
    
    if not q_words:
        return 0.0
        
    # Tính độ giao thoa tương quan giữa từ khóa câu hỏi và câu trả lời (Jaccard Index)
    intersection = q_words.intersection(ans_words)
    union = q_words.union(ans_words)
    return len(intersection) / len(union)

# 5. Hàm chạy đánh giá toàn diện hệ thống
def run_evaluation():
    print("🚀 Đang khởi chạy hệ thống đánh giá RAG tự động...\n")
    
    report_data = []
    
    sum_faithfulness = 0.0
    sum_recall = 0.0
    sum_relevance = 0.0
    
    for idx, sample in enumerate(TEST_DATASET):
        f_score = calculate_faithfulness(sample["answer"], sample["context"])
        rec_score = calculate_context_recall(sample["context"], sample["ground_truth"])
        rel_score = calculate_answer_relevance(sample["question"], sample["answer"])
        
        sum_faithfulness += f_score
        sum_recall += rec_score
        sum_relevance += rel_score
        
        print(f"Lượt Test {idx+1}:")
        print(f"  - Faithfulness: {f_score:.2%}")
        print(f"  - Context Recall: {rec_score:.2%}")
        print(f"  - Answer Relevance: {rel_score:.2%}\n")
        
        report_data.append({
            "id": idx + 1,
            "question": sample["question"],
            "faithfulness": f_score,
            "context_recall": rec_score,
            "answer_relevance": rel_score
        })
        
    n = len(TEST_DATASET)
    avg_f = sum_faithfulness / n
    avg_rec = sum_recall / n
    avg_rel = sum_relevance / n
    
    # 6. Xuất file báo cáo Markdown chất lượng RAG
    report_filename = "rag_evaluation_report.md"
    with open(report_filename, "w", encoding="utf-8") as f:
        f.write("# 📊 Báo Cáo Đánh Giá Chất Lượng Đường Ống RAG\n\n")
        f.write("## 1. Điểm số trung bình toàn hệ thống\n")
        f.write(f"- **Faithfulness Score (Độ trung thực):** {avg_f:.2%}\n")
        f.write(f"- **Context Recall Score (Độ phủ):** {avg_rec:.2%}\n")
        f.write(f"- **Answer Relevance Score (Đúng trọng tâm):** {avg_rel:.2%}\n\n")
        
        f.write("## 2. Chi tiết kết quả từng mẫu test\n")
        f.write("| Lượt test | Faithfulness | Context Recall | Answer Relevance |\n")
        f.write("| :---: | :---: | :---: | :---: |\n")
        for item in report_data:
            f.write(f"| {item['id']} | {item['faithfulness']:.2%} | {item['context_recall']:.2%} | {item['answer_relevance']:.2%} |\n")
            
    print(f"🏆 Đã xuất thành công báo cáo đánh giá vào tệp '{report_filename}'!")

if __name__ == "__main__":
    run_evaluation()
