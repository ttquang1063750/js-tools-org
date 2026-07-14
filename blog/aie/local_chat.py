import urllib.request
import json
import sys

def stream_local_chat(prompt, model_name="llama3"):
    url = "http://localhost:11434/api/chat"
    
    # Thiết lập payload gửi lên API Ollama local
    payload = {
        "model": model_name,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": True # Bật chế độ stream để nhận chữ chạy dần
    }
    
    # Chuyển đổi dữ liệu sang định dạng JSON và mã hóa nhị phân
    data = json.dumps(payload).encode("utf-8")
    
    # Tạo request gửi đi
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\n[AI - Model: {model_name} đang suy luận]: ", end="")
    sys.stdout.flush()
    
    try:
        # Thực hiện gọi API
        with urllib.request.urlopen(req) as response:
            # Đọc dữ liệu trả về theo từng dòng stream (Server-Sent Events)
            for line in response:
                if line:
                    # Giải mã dòng dữ liệu JSON thô nhận được
                    decoded_line = line.decode("utf-8").strip()
                    json_data = json.loads(decoded_line)
                    
                    # Trích xuất nội dung chữ được sinh ra
                    chunk = json_data.get("message", {}).get("content", "")
                    
                    # Ghi trực tiếp ra console không tạo dòng mới
                    sys.stdout.write(chunk)
                    sys.stdout.flush()
            print("\n")
    except urllib.error.URLError as e:
        print(f"\n[Lỗi kết nối] Không thể kết nối tới Ollama tại {url}.")
        print("Vui lòng kiểm tra chắc chắn rằng ứng dụng Ollama đã được khởi động và chạy nền trên máy của bạn.")
    except Exception as e:
        print(f"\n[Lỗi hệ thống]: {str(e)}")

if __name__ == "__main__":
    print("=== Trình kiểm tra kết nối API Ollama Cục Bộ ===")
    
    # Câu hỏi thử nghiệm gửi tới mô hình offline
    test_prompt = "Hãy giải thích ngắn gọn trong 1 câu tại sao bầu trời có màu xanh."
    
    # Gọi hàm thực thi stream
    stream_local_chat(prompt=test_prompt, model_name="llama3")
