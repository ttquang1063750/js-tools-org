import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super(MultiHeadAttention, self).__init__()
        assert d_model % num_heads == 0, "d_model phải chia hết cho num_heads"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # Tạo các ma trận chiếu tuyến tính cho Query, Key, Value
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        
        # Lớp tuyến tính cuối sau khi ghép các luồng Attention
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, q, k, v, mask=None):
        batch_size, seq_len, _ = q.size()
        
        # 1. Chiếu tuyến tính đầu vào và phân tách thành các Heads
        # Kích thước chuyển đổi: (Batch, Seq, d_model) -> (Batch, Seq, heads, d_k) -> (Batch, heads, Seq, d_k)
        Q = self.W_q(q).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(k).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(v).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        # 2. Tính điểm tương đồng Scaled Dot-Product
        # Q K^T: (Batch, heads, Seq, d_k) x (Batch, heads, d_k, Seq) -> (Batch, heads, Seq, Seq)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(torch.tensor(self.d_k, dtype=torch.float32))
        
        # Áp dụng mặt nạ (nếu có)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        # 3. Softmax để tạo phân phối trọng số chú ý
        attention_weights = F.softmax(scores, dim=-1)
        
        # 4. Nhân với Value và chuyển đổi lại số chiều gốc
        # (Batch, heads, Seq, Seq) x (Batch, heads, Seq, d_k) -> (Batch, heads, Seq, d_k)
        context = torch.matmul(attention_weights, V)
        
        # Ghép (Concatenate) các heads lại với nhau: (Batch, Seq, d_model)
        context = context.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        
        # Lớp chiếu tuyến tính đầu ra
        output = self.W_o(context)
        return output

class FeedForwardNetwork(nn.Module):
    def __init__(self, d_model, d_ff):
        super(FeedForwardNetwork, self).__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.relu = nn.ReLU()
        self.linear2 = nn.Linear(d_ff, d_model)
        
    def forward(self, x):
        return self.linear2(self.relu(self.linear1(x)))

class TransformerBlock(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(TransformerBlock, self).__init__()
        
        # Khối chú ý đa luồng
        self.attention = MultiHeadAttention(d_model, num_heads)
        
        # Lớp chuẩn hóa Layer Normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # Mạng truyền thẳng FFN
        self.feed_forward = FeedForwardNetwork(d_model, d_ff)
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        # 1. Khối Self-Attention + Kết nối tắt Residual Connection + LayerNorm
        attn_out = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_out))
        
        # 2. Khối FeedForward + Kết nối tắt Residual Connection + LayerNorm
        ff_out = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_out))
        
        return x

if __name__ == "__main__":
    print("=== Khởi tạo khối Transformer Block ===")
    d_model = 64
    num_heads = 8
    d_ff = 256
    seq_len = 10
    batch_size = 2
    
    # Khởi tạo mô hình
    block = TransformerBlock(d_model=d_model, num_heads=num_heads, d_ff=d_ff)
    print(f"Tham số: d_model={d_model}, heads={num_heads}, d_ff={d_ff}")
    
    # Giả lập dữ liệu đầu vào (Batch, Seq Length, d_model)
    dummy_input = torch.randn(batch_size, seq_len, d_model)
    print(f"Kích thước tensor đầu vào: {dummy_input.shape}")
    
    # Khởi tạo mặt nạ Causal Mask giả lập cho bộ giải mã Decoder
    # Mặt nạ tam giác dưới (Lower Triangular Mask) chứa số 1, góc trên chứa số 0
    causal_mask = torch.tril(torch.ones(seq_len, seq_len)).unsqueeze(0).unsqueeze(1) # (1, 1, Seq, Seq)
    print(f"Kích thước mặt nạ Causal Mask: {causal_mask.shape}\n")
    
    # Lan truyền xuôi qua khối Transformer Block
    output = block(dummy_input, mask=causal_mask)
    print("=== Chạy Lan truyền xuôi qua mô hình thành công ===")
    print(f"Kích thước tensor đầu ra: {output.shape} (Bằng chính xác kích thước đầu vào)")
    print(f"Kiến trúc khối Transformer Block đã hoạt động đồng bộ.")
