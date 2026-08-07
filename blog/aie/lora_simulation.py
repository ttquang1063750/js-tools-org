"""Lesson 19 project: LoRA from scratch in NumPy, with its claims checked.

Run:  python3 lora_simulation.py
Needs: pip install numpy

The lesson makes four claims about LoRA. This file tests all four rather than
asserting them:

  1. the base weights W0 never change during training,
  2. at initialisation the adapter contributes exactly zero, so the model
     starts out identical to the base model,
  3. the number of trainable parameters collapses by two orders of magnitude,
  4. after training the adapter can be folded back into W0, so inference costs
     nothing extra.
"""

import numpy as np

np.random.seed(42)

D_IN, D_OUT = 8, 8
RANK = 2
ALPHA = 4.0
LEARNING_RATE = 0.01
EPOCHS = 100


def init_lora(d_in, d_out, rank):
    """A is random, B is zeros. That asymmetry is deliberate - see claim 2."""
    lora_a = np.random.randn(rank, d_out) * 0.1
    lora_b = np.zeros((d_in, rank))
    return lora_a, lora_b


def forward(x, w0, lora_a, lora_b, rank, alpha):
    """h = x·W0 + (alpha/rank)·(x·B·A).

    Note the order: B then A. Since delta_W = B·A, the adapter path must be
    x·B·A. Writing x·A·B does not even typecheck - A is (rank, d_out) and x is
    (1, d_in), so the shapes do not line up.
    """
    base = x @ w0
    adapter = (x @ lora_b) @ lora_a * (alpha / rank)
    return base + adapter, base, adapter


def train(x, target, w0, lora_a, lora_b, rank, alpha, epochs, lr, verbose=True):
    """Gradient descent on A and B only. W0 is never touched below."""
    scaling = alpha / rank
    losses = []
    for epoch in range(epochs):
        h, _, _ = forward(x, w0, lora_a, lora_b, rank, alpha)
        loss = np.mean((h - target) ** 2)
        losses.append(loss)

        d_loss_d_h = 2 * (h - target) / w0.shape[1]
        grad_a = scaling * ((x @ lora_b).T @ d_loss_d_h)
        grad_b = scaling * (x.T @ (d_loss_d_h @ lora_a.T))

        lora_a -= lr * grad_a
        lora_b -= lr * grad_b

        if verbose and ((epoch + 1) % 25 == 0 or epoch == 0):
            print(f"    epoch {epoch + 1:3d} | loss {loss:.6f}")
    return lora_a, lora_b, losses


def count_parameters(d_in, d_out, rank):
    frozen = d_in * d_out
    trainable = rank * d_out + d_in * rank
    return frozen, trainable, frozen / trainable


def rank_experiment(rank, alpha, epochs=EPOCHS, lr=LEARNING_RATE):
    """Train one adapter from an identical starting point and return its loss."""
    np.random.seed(42)
    w0 = np.random.randn(D_IN, D_OUT) * 0.1
    x = np.random.randn(1, D_IN)
    target = np.random.randn(1, D_OUT)
    lora_a, lora_b = init_lora(D_IN, D_OUT, rank)
    _, _, losses = train(x, target, w0, lora_a, lora_b, rank, alpha,
                         epochs, lr, verbose=False)
    return losses[-1]


def main():
    w0 = np.random.randn(D_IN, D_OUT) * 0.1
    x = np.random.randn(1, D_IN)
    target = np.random.randn(1, D_OUT)
    lora_a, lora_b = init_lora(D_IN, D_OUT, RANK)

    # --- Claim 2: the adapter starts at exactly zero -----------------------
    print("=== Claim: at initialisation the adapter changes nothing ===")
    h0, base0, adapter0 = forward(x, w0, lora_a, lora_b, RANK, ALPHA)
    print(f"  largest value in the adapter path : {np.abs(adapter0).max():.1e}")
    print(f"  output identical to the base model: {np.array_equal(h0, base0)}")
    assert np.array_equal(h0, base0), "the adapter should be inert at t=0"
    print("  B is initialised to zeros, so delta_W = B·A is the zero matrix.")
    print("  That is why attaching an untrained adapter cannot hurt a model:")
    print("  it starts as an exact no-op, then learns away from there.\n")

    # --- Claim 3: parameter counts ----------------------------------------
    print("=== Claim: far fewer trainable parameters ===")
    for d, r in ((D_IN, RANK), (4096, 8), (4096, 64)):
        frozen, trainable, ratio = count_parameters(d, d, r)
        print(f"  d={d:<5} r={r:<3} frozen {frozen:>10,}   trainable {trainable:>8,}"
              f"   {ratio:>6.0f}x fewer")
    print("  The 4096 row is one attention projection of a 7B-class model.\n")

    # --- Claim 1: W0 is frozen --------------------------------------------
    print("=== Training the adapter (W0 must not move) ===")
    w0_before = w0.copy()
    lora_a, lora_b, losses = train(x, target, w0, lora_a, lora_b,
                                   RANK, ALPHA, EPOCHS, LEARNING_RATE)
    print(f"  loss {losses[0]:.6f} -> {losses[-1]:.6f}"
          f"   ({losses[0] / losses[-1]:.0f}x lower)")
    print(f"  W0 bit-identical after training: {np.array_equal(w0, w0_before)}")
    assert np.array_equal(w0, w0_before), "W0 was modified - it must be frozen"
    print(f"  largest value in B after training: {np.abs(lora_b).max():.4f}"
          f"   (was exactly 0)\n")

    # --- Claim 4: the adapter can be merged into W0 ------------------------
    print("=== Claim: the adapter can be folded into W0 for free inference ===")
    delta_w = (lora_b @ lora_a) * (ALPHA / RANK)
    w_merged = w0 + delta_w
    h_adapter, _, _ = forward(x, w0, lora_a, lora_b, RANK, ALPHA)
    h_merged = x @ w_merged
    gap = np.abs(h_adapter - h_merged).max()
    print(f"  largest difference between the two paths: {gap:.2e}")
    assert gap < 1e-12, "merging changed the output"
    print("  Same numbers, one matrix multiply instead of three. This is why")
    print("  LoRA adds no inference latency once the adapter is merged - and")
    print("  why you can keep many small adapters for one shared base model.\n")

    # --- What the rank actually buys, and the trap in measuring it -------
    print("=== What does the rank r buy? ===")
    print("  Sweep A: alpha fixed at 4.0, which is the obvious experiment")
    for rank in (1, 2, 4, 8):
        loss = rank_experiment(rank, alpha=ALPHA)
        print(f"    r={rank}  alpha/r={ALPHA / rank:.2f}  final loss {loss:.6f}")
    print("  Higher rank looks WORSE. That result is an artefact, not a finding:")
    print("  the adapter is scaled by alpha/r, so holding alpha fixed quietly")
    print("  shrinks every update as r grows. The sweep measured the scaling,")
    print("  not the capacity.\n")

    print("  Sweep B: alpha scaled with r so alpha/r stays 2.0")
    for rank in (1, 2, 4, 8):
        loss = rank_experiment(rank, alpha=2.0 * rank)
        print(f"    r={rank}  alpha={2.0 * rank:<5} alpha/r=2.00  final loss {loss:.6f}")
    print("  Now rank helps - up to r=4, after which an 8x8 layer with one")
    print("  training example has nothing left to gain. This is why the usual")
    print("  advice is to raise alpha together with r rather than tune it alone.")


if __name__ == "__main__":
    main()
