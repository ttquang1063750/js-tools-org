# train_circles.py
# Lesson 6: Training a network — Loss & Backpropagation
# Practical AI Engineer series
#
# Run it with:  python train_circles.py
# Requires:     pip install torch numpy      (matplotlib optional)
#
# A complete training loop on the two-concentric-circles dataset from Lesson 5.
# The four lines that do the actual learning are marked STEP 1..4 below; every
# training loop you will ever write is those same four lines in that same order.

import math

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim


def generate_concentric_circles(n_samples=1200, noise=0.05, factor=0.5):
    """Two concentric rings: outer labelled 0, inner labelled 1.

    Not linearly separable — no straight line splits them — which is exactly why
    the network needs its non-linear activations from Lesson 5.
    """
    np.random.seed(42)
    n_out = n_samples // 2
    n_in = n_samples - n_out

    theta_out = np.linspace(0, 2 * np.pi, n_out)
    X_out = np.vstack(
        (
            np.cos(theta_out) + np.random.normal(0, noise, n_out),
            np.sin(theta_out) + np.random.normal(0, noise, n_out),
        )
    ).T

    theta_in = np.linspace(0, 2 * np.pi, n_in)
    X_in = np.vstack(
        (
            factor * np.cos(theta_in) + np.random.normal(0, noise, n_in),
            factor * np.sin(theta_in) + np.random.normal(0, noise, n_in),
        )
    ).T

    X = np.vstack((X_out, X_in))
    y = np.concatenate((np.zeros(n_out), np.ones(n_in)))

    # Shuffle, so the train/test split below does not put every inner-ring point
    # in the test set.
    idx = np.arange(n_samples)
    np.random.shuffle(idx)
    return X[idx], y[idx]


class SimpleMLP(nn.Module):
    def __init__(self, input_dim=2, hidden_dim=8, output_dim=1):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),
            nn.Sigmoid(),  # squashes the output into 0..1 so BCELoss can read it
        )
        self._initialise_weights()

    def _initialise_weights(self):
        # Kaiming init, for the symmetry-breaking reason covered in Lesson 5.
        for m in self.network:
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0.0)

    def forward(self, x):
        return self.network(x)


def draw_ascii_loss_chart(losses, epochs):
    """Bar chart of the loss curve, on a LOGARITHMIC scale.

    A linear scale is useless here: the loss falls from 0.69 to 0.0003, so after
    the first two rows every bar rounds down to zero characters and the chart
    goes blank exactly where the interesting part is. Log scale keeps the whole
    decay visible.
    """
    print('\n=== Loss curve (log scale — each bar is an order of magnitude) ===')
    lo, hi = math.log10(min(losses)), math.log10(max(losses))
    span = hi - lo or 1.0
    for epoch, loss in zip(epochs, losses):
        frac = (math.log10(loss) - lo) / span
        bar = '█' * max(1, int(frac * 40))
        print(f'Epoch {epoch:4d} | loss {loss:.4f} | {bar}')


def train():
    # Seed BOTH generators. numpy seeds the data; torch seeds the initial weights.
    # Without the torch seed the loss numbers differ on every run, which makes the
    # output in the lesson impossible to compare against.
    torch.manual_seed(42)

    X_np, y_np = generate_concentric_circles(n_samples=1000)

    # Hold back 20% the model never trains on, so the final number means something.
    split = 800
    to_t = lambda a: torch.tensor(a, dtype=torch.float32)
    X_train, X_test = to_t(X_np[:split]), to_t(X_np[split:])
    # unsqueeze(1): (800,) -> (800, 1), the shape BCELoss expects
    y_train = to_t(y_np[:split]).unsqueeze(1)
    y_test = to_t(y_np[split:]).unsqueeze(1)

    model = SimpleMLP()
    criterion = nn.BCELoss()  # binary cross-entropy, for a two-class problem
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    epochs = 500
    sampled_losses, sampled_epochs = [], []

    print('=== Training an MLP on the concentric-circles data ===')
    for epoch in range(1, epochs + 1):
        model.train()

        predictions = model(X_train)  # STEP 1: forward pass
        loss = criterion(predictions, y_train)  # STEP 2: how wrong are we
        optimizer.zero_grad()  # STEP 3a: clear last round's gradients
        loss.backward()  # STEP 3b: backpropagate
        optimizer.step()  # STEP 4: nudge every weight

        if epoch == 1 or epoch % 50 == 0:
            sampled_losses.append(loss.item())
            sampled_epochs.append(epoch)
            hits = ((predictions >= 0.5).float() == y_train).float().mean().item() * 100
            print(f'Epoch {epoch:4d}/{epochs} | loss {loss.item():.4f} | train accuracy {hits:.2f}%')

    # eval() + no_grad(): stop tracking gradients, and switch layers that behave
    # differently at inference time. Neither matters for this small model, but
    # leaving them out of a real model is a bug that is hard to spot.
    model.eval()
    with torch.no_grad():
        test_preds = model(X_test)
        test_loss = criterion(test_preds, y_test).item()
        test_acc = ((test_preds >= 0.5).float() == y_test).float().mean().item() * 100

    print('\n=== After training ===')
    print(f'test loss     {test_loss:.4f}')
    print(f'test accuracy {test_acc:.2f}%')

    draw_ascii_loss_chart(sampled_losses, sampled_epochs)

    try:
        import matplotlib.pyplot as plt

        plt.figure(figsize=(8, 5))
        plt.plot(sampled_epochs, sampled_losses, marker='o', color='gold', label='loss')
        plt.yscale('log')  # same reason as the ASCII chart above
        plt.title('Loss decay — MLP classifying concentric circles')
        plt.xlabel('epoch')
        plt.ylabel('loss (log scale)')
        plt.grid(True)
        plt.legend()
        plt.savefig('loss_chart.png')
        print("\n[note] also saved a high-resolution chart to 'loss_chart.png'")
    except ImportError:
        pass  # matplotlib is optional; the ASCII chart above is enough


if __name__ == '__main__':
    train()
