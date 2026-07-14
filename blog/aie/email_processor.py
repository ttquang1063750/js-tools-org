import json

# 1. Định nghĩa các hàm công cụ (Tools) cục bộ của hệ thống
def send_alert_email(recipient_email, subject, alert_content):
    """
    Hàm cục bộ thực hiện hành động gửi email cảnh báo thật.
    """
    print(f"\n⚡ [HÀNH ĐỘNG HỆ THỐNG] Đang gửi Email cảnh báo nguy cấp...")
    print(f"   - Gửi tới: {recipient_email}")
    print(f"   - Tiêu đề: {subject}")
    print(f"   - Nội dung: {alert_content}")
    print(f"✔️ Gửi email thành công!")
    return json.dumps({"status": "delivered", "recipient": recipient_email})

# 2. Giả lập Client API hỗ trợ cả Structured Outputs và Function Calling
class MockStructuredLLM:
    def __init__(self):
        pass
        
    def process_request(self, messages, tools=None):
        # Lấy nội dung email của User gửi lên
        user_content = messages[-1]["content"]
        
        # Giả lập phân tích nội dung email để trả về dữ liệu có cấu trúc (Structured Output)
        print("\n[AI] Đang phân tích email bằng Structured Outputs...")
        
        # Mẫu 1: Email bình thường
        if "cảm ơn" in user_content.lower() or "hỏi thông tin" in user_content.lower():
            structured_data = {
                "sender": "khachhang_normal@gmail.com",
                "urgency": "low",
                "summary": "Khách gửi email cảm ơn dịch vụ và hỏi thêm thông tin khóa học mới."
            }
            return {"type": "structured", "content": structured_data}
            
        # Mẫu 2: Email nguy cấp (Có lỗi hệ thống hoặc yêu cầu hoàn tiền gấp)
        else:
            structured_data = {
                "sender": "dev_alerts@company.com",
                "urgency": "high",
                "summary": "Hệ thống gặp sự cố Database sập nguồn nghiêm trọng lúc 3h sáng."
            }
            
            # Nếu khẩn cấp ở mức High, AI quyết định kích hoạt Function Calling
            print("[AI] Phát hiện email khẩn cấp! Quyết định kích hoạt Tool Call...")
            tool_call = {
                "name": "send_alert_email",
                "arguments": {
                    "recipient_email": "admin_ops@company.com",
                    "subject": "CẢNH BÁO NGUY CẤP: " + structured_data["summary"][:40],
                    "alert_content": f"Báo cáo từ {structured_data['sender']}: {structured_data['summary']}"
                }
            }
            return {
                "type": "tool_call",
                "content": structured_data,
                "tool_call": tool_call
            }

# 3. Quản lý chu trình xử lý (Loop)
class EmailProcessingPipeline:
    def __init__(self):
        self.model = MockStructuredLLM()
        # Đăng ký các hàm thực thi cục bộ
        self.available_tools = {
            "send_alert_email": send_alert_email
        }
        
    def run(self, raw_email_body):
        print(f"\n--- Đang xử lý email mới ---")
        print(f"Nội dung thô: '{raw_email_body}'")
        
        # Khởi tạo tin nhắn gửi lên AI
        messages = [
            {"role": "system", "content": "Bạn là bộ lọc email phân loại thông tin chuẩn xác."},
            {"role": "user", "content": raw_email_body}
        ]
        
        # Bước 1 & 2: Gửi yêu cầu và nhận phản hồi của AI
        ai_response = self.model.process_request(messages)
        
        # In ra thông tin có cấu trúc đã trích xuất
        metadata = ai_response["content"]
        print(f"📊 [Dữ liệu cấu trúc trích xuất]:")
        print(f"   - Sender: {metadata['sender']}")
        print(f"   - Urgency: {metadata['urgency']}")
        print(f"   - Summary: {metadata['summary']}")
        
        # Bước 3: Kiểm tra xem AI có yêu cầu gọi hàm (Function Call) hay không
        if ai_response["type"] == "tool_call":
            tool_call_request = ai_response["tool_call"]
            func_name = tool_call_request["name"]
            func_args = tool_call_request["arguments"]
            
            # Truy vấn hàm cục bộ đã đăng ký
            if func_name in self.available_tools:
                local_func = self.available_tools[func_name]
                
                # Thực thi hàm cục bộ với các đối số do AI cung cấp
                observation = local_func(
                    recipient_email=func_args["recipient_email"],
                    subject=func_args["subject"],
                    alert_content=func_args["alert_content"]
                )
                
                # Bước 4: Gửi kết quả quan sát ngược lại cho AI để tổng hợp câu trả lời cuối
                messages.append({
                    "role": "assistant",
                    "content": f"Yêu cầu gọi hàm {func_name} với đối số {func_args}"
                })
                messages.append({
                    "role": "tool",
                    "name": func_name,
                    "content": observation
                })
                
                print("\n[AI] Đang tổng hợp câu trả lời cuối dựa trên kết quả gọi hàm...")
                final_answer = f"Đã trích xuất thông tin email thành công và tự động kích hoạt gửi cảnh báo khẩn cấp tới {func_args['recipient_email']}. Trạng thái: {observation}."
                print(f"Phản hồi cuối của hệ thống: {final_answer}")
            else:
                print(f"Lỗi: Không tìm thấy hàm cục bộ nào có tên '{func_name}'.")
        else:
            print("\n[AI] Email bình thường. Không cần thực thi hành động khẩn cấp.")
            print("Phản hồi cuối của hệ thống: Đã lưu thông tin email bình thường vào database.")

if __name__ == "__main__":
    pipeline = EmailProcessingPipeline()
    
    # Kịch bản 1: Email hỏi đáp bình thường
    normal_email = "Xin chào, tôi cảm ơn đội ngũ kỹ thuật rất nhiều. Tôi muốn hỏi thêm thông tin về lịch khai giảng khóa sau."
    pipeline.run(normal_email)
    
    # Kịch bản 2: Email báo lỗi hệ thống khẩn cấp
    critical_email = "Cảnh báo khẩn cấp: Cơ sở dữ liệu chính của hệ thống đang bị treo và sập nguồn, không thể kết nối từ 3 giờ sáng!"
    pipeline.run(critical_email)
