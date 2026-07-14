import torch
import torch.nn as nn
import numpy as np

# Giả lập hoặc tự tạo hàm sinh dữ liệu hai vòng tròn đồng tâm (tương đương make_circles của scikit-learn)
# Việc này giúp mã nguồn chạy được ngay mà không bắt buộc cài đặt scikit-learn.
def generate_concentric_circles(n_samples=1000, noise=0.05, factor=0.5):
    n_samples_out = n_samples // 2
    n_samples_in = n_samples - n_samples_out
    
    # Sinh vòng tròn ngoài (bán kính 1.0)
    theta_out = np.linspace(0, 2 * np.pi, n_samples_out)
    x_out = np.cos(theta_out) + np.random.normal(0, noise, n_samples_out)
    y_out = np.sin(theta_out) + np.random.normal(0, noise, n_samples_out)
    X_out = np.vstack((x_out, y_out)).T
    y_out_label = np.zeros(n_samples_out)
    
    # Sinh vòng tròn trong (bán kính factor = 0.5)
    theta_in = np.linspace(0, 2 * np.pi, n_samples_in)
    x_in = factor * np.cos(theta_in) + np.random.normal(0, noise, n_samples_in)
    y_in = factor * np.sin(theta_in) + np.random.normal(0, noise, n_samples_in)
    X_in = np.vstack((x_in, y_in)).T
    y_in_label = np.ones(n_samples_in)
    
    # Ghép hai cụm dữ liệu
    X = np.vstack((X_out, X_in))
    y = np.concatenate((y_out_label, y_in_label))
    
    # Trộn ngẫu nhiên dữ liệu
    indices = np.arange(n_samples)
    np.random.shuffle(indices)
    return X[indices], y[indices]

# Định nghĩa lớp mạng MLP (Multi-Layer Perceptron) tùy biến kế thừa từ nn.Module
class SimpleMLP(nn.Module):
    def __init__(self, input_dim=2, hidden_dim=8, output_dim=1):
        # 1. BẮT BUỘC gọi super().__init__() để đăng ký các tham số với PyTorch
        super(SimpleMLP, self).__init__()
        
        # 2. Định nghĩa các tầng liên kết toàn phần (Fully Connected / Linear Layers)
        # Mạng gồm 3 tầng tuyến tính có các hàm kích hoạt phi tuyến xen kẽ
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),   # Tầng ẩn 1
            nn.ReLU(),                          # Hàm kích hoạt phi tuyến ReLU
            nn.Linear(hidden_dim, hidden_dim),  # Tầng ẩn 2
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),  # Tầng đầu ra
            nn.Sigmoid()                        # Đưa đầu ra về khoảng [0, 1] để phân loại nhị phân
        )
        
        # 3. Minh họa cách khởi tạo trọng số Kaiming (He) Initialization
        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                # Khởi tạo trọng số Kaiming cho tầng tuyến tính có ReLU
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                if m.bias is not None:
                    # Khởi tạo bias bằng 0
                    nn.init.constant_(m.bias, 0.0)

    def forward(self, x):
        # Định nghĩa luồng lan truyền xuôi (Forward pass) của dữ liệu qua mạng
        return self.network(x)

if __name__ == "__main__":
    print("=== Khởi tạo tập dữ liệu hai vòng tròn đồng tâm ===")
    X_np, y_np = generate_concentric_circles(n_samples=10, noise=0.05, factor=0.5)
    print(f"Kích thước X: {X_np.shape} (10 mẫu, mỗi mẫu là tọa độ x, y 2D)")
    print(f"Nhãn y: {y_np} (0 đại diện cho vòng ngoài, 1 đại diện cho vòng trong)\n")
    
    # Chuyển đổi dữ liệu NumPy sang PyTorch Tensor
    X_tensor = torch.tensor(X_np, dtype=torch.float32)
    
    print("=== Khởi tạo mô hình mạng MLP ===")
    model = SimpleMLP(input_dim=2, hidden_dim=8, output_dim=1)
    print(model)
    
    print("\n=== Thực hiện Lan truyền xuôi (Forward Pass) ban đầu ===")
    # Đưa mô hình về chế độ đánh giá (không tính gradient cho bước này)
    model.eval()
    with torch.no_grad():
        predictions = model(X_tensor)
        
    print("Kết quả dự đoán xác suất thô chưa huấn luyện:")
    for i in range(len(X_np)):
        print(f"Tọa độ: [{X_np[i][0]:.3f}, {X_np[i][1]:.3f}] | Dự đoán xác suất lớp 1: {predictions[i].item():.4f} (Nhãn thực tế: {int(y_np[i])})")
        
    print("\nNhận xét: Vì mạng chưa được huấn luyện, các dự đoán xác suất ngẫu nhiên và chưa khớp với nhãn thực tế.")
