import json
import csv
import os

def clean_text(text):
    """
    Hàm làm sạch văn bản cơ bản
    """
    if not isinstance(text, str):
        return ""
    # Loại bỏ khoảng trắng thừa đầu cuối và chuyển về dạng viết thường
    return text.strip().lower()

def run_cleaning_pipeline(input_path, output_path):
    print("--- Bắt đầu quy trình xử lý dữ liệu ---")
    
    # Kiểm tra tệp tin đầu vào có tồn tại không
    if not os.path.exists(input_path):
        print(f"Lỗi: Tệp {input_path} không tồn tại.")
        return

    # Đọc dữ liệu JSON thô
    with open(input_path, "r", encoding="utf-8") as file:
        raw_data = json.load(file)
        
    cleaned_records = []
    
    # Lặp qua từng bản ghi dữ liệu bằng vòng lặp Python
    for index, record in enumerate(raw_data):
        user_id = record.get("id", index)
        raw_comment = record.get("comment", "")
        
        # Gọi hàm làm sạch
        clean_comment = clean_text(raw_comment)
        
        cleaned_records.append({
            "user_id": user_id,
            "cleaned_comment": clean_comment
        })
        
    # Ghi dữ liệu sạch ra tệp CSV để huấn luyện mô hình
    with open(output_path, "w", newline="", encoding="utf-8") as csv_file:
        fieldnames = ["user_id", "cleaned_comment"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        
        # Ghi tiêu đề cột
        writer.writeheader()
        
        # Ghi các dòng dữ liệu
        writer.writerows(cleaned_records)
        
    print(f"Xử lý thành công! Đã ghi nhận {len(cleaned_records)} bản ghi sạch vào {output_path}")

# Kiểm thử quy trình chạy
if __name__ == "__main__":
    # Tạo tệp JSON mẫu để test
    mock_data = [
        {"id": 101, "comment": "  Mô hình AI chạy RẤT NHANH!  "},
        {"id": 102, "comment": "Tôi Cần hỗ Trợ kỹ thuật gấp...   "},
        {"id": 103, "comment": "   Tuyệt VỜI, 10 điểm. "}
    ]
    
    with open("raw_feedback.json", "w", encoding="utf-8") as f:
        json.dump(mock_data, f, ensure_ascii=False, indent=2)
        
    # Chạy pipeline làm sạch dữ liệu
    run_cleaning_pipeline("raw_feedback.json", "cleaned_feedback.csv")
