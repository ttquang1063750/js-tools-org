import torch
import torch.nn as nn
import torch.optim as optim

# 1. Tạo tập dữ liệu mẫu đánh giá dịch vụ bằng tiếng Việt
dataset = [
    ("dịch vụ xuất sắc nhân viên thân thiện", 1), # 1: Tích cực
    ("đồ ăn ngon phục vụ rất nhanh", 1),
    ("sản phẩm tuyệt vời đóng gói cẩn thận", 1),
    ("quá tệ đồ ăn nguội lạnh phục vụ kém", 0),  # 0: Tiêu cực
    ("giao hàng chậm trễ chất lượng tồi tệ", 0),
    ("thái độ nhân viên rất lồi lõm không mua lại", 0)
]

# 2. Xây dựng Tokenizer thô cấp từ
words = set()
for text, _ in dataset:
    words.update(text.split())

vocab = {word: idx + 2 for idx, word in enumerate(words)} # ID 0: Padding, ID 1: OOV
vocab["[PAD]"] = 0
vocab["[UNK]"] = 1
inverse_vocab = {v: k for k, v in vocab.items()}

# Hàm chuyển văn bản thành chuỗi số nguyên có độ dài cố định (padding)
def text_to_sequence(text, max_len=8):
    tokens = text.split()
    seq = []
    for token in tokens:
        seq.append(vocab.get(token, 1))
    # Padding hoặc Truncate
    if len(seq) < max_len:
        seq += [0] * (max_len - len(seq))
    else:
        seq = seq[:max_len]
    return seq

# Chuẩn bị Tensor dữ liệu đầu vào
x_data = torch.tensor([text_to_sequence(text) for text, _ in dataset], dtype=torch.long)
y_data = torch.tensor([label for _, label in dataset], dtype=torch.float32).unsqueeze(1)

# 3. Định nghĩa kiến trúc mạng SentimentLSTM
class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim):
        super(SentimentLSTM, self).__init__()
        
        # Lớp Embedding tra cứu vector nhúng
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        
        # Lớp LSTM tuần hoàn
        # batch_first=True giúp dữ liệu có cấu trúc đầu vào: (Batch, Sequence Length, Features)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        
        # Lớp phân loại đầu ra sigmoid nhị phân
        self.classifier = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        # x shape: (Batch, Sequence Length)
        embedded = self.embedding(x) # shape: (Batch, Sequence Length, Embedding Dim)
        
        # Trích xuất thông tin tuần hoàn qua LSTM
        # out: chứa các hidden state của mọi bước thời gian
        # (hn, cn): chứa hidden state và cell state của bước thời gian cuối cùng
        out, (hn, cn) = self.lstm(embedded)
        
        # Lấy hidden state cuối cùng của LSTM đại diện cho toàn bộ ngữ cảnh câu văn
        last_hidden = hn[-1] # shape: (Batch, Hidden Dim)
        
        logits = self.classifier(last_hidden)
        predictions = self.sigmoid(logits)
        return predictions

if __name__ == "__main__":
    print("=== Khởi tạo dữ liệu huấn luyện ===")
    print(f"Kích thước từ điển (Vocabulary Size): {len(vocab)}")
    print(f"Kích thước Tensor đầu vào: {x_data.shape}\n")
    
    # Khởi tạo mô hình
    model = SentimentLSTM(vocab_size=len(vocab), embedding_dim=16, hidden_dim=8)
    
    criterion = nn.BCELoss() # Binary Cross Entropy Loss cho phân loại nhị phân
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    epochs = 40
    print("=== Bắt đầu huấn luyện mạng SentimentLSTM ===")
    for epoch in range(1, epochs + 1):
        model.train()
        optimizer.zero_grad()
        
        predictions = model(x_data)
        loss = criterion(predictions, y_data)
        
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            # Tính độ chính xác nhị phân đơn giản
            binary_predictions = (predictions >= 0.5).float()
            accuracy = (binary_predictions == y_data).sum().item() / len(y_data) * 100
            print(f"Epoch {epoch:02d}/{epochs} | Loss: {loss.item():.4f} | Accuracy: {accuracy:.1f}%")
            
    print("\n=== Đang tiến hành suy luận thực tế ===")
    model.eval()
    with torch.no_grad():
        test_comment = "đồ ăn ngon phục vụ nhanh tuyệt vời"
        seq_test = torch.tensor([text_to_sequence(test_comment)], dtype=torch.long)
        pred = model(seq_test).item()
        
        sentiment = "Tích cực (Positive)" if pred >= 0.5 else "Tiêu cực (Negative)"
        print(f"Câu đánh giá: '{test_comment}'")
        print(f"Xác suất tích cực: {pred*100:.2f}% -> Dự đoán cảm xúc: {sentiment}")
        
        test_comment_bad = "phục vụ quá tệ chất lượng tồi"
        seq_test_bad = torch.tensor([text_to_sequence(test_comment_bad)], dtype=torch.long)
        pred_bad = model(seq_test_bad).item()
        
        sentiment_bad = "Tích cực (Positive)" if pred_bad >= 0.5 else "Tiêu cực (Negative)"
        print(f"Câu đánh giá: '{test_comment_bad}'")
        print(f"Xác suất tích cực: {pred_bad*100:.2f}% -> Dự đoán cảm xúc: {sentiment_bad}")
