import time

# Giả lập một LLM API Client cục bộ để chương trình chạy độc lập không cần Internet/API Key thực tế
class MockLLMClient:
    def __init__(self):
        # Định nghĩa một số mẫu câu trả lời thông minh dựa trên từ khóa trong cuộc hội thoại
        self.responses = {
            "hello": "Xin chào! Tôi là trợ lý AI thực chiến. Tôi có thể giúp gì cho bạn?",
            "chào": "Xin chào! Tôi là trợ lý AI thực chiến. Tôi có thể giúp gì cho bạn?",
            "toán": "Toán học là ngôn ngữ của vũ trụ. Bạn cần tôi hỗ trợ giải bài toán nào?",
            "code": "Lập trình là cách chúng ta giao tiếp với máy tính. Bạn muốn viết code bằng ngôn ngữ gì?",
            "ai": "Trí tuệ nhân tạo đang thay đổi thế giới thông qua kiến trúc mạng Transformer và LLMs."
        }

    def generate_response(self, messages, temperature=0.7):
        # Trích xuất tin nhắn cuối cùng của người dùng
        user_message = messages[-1]["content"].lower()
        
        # Tìm kiếm từ khóa để phản hồi
        reply = "Tôi đã tiếp nhận thông tin của bạn. Lịch sử hội thoại hiện tại vẫn đang được lưu vết trong bộ đệm ngữ cảnh."
        for key, resp in self.responses.items():
            if key in user_message:
                reply = resp
                break
                
        # Giả lập độ trễ suy luận của mô hình
        time.sleep(0.5)
        return reply

class ContextChatbot:
    def __init__(self, system_prompt, max_token_limit=150):
        self.client = MockLLMClient()
        self.max_token_limit = max_token_limit
        
        # Lời nhắc hệ thống cố định luôn nằm ở đầu mảng tin nhắn
        self.system_message = {"role": "system", "content": system_prompt}
        self.history = [] # Lưu trữ lịch sử chat của User và Assistant
        
    def estimate_tokens(self, text):
        # Ước lượng thô: 1 từ tiếng Việt ~ 1.3 tokens (phương pháp thô thực tế khi không có tokenizer thực)
        return int(len(text.split()) * 1.3)
        
    def get_total_tokens(self):
        # Tính tổng số tokens của toàn bộ cuộc hội thoại hiện tại (gồm cả System Prompt)
        total = self.estimate_tokens(self.system_message["content"])
        for msg in self.history:
            total += self.estimate_tokens(msg["content"])
        return total

    def manage_context_window(self):
        # Cơ chế Sliding Window: Nếu tổng số token vượt quá giới hạn, tiến hành loại bỏ các tin nhắn cũ
        # Nhưng bắt buộc phải giữ lại phần tử System Message ở đầu
        while self.get_total_tokens() > self.max_token_limit and len(self.history) > 0:
            removed_msg = self.history.pop(0) # Loại bỏ tin nhắn cũ nhất ở đầu lịch sử chat
            print(f"\n[Hệ thống] Đã dọn dẹp tin nhắn cũ để giải phóng bộ nhớ: '{removed_msg['content'][:30]}...'")

    def chat(self, user_input):
        # 1. Thêm tin nhắn của User vào lịch sử
        self.history.append({"role": "user", "content": user_input})
        
        # 2. Quản lý bộ đệm ngữ cảnh để tránh tràn bộ nhớ trước khi gọi API
        self.manage_context_window()
        
        # 3. Lắp ráp mảng hội thoại hoàn chỉnh gửi lên API
        api_payload = [self.system_message] + self.history
        
        # 4. Gọi API giả lập nhận phản hồi
        assistant_reply = self.client.generate_response(api_payload, temperature=0.7)
        
        # 5. Lưu phản hồi của Assistant vào lịch sử
        self.history.append({"role": "assistant", "content": assistant_reply})
        
        return assistant_reply

if __name__ == "__main__":
    print("=== Khởi tạo Chatbot ghi nhớ ngữ cảnh ===")
    system_prompt = "Bạn là một trợ lý AI chuyên nghiệp có tính cách vui vẻ và súc tích."
    
    # Khởi tạo chatbot với giới hạn dung lượng bộ đệm nhỏ (150 tokens) để dễ quan sát cơ chế trượt
    chatbot = ContextChatbot(system_prompt=system_prompt, max_token_limit=80)
    print(f"Giới hạn bộ đệm ngữ cảnh: {chatbot.max_token_limit} tokens.\n")
    
    # Giả lập chuỗi hội thoại liên tục của người dùng
    user_inputs = [
        "Xin chào trợ lý, bạn khỏe không?",
        "Tôi muốn hỏi một chút kiến thức về Toán học AI.",
        "Tôi cũng cần viết một số đoạn code Python.",
        "Trí tuệ nhân tạo AI là gì?",
        "Cảm ơn bạn rất nhiều nhé."
    ]
    
    for idx, inp in enumerate(user_inputs):
        print(f"User: {inp}")
        reply = chatbot.chat(inp)
        print(f"Assistant: {reply}")
        print(f"-> Tổng token hiện tại trong bộ nhớ chat: {chatbot.get_total_tokens()}\n")
        
    print("=== Toàn bộ lịch sử hội thoại còn lưu giữ trong RAM: ===")
    for msg in chatbot.history:
        print(f"[{msg['role'].upper()}]: {msg['content']}")
