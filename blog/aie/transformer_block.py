import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super(MultiHeadAttention, self).__init__()
        assert d_model % num_heads == 0, "d_model must divide evenly by num_heads"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # Linear projections producing Query, Key and Value.
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        
        # Final projection, applied after the heads are concatenated.
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, q, k, v, mask=None):
        batch_size, seq_len, _ = q.size()
        
        # 1. Project the input, then split it across the heads.
        #    Shapes: (batch, seq, d_model) -> (batch, seq, heads, d_k) -> (batch, heads, seq, d_k)
        Q = self.W_q(q).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(k).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(v).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        # 2. Scaled dot-product scores. Dividing by sqrt(d_k) keeps the values in a
        #    range where Softmax does not saturate.
        # Q K^T: (Batch, heads, Seq, d_k) x (Batch, heads, d_k, Seq) -> (Batch, heads, Seq, Seq)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(torch.tensor(self.d_k, dtype=torch.float32))
        
        # Apply the mask. -1e9 before Softmax becomes effectively 0 after it.
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        # 3. Softmax turns the scores into attention weights summing to 1.
        attention_weights = F.softmax(scores, dim=-1)
        
        # 4. Weight the Values, then restore the original dimensions.
        # (Batch, heads, Seq, Seq) x (Batch, heads, Seq, d_k) -> (Batch, heads, Seq, d_k)
        context = torch.matmul(attention_weights, V)
        
        #    Concatenate the heads back together: (batch, seq, d_model)
        context = context.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        
        # Output projection.
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
        
        # Multi-head attention.
        self.attention = MultiHeadAttention(d_model, num_heads)
        
        # LayerNorm, applied around each sub-block (the residual connections below
        # are what let gradients reach the early layers of a deep stack).
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # The position-wise feed-forward network.
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
    # Seed, so the numbers below are the same on every run.
    torch.manual_seed(42)

    d_model, num_heads, d_ff = 64, 8, 256
    seq_len, batch_size = 10, 2

    block = TransformerBlock(d_model=d_model, num_heads=num_heads, d_ff=d_ff)
    block.eval()  # no dropout, so the causal test below is deterministic
    print(f"=== Transformer block: d_model={d_model}, heads={num_heads}, d_ff={d_ff} ===")

    x = torch.randn(batch_size, seq_len, d_model)
    print(f"input shape:  {tuple(x.shape)}")

    # Lower-triangular mask: position i may attend to 0..i, never to i+1 onwards.
    causal_mask = torch.tril(torch.ones(seq_len, seq_len)).unsqueeze(0).unsqueeze(1)
    print(f"causal mask shape: {tuple(causal_mask.shape)}")

    with torch.no_grad():
        output = block(x, mask=causal_mask)
    print(f"output shape: {tuple(output.shape)}  (identical to the input, as it must be)")

    # ---------------------------------------------------------------- the real test
    # Matching shapes prove almost nothing: an attention that ignored the mask
    # entirely would still return the right shape. The property that actually
    # matters for a decoder (GPT) is CAUSALITY — position i must not see i+1.
    #
    # So: change ONLY the last token and re-run. If the mask works, every earlier
    # position must come out bit-for-bit identical, because none of them was
    # allowed to look at the token we changed.
    print("\n=== Does the causal mask actually work? ===")
    x_perturbed = x.clone()
    x_perturbed[:, -1, :] = torch.randn(batch_size, d_model)  # rewrite the LAST token

    with torch.no_grad():
        output_perturbed = block(x_perturbed, mask=causal_mask)

    earlier_drift = (output[:, :-1, :] - output_perturbed[:, :-1, :]).abs().max().item()
    last_drift = (output[:, -1, :] - output_perturbed[:, -1, :]).abs().max().item()

    print(f"  changed the last token only")
    print(f"  largest change in positions 0..{seq_len - 2}: {earlier_drift:.2e}")
    print(f"  largest change in the last position:  {last_drift:.4f}")

    if earlier_drift < 1e-6 < last_drift:
        print("  PASS — earlier positions did not move, the last one did.")
        print("  That is causality: the past cannot see the future.")
    else:
        print("  FAIL — the mask is leaking information backwards in time.")

    # And the counter-test: without a mask, changing the last token must disturb
    # everything, because every position now attends to every other.
    with torch.no_grad():
        free = block(x, mask=None)
        free_perturbed = block(x_perturbed, mask=None)
    free_drift = (free[:, :-1, :] - free_perturbed[:, :-1, :]).abs().max().item()
    print(f"\n  same experiment with NO mask: earlier positions moved by {free_drift:.4f}")
    print("  Non-zero, as expected — which confirms the test above measures the mask")
    print("  and not some accident of the architecture.")
