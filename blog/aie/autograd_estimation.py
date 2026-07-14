import torch
import math

# Tạo dữ liệu giả lập cho hàm Sin trong khoảng [-pi, pi]
# Dữ liệu sẽ được sinh ngẫu nhiên kèm nhiễu (noise)
# Sử dụng công thức bậc 3: y = w1*x + w2*x^2 + w3*x^3 + b

def generate_data(num_samples=2000):
    # Khởi tạo x phân bố đều trong khoảng [-pi, pi]
    x = torch.linspace(-math.pi, math.pi, num_samples, dtype=torch.float32)
    # y = sin(x) + nhiễu Gaussian ngẫu nhiên
    y = torch.sin(x) + 0.1 * torch.randn(num_samples)
    return x, y

def train_autograd():
    # 1. Khởi tạo dữ liệu
    x, y = generate_data()
    
    # 2. Khởi tạo ngẫu nhiên các trọng số cần học và đặt requires_grad=True để bật Autograd
    # w1, w2, w3, b đại diện cho các trọng số của hàm đa thức bậc 3
    w1 = torch.randn((), dtype=torch.float32, requires_grad=True)
    w2 = torch.randn((), dtype=torch.float32, requires_grad=True)
    w3 = torch.randn((), dtype=torch.float32, requires_grad=True)
    b = torch.randn((), dtype=torch.float32, requires_grad=True)
    
    # Siêu tham số tối ưu hóa
    learning_rate = 1e-6
    epochs = 2000
    
    print("=== Bắt đầu tối ưu hóa đa thức bằng PyTorch Autograd ===")
    print(f"Trọng số ban đầu: w1={w1.item():.4f}, w2={w2.item():.4f}, w3={w3.item():.4f}, b={b.item():.4f}\n")
    
    for epoch in range(1, epochs + 1):
        # Forward pass: Tính toán giá trị y dự đoán từ đa thức bậc 3
        # y_pred = w1*x + w2*x^2 + w3*x^3 + b
        y_pred = w1 * x + w2 * (x ** 2) + w3 * (x ** 3) + b
        
        # Tính toán sai số bình phương trung bình (Mean Squared Error - MSE) làm hàm loss
        loss = (y_pred - y).pow(2).sum()
        
        # Backward pass: Tự động tính gradient của loss đối với tất cả tensor có requires_grad=True
        # PyTorch sẽ tự xây dựng Computation Graph và thực hiện quy tắc Chain Rule
        loss.backward()
        
        # Cập nhật trọng số thủ công (không lưu vết gradient trong bước cập nhật này)
        with torch.no_grad():
            w1 -= learning_rate * w1.grad
            w2 -= learning_rate * w2.grad
            w3 -= learning_rate * w3.grad
            b -= learning_rate * b.grad
            
            # QUAN TRỌNG: Giải phóng bộ đệm gradient (zero grad) sau mỗi lần cập nhật
            # Nếu không xóa, PyTorch sẽ tự cộng dồn gradient mới vào gradient cũ
            w1.grad.zero_()
            w2.grad.zero_()
            w3.grad.zero_()
            b.grad.zero_()
            
        if epoch % 200 == 0:
            print(f"Epoch {epoch:4d} | Loss: {loss.item():.4f}")
            
    print(f"\n=== Kết quả tối ưu tìm được ===")
    print(f"Hàm đa thức xấp xỉ: y_pred = {w1.item():.4f}*x + {w2.item():.4f}*x^2 + {w3.item():.4f}*x^3 + {b.item():.4f}")
    print(f"Hàm đích thực tế: y = sin(x)")
    
    # Đo đếm độ chính xác
    with torch.no_grad():
        final_y_pred = w1 * x + w2 * (x ** 2) + w3 * (x ** 3) + b
        final_loss = (final_y_pred - y).pow(2).mean()
        print(f"Sai số trung bình cuối cùng (MSE Mean): {final_loss.item():.6f}")

if __name__ == "__main__":
    train_autograd()
