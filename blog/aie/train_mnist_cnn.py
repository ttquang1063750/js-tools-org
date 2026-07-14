import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Bộ giả lập sinh dữ liệu MNIST cục bộ phục vụ chạy thử nghiệm không cần tải mạng
def generate_mock_mnist_data(num_samples=200):
    np.random.seed(42)
    # Sinh 200 mẫu ảnh xám kích thước 1x28x28 ngẫu nhiên
    mock_images = np.random.randn(num_samples, 1, 28, 28).astype(np.float32)
    # Sinh nhãn phân loại ngẫu nhiên từ 0 đến 9
    mock_labels = np.random.randint(0, 10, size=(num_samples,)).astype(np.int64)
    
    return torch.tensor(mock_images), torch.tensor(mock_labels)

class MNIST_CNN(nn.Module):
    def __init__(self, num_classes=10):
        super(MNIST_CNN, self).__init__()
        
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2), # Ra: 16 x 14 x 14
            
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)  # Ra: 32 x 7 x 7
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(32 * 7 * 7, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x):
        x = self.features(x)
        # Flatten bắt đầu từ chiều kênh thứ nhất (bỏ qua chiều Batch ở index 0)
        x = torch.flatten(x, start_dim=1)
        logits = self.classifier(x)
        return logits

if __name__ == "__main__":
    print("=== Khởi tạo dữ liệu MNIST giả lập ===")
    images, labels = generate_mock_mnist_data(num_samples=200)
    print(f"Kích thước tensor ảnh: {images.shape} (Mẫu x Kênh x Cao x Rộng)")
    print(f"Kích thước nhãn: {labels.shape}\n")
    
    # Phân chia tập Train và Validation tỉ lệ 80/20
    train_images, val_images = images[:160], images[160:]
    train_labels, val_labels = labels[:160], labels[160:]
    
    # Khởi tạo mô hình mạng tích chập
    model = MNIST_CNN(num_classes=10)
    
    # Hàm Loss Cross Entropy thích hợp cho phân loại đa lớp
    criterion = nn.CrossEntropyLoss()
    # Bộ tối ưu Adam thích nghi
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 15
    batch_size = 32
    
    print("=== Đang tiến hành huấn luyện mạng CNN ===")
    model.train()
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        # Huấn luyện theo từng lô dữ liệu nhỏ (Mini-batch)
        permutation = torch.randperm(train_images.size(0))
        
        for i in range(0, train_images.size(0), batch_size):
            indices = permutation[i:i+batch_size]
            batch_x, batch_y = train_images[indices], train_labels[indices]
            
            # 1. Reset gradient về 0
            optimizer.zero_grad()
            
            # 2. Lan truyền xuôi
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            
            # 3. Lan truyền ngược
            loss.backward()
            
            # 4. Cập nhật trọng số
            optimizer.step()
            
            running_loss += loss.item() * batch_x.size(0)
            
        epoch_loss = running_loss / train_images.size(0)
        print(f"Epoch {epoch:02d}/{epochs} | Training Loss: {epoch_loss:.4f}")
        
    print("\n=== Đang tiến hành đánh giá trên tập Validation ===")
    model.eval()
    with torch.no_grad():
        val_outputs = model(val_images)
        # Lấy nhãn có xác suất dự đoán cao nhất
        _, predicted_classes = torch.max(val_outputs, dim=1)
        
        # Tính tỉ lệ chính xác (Accuracy %)
        correct = (predicted_classes == val_labels).sum().item()
        total = val_labels.size(0)
        accuracy = (correct / total) * 100
        
    print(f"Độ chính xác đạt được: {accuracy:.2f}% (Nhãn dự đoán: {predicted_classes.tolist()})")
    print("Mô hình đã học thành công cấu trúc trích xuất đặc trưng ảnh thô.")
