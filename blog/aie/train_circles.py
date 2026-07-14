import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Sinh tập dữ liệu hai vòng tròn đồng tâm tương tự Bài 5
def generate_concentric_circles(n_samples=1200, noise=0.05, factor=0.5):
    np.random.seed(42)
    n_samples_out = n_samples // 2
    n_samples_in = n_samples - n_samples_out
    
    # Vòng tròn ngoài
    theta_out = np.linspace(0, 2 * np.pi, n_samples_out)
    x_out = np.cos(theta_out) + np.random.normal(0, noise, n_samples_out)
    y_out = np.sin(theta_out) + np.random.normal(0, noise, n_samples_out)
    X_out = np.vstack((x_out, y_out)).T
    y_out_label = np.zeros(n_samples_out)
    
    # Vòng tròn trong
    theta_in = np.linspace(0, 2 * np.pi, n_samples_in)
    x_in = factor * np.cos(theta_in) + np.random.normal(0, noise, n_samples_in)
    y_in = factor * np.sin(theta_in) + np.random.normal(0, noise, n_samples_in)
    X_in = np.vstack((x_in, y_in)).T
    y_in_label = np.ones(n_samples_in)
    
    X = np.vstack((X_out, X_in))
    y = np.concatenate((y_out_label, y_in_label))
    
    # Trộn ngẫu nhiên
    indices = np.arange(n_samples)
    np.random.shuffle(indices)
    return X[indices], y[indices]

class SimpleMLP(nn.Module):
    def __init__(self, input_dim=2, hidden_dim=8, output_dim=1):
        super(SimpleMLP, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),
            nn.Sigmoid()
        )
        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.network:
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0.0)

    def forward(self, x):
        return self.network(x)

def draw_ascii_loss_chart(losses, epochs_sampled):
    print("\n=== Đồ thị biểu diễn sai số (Loss reduction) ===")
    max_loss = max(losses)
    for i, loss in enumerate(losses):
        epoch = epochs_sampled[i]
        # Quy đổi độ dài cột ASCII từ 0-40 ký tự
        bar_len = int((loss / max_loss) * 40) if max_loss > 0 else 0
        bar = "█" * bar_len
        print(f"Epoch {epoch:4d} | Loss: {loss:.4f} | {bar}")

def train():
    # 1. Sinh dữ liệu
    X_np, y_np = generate_concentric_circles(n_samples=1000)
    
    # Phân chia tập Train / Test (80 / 20)
    split = 800
    X_train, X_test = X_np[:split], X_np[split:]
    y_train, y_test = y_np[:split], y_np[split:]
    
    # Đưa về PyTorch Tensor
    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1) # Chuyển sang kích thước (800, 1)
    
    X_test_t = torch.tensor(X_test, dtype=torch.float32)
    y_test_t = torch.tensor(y_test, dtype=torch.float32).unsqueeze(1)
    
    # 2. Định nghĩa mô hình, hàm Loss và Bộ tối ưu
    model = SimpleMLP()
    
    # Hàm Binary Cross Entropy cho bài toán phân loại nhị phân
    criterion = nn.BCELoss()
    
    # Bộ tối ưu Adam cải tiến tự động điều chỉnh tốc độ học
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    epochs = 500
    sampled_losses = []
    sampled_epochs = []
    
    print("=== Bắt đầu huấn luyện mạng MLP trên dữ liệu Vòng Tròn Đồng Tâm ===")
    for epoch in range(1, epochs + 1):
        model.train()
        
        # Lan truyền xuôi (Forward Pass)
        predictions = model(X_train_t)
        
        # Tính toán sai số (Loss)
        loss = criterion(predictions, y_train_t)
        
        # Giải phóng bộ đệm gradient cũ
        optimizer.zero_grad()
        
        # Lan truyền ngược (Backward Pass) để tính đạo hàm
        loss.backward()
        
        # Cập nhật trọng số
        optimizer.step()
        
        # Lưu lại mẫu loss để vẽ đồ thị
        if epoch == 1 or epoch % 50 == 0:
            sampled_losses.append(loss.item())
            sampled_epochs.append(epoch)
            
            # Tính toán độ chính xác (Accuracy) trên tập train
            train_preds = (predictions >= 0.5).float()
            accuracy = (train_preds == y_train_t).float().mean().item() * 100
            
            print(f"Epoch {epoch:4d}/500 | Loss: {loss.item():.4f} | Accuracy: {accuracy:.2f}%")
            
    # Đánh giá trên tập test
    model.eval()
    with torch.no_grad():
        test_preds = model(X_test_t)
        test_loss = criterion(test_preds, y_test_t)
        test_preds_binary = (test_preds >= 0.5).float()
        test_accuracy = (test_preds_binary == y_test_t).float().mean().item() * 100
        
    print(f"\n=== Kết quả sau huấn luyện ===")
    print(f"Loss trên tập Test: {test_loss.item():.4f}")
    print(f"Độ chính xác (Accuracy) trên tập Test: {test_accuracy:.2f}%")
    
    # Vẽ đồ thị ASCII Loss
    draw_ascii_loss_chart(sampled_losses, sampled_epochs)
    
    # Thử nghiệm xuất đồ thị ảnh nếu có matplotlib (không bắt buộc)
    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(8, 5))
        plt.plot(sampled_epochs, sampled_losses, marker='o', color='gold', label='Loss')
        plt.title('Đồ thị suy giảm Loss - Mạng MLP phân loại Vòng Tròn Đồng Tâm')
        plt.xlabel('Epoch')
        plt.ylabel('Loss Value')
        plt.grid(True)
        plt.legend()
        plt.savefig('loss_chart.png')
        print("\n[LƯU Ý] Đã vẽ và lưu đồ thị chất lượng cao thành công vào file 'loss_chart.png'!")
    except ImportError:
        pass

if __name__ == "__main__":
    train()
