import urllib.request
import json
import re

# 1. Định nghĩa các công cụ (Tools) mà Agent có thể sử dụng
def calculate(expression):
    """Tính toán kết quả của một biểu thức toán học dạng chuỗi."""
    # Làm sạch chuỗi chỉ cho phép các ký tự toán học an toàn để tránh lỗi bảo mật eval
    clean_expr = re.sub(r'[^0-9+\-*/().\s]', '', expression)
    try:
        # Thực thi biểu thức toán học an toàn
        return str(eval(clean_expr))
    except Exception as e:
        return f"Lỗi tính toán: {str(e)}"

def get_stock_price(symbol):
    """Lấy giá cổ phiếu hiện tại của một mã chứng khoán (Giả lập dữ liệu)."""
    prices = {
        "AAPL": "185.50 USD",
        "GOOGL": "172.30 USD",
        "MSFT": "420.10 USD",
        "TSLA": "175.20 USD"
    }
    return prices.get(symbol.upper(), "Không tìm thấy thông tin mã chứng khoán này.")

# Bản đồ liên kết tên công cụ với hàm thực thi Python
TOOL_MAP = {
    "calculate": calculate,
    "get_stock_price": get_stock_price
}

# 2. Xây dựng System Prompt định hướng ReAct cho LLM
SYSTEM_PROMPT = """Bạn là một AI Agent hoạt động theo vòng lặp tư duy ReAct (Thought -> Action -> Observation).
Bạn được cung cấp các công cụ sau:

1. get_stock_price[symbol]: Lấy giá cổ phiếu của một mã chứng khoán. Ví dụ: get_stock_price[AAPL]
2. calculate[expression]: Thực hiện tính toán toán học. Ví dụ: calculate[150 * 1.1]

Quy trình làm việc của bạn:
Bước 1: Suy nghĩ về câu hỏi của người dùng (Thought: ...)
Bước 2: Nếu cần dùng công cụ, hãy xuất ra định dạng: Action: ten_cong_cu[tham_so] và dừng lại để nhận kết quả.
Bước 3: Sau khi nhận được kết quả (Observation: ...), hãy tiếp tục suy nghĩ (Thought: ...) để quyết định hành động tiếp theo hoặc đưa ra câu trả lời cuối cùng.
Bước 4: Khi đã có câu trả lời cuối cùng, hãy xuất ra định dạng: Final Answer: [Câu trả lời của bạn].

Bắt đầu!
"""

# 3. Hàm gọi API Ollama local
def query_ollama(prompt, model_name="llama3"):
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.0 # Đặt temperature bằng 0 để mô hình suy luận logic chính xác nhất
        }
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["message"]["content"]
    except Exception as e:
        return f"[Lỗi kết nối Ollama]: {str(e)}"

# 4. Vòng lặp điều khiển ReAct (Control Loop)
def run_react_agent(user_question, max_iterations=5):
    print(f"🙋 [Câu hỏi của người dùng]: '{user_question}'\n")
    
    # Khởi tạo lịch sử cuộc hội thoại của Agent
    agent_context = user_question
    
    for i in range(max_iterations):
        print(f"--- 🔄 Vòng lặp suy luận thứ {i+1} ---")
        
        # Gọi mô hình để lấy Thought và Action
        response = query_ollama(agent_context)
        print(response)
        
        # Cập nhật phản hồi của LLM vào ngữ cảnh lịch sử
        agent_context += f"\n{response}"
        
        # Kiểm tra xem mô hình đã đưa ra câu trả lời cuối cùng chưa
        if "Final Answer:" in response:
            final_answer = response.split("Final Answer:")[-1].strip()
            print(f"\n🏆 [Kết quả cuối cùng]: {final_answer}\n")
            return
            
        # Tìm kiếm câu lệnh gọi công cụ dạng Action: ten_cong_cu[tham_so]
        action_match = re.search(r'Action:\s*(\w+)\[(.*?)\]', response)
        
        if action_match:
            tool_name = action_match.group(1)
            tool_arg = action_match.group(2)
            
            print(f"\n⚙️ [Hệ thống phát hiện lệnh gọi công cụ]: Gọi '{tool_name}' với đối số '{tool_arg}'")
            
            # Kiểm tra xem công cụ có tồn tại trong hệ thống không
            if tool_name in TOOL_MAP:
                # Thực thi hàm Python tương ứng
                observation_result = TOOL_MAP[tool_name](tool_arg)
            else:
                observation_result = f"Lỗi: Công cụ '{tool_name}' không tồn tại."
                
            print(f"📊 [Kết quả thực thi công cụ (Observation)]: '{observation_result}'\n")
            
            # Nạp kết quả quan sát ngược trở lại ngữ cảnh của Agent
            agent_context += f"\nObservation: {observation_result}"
        else:
            print("\n⚠️ Cảnh báo: Mô hình không sinh ra lệnh gọi công cụ hợp lệ và chưa có Final Answer.")
            break
            
    print("\n❌ Thất bại: Agent vượt quá giới hạn vòng lặp tối đa (Max Iterations).")

if __name__ == "__main__":
    # Câu hỏi yêu cầu tích hợp cả 2 công cụ: (Tra giá cổ phiếu Apple) rồi nhân với (15 cổ phiếu)
    test_question = "Nếu tôi mua 15 cổ phiếu AAPL thì tôi cần trả tổng cộng bao nhiêu tiền?"
    
    # Chạy Agent
    run_react_agent(test_question)
