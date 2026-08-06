import torch
import torch.nn as nn
import numpy as np


# Two concentric circles: the classic dataset that a single straight line cannot
# separate. Written by hand rather than imported from scikit-learn so the file
# runs with nothing but torch and numpy installed.
def generate_concentric_circles(n_samples=1000, noise=0.05, factor=0.5):
    n_samples_out = n_samples // 2
    n_samples_in = n_samples - n_samples_out

    # Outer ring, radius 1.0, label 0.
    theta_out = np.linspace(0, 2 * np.pi, n_samples_out)
    x_out = np.cos(theta_out) + np.random.normal(0, noise, n_samples_out)
    y_out = np.sin(theta_out) + np.random.normal(0, noise, n_samples_out)
    X_out = np.vstack((x_out, y_out)).T
    y_out_label = np.zeros(n_samples_out)

    # Inner ring, radius `factor`, label 1.
    theta_in = np.linspace(0, 2 * np.pi, n_samples_in)
    x_in = factor * np.cos(theta_in) + np.random.normal(0, noise, n_samples_in)
    y_in = factor * np.sin(theta_in) + np.random.normal(0, noise, n_samples_in)
    X_in = np.vstack((x_in, y_in)).T
    y_in_label = np.ones(n_samples_in)

    X = np.vstack((X_out, X_in))
    y = np.concatenate((y_out_label, y_in_label))

    # Shuffle, so the two classes are not handed to the model in blocks.
    indices = np.arange(n_samples)
    np.random.shuffle(indices)
    return X[indices], y[indices]


class SimpleMLP(nn.Module):
    def __init__(self, input_dim=2, hidden_dim=8, output_dim=1):
        # super().__init__() must come first: it sets up the bookkeeping that
        # lets PyTorch find and track every layer you assign below.
        super(SimpleMLP, self).__init__()

        # Three linear layers with a non-linearity between each pair. Remove the
        # ReLUs and the whole stack collapses into a single linear layer.
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),  # hidden layer 1
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),  # hidden layer 2
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),  # output layer
            nn.Sigmoid(),  # squash to [0, 1] so the output reads as a probability
        )

        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                # Kaiming is the right choice here because the hidden layers use
                # ReLU. Xavier would under-scale the variance for that activation.
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                if m.bias is not None:
                    # Bias can safely start at 0 — the random weights already
                    # break the symmetry between neurons.
                    nn.init.constant_(m.bias, 0.0)

    def forward(self, x):
        return self.network(x)


if __name__ == "__main__":
    print("=== Generating the two-circles dataset ===")
    X_np, y_np = generate_concentric_circles(n_samples=10, noise=0.05, factor=0.5)
    print(f"Shape of X: {X_np.shape} (10 samples, each an (x, y) coordinate)")
    print(f"Labels y: {y_np} (0 = outer ring, 1 = inner ring)\n")

    X_tensor = torch.tensor(X_np, dtype=torch.float32)

    print("=== Building the MLP ===")
    model = SimpleMLP(input_dim=2, hidden_dim=8, output_dim=1)
    print(model)
    n_params = sum(p.numel() for p in model.parameters())
    print(f"Trainable parameters: {n_params}")

    print("\n=== Forward pass on the untrained network ===")
    # eval() switches off training-only layers. This model has none, but making
    # it a habit costs nothing and prevents a whole class of bug later.
    model.eval()
    with torch.no_grad():
        predictions = model(X_tensor)

    print("Raw probabilities from the untrained model:")
    for i in range(len(X_np)):
        print(
            f"Point: [{X_np[i][0]:6.3f}, {X_np[i][1]:6.3f}] | "
            f"P(class 1) = {predictions[i].item():.4f} | true label: {int(y_np[i])}"
        )

    print("\nThe network has not been trained, so these probabilities carry no")
    print("information yet — they hover around 0.5 regardless of the true label.")
