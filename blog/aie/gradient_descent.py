# gradient_descent.py
# Bài 2: Đại số Tuyến tính & Đạo hàm qua dòng lệnh — Series Kỹ Sư AI Thực Chiến

"""
Kịch bản minh họa thuật toán Gradient Descent từ con số 0.
Mục tiêu: Tìm cực tiểu của hàm số f(x) = x^2 - 4x + 4.
Giá trị cực tiểu lý thuyết là f(x) = 0 tại x = 2.
"""

def f(x):
    """Hàm số lỗi cần tối ưu (Loss function)"""
    return x**2 - 4*x + 4

def numerical_derivative(func, x, h=1e-5):
    """Tính xấp xỉ đạo hàm bằng phương pháp sai phân hữu hạn (Numerical Derivative)"""
    return (func(x + h) - func(x)) / h

def analytical_derivative(x):
    """Đạo hàm giải tích chính xác bằng toán học (f'(x) = 2x - 4)"""
    return 2*x - 4

def run_gradient_descent():
    # 1. Thiết lập các siêu tham số (Hyperparameters)
    x_init = 10.0        # Điểm xuất phát ban đầu (phỏng đoán ngẫu nhiên)
    learning_rate = 0.1  # Hệ số học (tốc độ dịch chuyển)
    epochs = 50          # Số vòng lặp huấn luyện tối đa
    tolerance = 1e-6     # Điều kiện dừng sớm khi sai số thay đổi cực nhỏ
    
    x = x_init
    print("--- BẮT ĐẦU QUÁ TRÌNH TỐI ƯU HÓA ---")
    print(f"Điểm xuất phát: x = {x:.4f} | Loss f(x) = {f(x):.4f}\n")
    
    for epoch in range(1, epochs + 1):
        # Tính đạo hàm (hướng dốc của đồ thị)
        # Ở đây ta sử dụng đạo hàm số học để minh họa nguyên lý lập trình,
        # bạn có thể đổi sang analytical_derivative(x) để có kết quả chính xác tuyệt đối.
        grad = numerical_derivative(f, x)
        
        # Cập nhật giá trị x đi ngược hướng đạo hàm (xuống dốc)
        x_new = x - learning_rate * grad
        
        loss = f(x_new)
        print(f"Vòng lặp {epoch:02d}: x = {x_new:.6f} | Đạo hàm = {grad:.6f} | Loss = {loss:.6f}")
        
        # Kiểm tra điều kiện hội tụ (nếu x thay đổi không đáng kể thì dừng)
        if abs(x_new - x) < tolerance:
            print(f"\n-> Thuật toán hội tụ sớm tại vòng lặp {epoch}!")
            x = x_new
            break
            
        x = x_new
        
    print("\n--- KẾT QUẢ CUỐI CÙNG ---")
    print(f"Cực tiểu tìm được tại: x = {x:.6f}")
    print(f"Giá trị Loss tối thiểu: f(x) = {f(x):.6f} (xấp xỉ 0)")
    print(f"Khoảng cách đến điểm tối ưu lý thuyết x=2: {abs(x - 2.0):.6e}")

if __name__ == "__main__":
    run_gradient_descent()
