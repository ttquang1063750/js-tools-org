import urllib.request
import json
import sys
import re

# 1. Định nghĩa cấu trúc State (Trạng thái đồ thị)
class AgentState:
    def __init__(self, task_description):
        self.task = task_description
        self.code = ""
        self.test_log = ""
        self.error_count = 0
        self.approved = False

# 2. Định nghĩa các Nodes (Nút xử lý hành động)
def coder_node(state: AgentState):
    print("\n[Node Coder]: Đang viết code Python để giải quyết bài toán...")
    
    url = "http://localhost:11434/api/chat"
    
    # Prompt yêu cầu sinh code sạch, không chứa markdown giải thích ngoài khối code
    prompt = f"""Bạn là một lập trình viên Python chuyên nghiệp. Hãy viết duy nhất một hàm Python có tên là `solve_problem()` giải quyết yêu cầu sau:
Yêu cầu: {state.task}

Lưu ý: Chỉ trả về duy nhất code Python bên trong cặp thẻ markdown ```python và ```. Không giải thích gì thêm.
"""
    # Nếu có lỗi từ lượt chạy trước, đưa log lỗi vào prompt để Coder sửa
    if state.test_log and state.test_log != "SUCCESS":
        prompt += f"\nLần chạy trước bị lỗi Unit Test sau đây, hãy sửa lại code:\nLog lỗi: {state.test_log}"

    payload = {
        "model": "llama3",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            content = res["message"]["content"]
            
            # Trích xuất đoạn code Python nằm giữa ```python ... ```
            code_match = re.search(r'```python(.*?)```', content, re.DOTALL)
            if code_match:
                state.code = code_match.group(1).strip()
            else:
                state.code = content.strip()
    except Exception:
        # Fallback giả lập sinh code nếu không có Ollama chạy local
        state.code = "def solve_problem():\n    # Fallback simulation code\n    return 17 % 5"
        
    print("-> Code đã sinh ra:\n", state.code)
    return state

def tester_node(state: AgentState):
    print("\n[Node Tester]: Đang chạy thử nghiệm code vừa sinh...")
    
    # Tạo môi trường chạy code độc lập cục bộ
    local_env = {}
    try:
        # Biên dịch và thực thi chuỗi code Python
        exec(state.code, local_env)
        
        # Kiểm tra xem hàm solve_problem có tồn tại không
        if "solve_problem" in local_env:
            # Chạy thử hàm giải bài toán
            result = local_env["solve_problem"]()
            state.test_log = "SUCCESS"
            print(f"-> Chạy thử thành công! Kết quả hàm trả về: {result}")
        else:
            state.test_log = "Lỗi: Không tìm thấy định nghĩa hàm solve_problem()."
            state.error_count += 1
            print("-> Thất bại: Thiếu định nghĩa hàm.")
    except Exception as e:
        state.test_log = f"Runtime Error: {str(e)}"
        state.error_count += 1
        print(f"-> Thất bại! Phát hiện lỗi khi chạy thử: {state.test_log}")
        
    return state

def human_approval_node(state: AgentState):
    print("\n[Node Human-in-the-loop]: Đang chờ phê duyệt từ người quản trị...")
    print(f"Mã nguồn đề xuất:\n{state.code}")
    
    # Dừng luồng chờ input từ bàn phím người dùng
    user_input = input("Bạn có phê duyệt lưu file code này không? (y/n): ").strip().lower()
    
    if user_input == 'y':
        state.approved = True
        print("-> Đã được con người phê duyệt!")
    else:
        state.approved = False
        print("-> Bị con người từ chối.")
        
    return state

# 3. Lập trình Stateful Graph Engine điều khiển luồng rẽ nhánh điều kiện
def run_stateful_agent_graph(task_description):
    # Khởi tạo trạng thái ban đầu của Graph
    state = AgentState(task_description)
    
    max_retries = 3
    
    # Bắt đầu luồng chạy
    while True:
        # Bước 1: Gọi Node Coder
        state = coder_node(state)
        
        # Bước 2: Gọi Node Tester
        state = tester_node(state)
        
        # Cạnh điều kiện (Conditional Edge): Kiểm tra kết quả chạy thử
        if state.test_log == "SUCCESS":
            print("\n>> Điều kiện đạt! Chuyển tiếp tới bước Phê duyệt.")
            break
        else:
            if state.error_count >= max_retries:
                print(f"\n>> Đạt giới hạn sửa lỗi tối đa ({max_retries} lần). Kết thúc đồ thị thất bại.")
                return
            print(f"\n>> Phát hiện lỗi. Tự động quay lại Node Coder để sửa lại (Lần sửa thứ {state.error_count}).")
            
    # Bước 3: Điểm ngắt Human-in-the-loop
    state = human_approval_node(state)
    
    # Bước 4: Kiểm tra kết quả phê duyệt cuối cùng
    if state.approved:
        # Xuất file code ra ổ cứng
        filename = "solved_output.py"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(state.code)
        print(f"\n🎉 Thành công: Đã ghi nhận mã nguồn vào tệp '{filename}'!")
    else:
        print("\n❌ Thất bại: Mã nguồn bị hủy bỏ do con người từ chối phê duyệt.")

if __name__ == "__main__":
    print("=== Trình mô phỏng Đồ thị Agent có trạng thái ===")
    
    # Bài toán lập trình yêu cầu Agent thực hiện
    problem = "Hãy viết một hàm giải phép chia lấy phần dư của 17 cho 5."
    
    # Kích hoạt đồ thị chạy
    run_stateful_agent_graph(problem)
