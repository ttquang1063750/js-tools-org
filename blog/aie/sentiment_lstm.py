# sentiment_lstm.py
# Lesson 9: Recurrent networks (RNN) and the rise of attention
# Practical AI Engineer series
#
# Run it with:  python sentiment_lstm.py
# Requires:     pip install torch
#
# READ THIS BEFORE BELIEVING THE OUTPUT.
# Six training sentences is far too few to learn sentiment. What the model can do
# with six sentences is memorise which specific WORDS go with which label — and
# that is exactly what it does. The script therefore ends with a test on entirely
# unseen words, where it scores about 50/50: a coin flip. That contrast is the
# point of the project, not an accident.
#
# The Vietnamese review text stays Vietnamese: it is the DATA being classified,
# and it is what makes the word-memorisation effect visible.

import torch
import torch.nn as nn
import torch.optim as optim

# Seed everything, so the numbers printed in the lesson can actually be compared.
torch.manual_seed(42)

# 1. A tiny sample dataset of Vietnamese service reviews.
dataset = [
    ("dịch vụ xuất sắc nhân viên thân thiện", 1), # 1: Tích cực
    ("đồ ăn ngon phục vụ rất nhanh", 1),
    ("sản phẩm tuyệt vời đóng gói cẩn thận", 1),
    ("quá tệ đồ ăn nguội lạnh phục vụ kém", 0),  # 0: Tiêu cực
    ("giao hàng chậm trễ chất lượng tồi tệ", 0),
    ("thái độ nhân viên rất lồi lõm không mua lại", 0)
]

# 2. A crude word-level tokenizer.
words = set()
for text, _ in dataset:
    words.update(text.split())

# sorted() matters: a Python set iterates in an order that changes between runs
# (string hashing is randomised), which would give the words different IDs every
# run and make the output impossible to reproduce.
vocab = {word: idx + 2 for idx, word in enumerate(sorted(words))}  # 0: padding, 1: OOV
vocab["[PAD]"] = 0
vocab["[UNK]"] = 1
inverse_vocab = {v: k for k, v in vocab.items()}

# Turn text into a fixed-length sequence of integers, padding the short ones.
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

# Build the input tensors.
x_data = torch.tensor([text_to_sequence(text) for text, _ in dataset], dtype=torch.long)
y_data = torch.tensor([label for _, label in dataset], dtype=torch.float32).unsqueeze(1)

# 3. The SentimentLSTM architecture.
class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim):
        super(SentimentLSTM, self).__init__()
        
        # padding_idx=0 tells the layer to keep the padding vector at zero and never train it.
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        
        # The recurrent layer.
        # batch_first=True gives the input shape (batch, sequence length, features).
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        
        # Binary classifier head; Sigmoid so BCELoss can read it.
        self.classifier = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        # x shape: (Batch, Sequence Length)
        embedded = self.embedding(x) # shape: (Batch, Sequence Length, Embedding Dim)
        
        # Run the sequence through the LSTM.
        # out: the hidden state at EVERY time step
        # (hn, cn): the hidden state and cell state at the LAST time step only
        out, (hn, cn) = self.lstm(embedded)
        
        # Take the final hidden state as a summary of the whole sentence. This single
        # vector is the bottleneck that attention (section 9.3) exists to remove.
        last_hidden = hn[-1] # shape: (Batch, Hidden Dim)
        
        logits = self.classifier(last_hidden)
        predictions = self.sigmoid(logits)
        return predictions

if __name__ == "__main__":
    print("=== Khởi tạo dữ liệu huấn luyện ===")
    print(f"Kích thước từ điển (Vocabulary Size): {len(vocab)}")
    print(f"Kích thước Tensor đầu vào: {x_data.shape}\n")
    
    # Build the model.
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
            # Training accuracy only — there is no held-out set here, by design.
            binary_predictions = (predictions >= 0.5).float()
            accuracy = (binary_predictions == y_data).sum().item() / len(y_data) * 100
            print(f"Epoch {epoch:02d}/{epochs} | Loss: {loss.item():.4f} | Accuracy: {accuracy:.1f}%")
            
    print("\n=== Inference on words the model HAS seen ===")
    model.eval()

    def predict(comment):
        seq = torch.tensor([text_to_sequence(comment)], dtype=torch.long)
        with torch.no_grad():
            p = model(seq).item()
        unknown = [w for w in comment.split() if w not in vocab]
        label = "positive" if p >= 0.5 else "negative"
        print(f"  \"{comment}\"")
        print(f"    {p * 100:6.2f}% positive -> {label:8} | {len(unknown)}/{len(comment.split())} words unknown")
        return p

    # Every word in these two sentences already appears in the training data.
    predict("đồ ăn ngon phục vụ nhanh tuyệt vời")
    predict("phục vụ quá tệ chất lượng tồi")

    print("\n=== The honest test: words the model has NEVER seen ===")
    # Same sentiment, completely different vocabulary. Every token becomes [UNK],
    # so the model has nothing memorised to fall back on.
    p_good = predict("bánh mì thơm giòn lịch sự")
    p_bad = predict("nhà hàng bẩn thỉu hôi hám")

    print("\n=== What that means ===")
    good_label = "positive" if p_good >= 0.5 else "negative"
    bad_label = "positive" if p_bad >= 0.5 else "negative"
    if good_label == bad_label:
        print(f"  Both sentences came out {good_label}, even though one praises and one")
        print("  complains. Every one of their words is [UNK], so the model has nothing")
        print("  memorised to go on and simply collapses to one side.")
    print("  With 6 training sentences the model memorised which WORDS carry which")
    print("  label — it learned nothing about sentiment itself. Swap the words and the")
    print("  knowledge is gone. That is the real lesson of this project.")
    print("  Real sentiment analysis needs thousands of examples, or embeddings")
    print("  pretrained on a large corpus. Lesson 14 uses the pretrained route.")
