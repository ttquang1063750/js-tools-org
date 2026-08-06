import torch
import math

# Fit a cubic polynomial to sin(x) using nothing but Autograd.
#
#   y_pred = w1*x + w2*x^2 + w3*x^3 + b
#
# There is no nn.Module and no optimizer here on purpose: every weight update is
# written by hand, so you can see exactly what PyTorch does for you later on.


def generate_data(num_samples=2000):
    # x spread evenly across [-pi, pi]
    x = torch.linspace(-math.pi, math.pi, num_samples, dtype=torch.float32)
    # The 0.1 * randn term is Gaussian noise. Real measurements are never clean,
    # and fitting perfectly clean data teaches the wrong lesson about overfitting.
    y = torch.sin(x) + 0.1 * torch.randn(num_samples)
    return x, y


def train_autograd():
    x, y = generate_data()

    # requires_grad=True is the whole trick: from now on PyTorch records every
    # operation these four tensors take part in, so it can differentiate later.
    w1 = torch.randn((), dtype=torch.float32, requires_grad=True)
    w2 = torch.randn((), dtype=torch.float32, requires_grad=True)
    w3 = torch.randn((), dtype=torch.float32, requires_grad=True)
    b = torch.randn((), dtype=torch.float32, requires_grad=True)

    # Hyperparameters. 1e-6 looks tiny, but the loss below is a SUM over 2000
    # samples, so each gradient is roughly 2000x larger than a per-sample one.
    learning_rate = 1e-6
    epochs = 2000

    print("=== Fitting a cubic to sin(x) with PyTorch Autograd ===")
    print(
        f"Initial weights: w1={w1.item():.4f}, w2={w2.item():.4f}, "
        f"w3={w3.item():.4f}, b={b.item():.4f}\n"
    )

    for epoch in range(1, epochs + 1):
        # Forward pass — this line also builds the computation graph.
        y_pred = w1 * x + w2 * (x**2) + w3 * (x**3) + b

        # Squared error, summed. backward() needs a single number to start from.
        loss = (y_pred - y).pow(2).sum()

        # Backward pass: walk the graph in reverse and fill in every .grad.
        loss.backward()

        # The update itself is plain arithmetic, not part of the model, so keep
        # it out of the graph.
        with torch.no_grad():
            w1 -= learning_rate * w1.grad
            w2 -= learning_rate * w2.grad
            w3 -= learning_rate * w3.grad
            b -= learning_rate * b.grad

            # Gradients ACCUMULATE by default. Skip this and epoch 2 optimises
            # using epoch 1 + epoch 2 added together, which points nowhere useful.
            w1.grad.zero_()
            w2.grad.zero_()
            w3.grad.zero_()
            b.grad.zero_()

        if epoch % 200 == 0:
            print(f"Epoch {epoch:4d} | Loss: {loss.item():.4f}")

    print("\n=== Result ===")
    print(
        f"Learned polynomial: y_pred = {w1.item():.4f}*x + {w2.item():.4f}*x^2 "
        f"+ {w3.item():.4f}*x^3 + {b.item():.4f}"
    )
    print("Target function:    y = sin(x)")

    # Report the MEAN squared error, not the sum, so the number is comparable
    # across different dataset sizes.
    with torch.no_grad():
        final_y_pred = w1 * x + w2 * (x**2) + w3 * (x**3) + b
        final_loss = (final_y_pred - y).pow(2).mean()
        print(f"Final mean squared error: {final_loss.item():.6f}")


if __name__ == "__main__":
    train_autograd()
