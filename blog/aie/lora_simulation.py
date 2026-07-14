import numpy as np

# Cấu hình hạt giống ngẫu nhiên để kết quả chạy nhất quán
np.random.seed(42)

# 1. Khởi tạo kích thước mô hình giả lập
# d_in: chiều của input, d_out: chiều của output, r: hạng (rank) của LoRA
d_in = 8
d_out = 8
r = 2
alpha = 4.0
learning_rate = 0.01

# 2. Khởi tạo trọng số gốc W0 (Đóng băng) và giả lập input/target
W0 = np.random.randn(d_in, d_out) * 0.1
x = np.random.randn(1, d_in)          # Vector đầu vào giả lập (1 dòng, 8 cột)
target = np.random.randn(1, d_out)     # Kết quả đầu ra mong muốn (Target)

# 3. Khởi tạo các ma trận LoRA A và B
# Ma trận A khởi tạo bằng phân phối Gaussian ngẫu nhiên
lora_A = np.random.randn(r, d_out) * 0.1
# Ma trận B khởi tạo hoàn toàn bằng 0, đảm bảo ban đầu Delta W = B * A = 0
lora_B = np.zeros((d_in, r))

print("=== TRẠNG THÁI KHỞI TẠO ===")
print("Ma trận trọng số gốc W0:\n", W0)
print("\nMa trận LoRA A:\n", lora_A)
print("\nMa trận LoRA B:\n", lora_B)

# 4. Hàm Forward Pass của LoRA
def forward(x, W0, lora_A, lora_B, r, alpha):
    # Đường đi gốc
    h_base = np.dot(x, W0)
    # Đường đi LoRA phân rã hạng thấp song song
    scaling = alpha / r
    h_lora = np.dot(np.dot(x, lora_B), lora_A) * scaling
    # Kết hợp đầu ra cuối cùng
    h_final = h_base + h_lora
    return h_final, h_base, h_lora

# 5. Vòng lặp huấn luyện giả lập cập nhật trọng số LoRA
epochs = 100
print("\n=== BẮT ĐẦU QUÁ TRÌNH HUẤN LUYỆN LORA ===")

for epoch in range(epochs):
    # Bước 5.1: Forward Pass
    h_final, h_base, h_lora = forward(x, W0, lora_A, lora_B, r, alpha)
    
    # Bước 5.2: Tính Loss (Mean Squared Error giữa dự đoán h_final và target)
    loss = np.mean((h_final - target) ** 2)
    
    # Bước 5.3: Backpropagation (Tính đạo hàm riêng)
    # Đạo hàm của Loss đối với h_final
    d_loss_d_h = 2 * (h_final - target) / d_out
    
    # Tính gradient cho ma trận LoRA A và LoRA B theo quy tắc chuỗi (Chain Rule)
    scaling = alpha / r
    
    # d_loss/d_lora_A = scaling * (lora_B.T * x.T) * d_loss_d_h
    grad_A = scaling * np.dot(np.dot(x, lora_B).T, d_loss_d_h)
    
    # d_loss/d_lora_B = scaling * x.T * (d_loss_d_h * lora_A.T)
    grad_B = scaling * np.dot(x.T, np.dot(d_loss_d_h, lora_A.T))
    
    # Bước 5.4: Cập nhật trọng số LoRA bằng Gradient Descent (Giữ nguyên W0 đóng băng)
    lora_A -= learning_rate * grad_A
    lora_B -= learning_rate * grad_B
    
    if (epoch + 1) % 10 == 0 or epoch == 0:
        print(f"Epoch {epoch+1:3d} | Loss: {loss:.6f}")

print("\n=== KẾT QUẢ SAU HUÂN LUYỆN ===")
print("Ma trận LoRA B (không còn bằng 0):\n", lora_B)
print("\nMa trận LoRA A cập nhật:\n", lora_A)

# Kiểm tra lại output cuối cùng sau khi train
h_new, _, _ = forward(x, W0, lora_A, lora_B, r, alpha)
final_loss = np.mean((h_new - target) ** 2)
print(f"\nLoss cuối cùng sau 100 Epochs: {final_loss:.6f}")
