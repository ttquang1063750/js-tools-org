# train_mnist_cnn.py
# Lesson 7: Computer vision basics — convolutional networks
# Practical AI Engineer series
#
# Run it with:  python train_mnist_cnn.py
# Requires:     pip install torch numpy       (no download, no torchvision)
#
# WHY THE DATA IS SYNTHETIC, AND WHAT THAT COSTS
# Real MNIST needs a ~10 MB download and torchvision, which makes the lesson fail
# on a bad connection. So this script draws its own dataset: ten distinct shapes
# standing in for ten digit classes, plus noise and a random offset.
#
# The important part: these shapes are GENUINELY LEARNABLE. An earlier version of
# this script fed the network `np.random.randn` images with `np.random.randint`
# labels — pure noise with no relationship between image and label. That task is
# unlearnable by construction, so accuracy sat at chance level while the training
# loss still fell, because the network was memorising 200 random labels. A falling
# loss with chance-level accuracy is the signature of exactly that mistake.
#
# To train on real MNIST instead, install torchvision and replace
# make_shape_dataset() with torchvision.datasets.MNIST. Everything else is unchanged.

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

CLASS_NAMES = [
    'ring',
    'vertical bar',
    'horizontal bar',
    'plus',
    'diagonal \\',
    'diagonal /',
    'cross X',
    'hollow box',
    'solid box',
    'double bar',
]


def draw_shape(cls, rng):
    """One 28x28 shape for the given class, jittered slightly off centre."""
    img = np.zeros((28, 28), dtype=np.float32)
    cy, cx = rng.integers(11, 17), rng.integers(11, 17)
    t = 2  # stroke thickness
    clip = lambda v: int(np.clip(v, 0, 27))

    if cls == 0:  # ring
        yy, xx = np.ogrid[:28, :28]
        r = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
        img[(r > 6) & (r < 6 + t + 1)] = 1
    elif cls == 1:  # vertical bar
        img[cy - 9 : cy + 9, cx - 1 : cx + t] = 1
    elif cls == 2:  # horizontal bar
        img[cy - 1 : cy + t, cx - 9 : cx + 9] = 1
    elif cls == 3:  # plus
        img[cy - 9 : cy + 9, cx - 1 : cx + t] = 1
        img[cy - 1 : cy + t, cx - 9 : cx + 9] = 1
    elif cls == 4:  # diagonal \
        for k in range(-9, 9):
            img[clip(cy + k), clip(cx + k)] = 1
    elif cls == 5:  # diagonal /
        for k in range(-9, 9):
            img[clip(cy + k), clip(cx - k)] = 1
    elif cls == 6:  # cross X
        for k in range(-9, 9):
            img[clip(cy + k), clip(cx + k)] = 1
            img[clip(cy + k), clip(cx - k)] = 1
    elif cls == 7:  # hollow box
        img[cy - 8 : cy + 8, cx - 8 : cx - 8 + t] = 1
        img[cy - 8 : cy + 8, cx + 8 - t : cx + 8] = 1
        img[cy - 8 : cy - 8 + t, cx - 8 : cx + 8] = 1
        img[cy + 8 - t : cy + 8, cx - 8 : cx + 8] = 1
    elif cls == 8:  # solid box
        img[cy - 6 : cy + 6, cx - 6 : cx + 6] = 1
    else:  # double bar
        img[cy - 5 : cy - 5 + t, cx - 8 : cx + 8] = 1
        img[cy + 5 : cy + 5 + t, cx - 8 : cx + 8] = 1
    return img


def make_shape_dataset(n_samples=2000, seed=42):
    """Balanced dataset of the ten shapes, with noise, shuffled."""
    rng = np.random.default_rng(seed)
    X = np.empty((n_samples, 1, 28, 28), dtype=np.float32)
    y = np.empty(n_samples, dtype=np.int64)
    for i in range(n_samples):
        cls = i % 10
        X[i, 0] = np.clip(draw_shape(cls, rng) + rng.normal(0, 0.12, (28, 28)), 0, 1)
        y[i] = cls
    order = rng.permutation(n_samples)
    return torch.tensor(X[order]), torch.tensor(y[order])


class MNIST_CNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),  # 28x28 -> 14x14
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),  # 14x14 -> 7x7
        )
        # 32 * 7 * 7 is not a magic number: it is the shape the block above emits.
        # Get it wrong and you get "mat1 and mat2 shapes cannot be multiplied".
        self.classifier = nn.Sequential(
            nn.Linear(32 * 7 * 7, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes),  # raw logits — CrossEntropyLoss wants logits
        )

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)  # keep the batch dimension, flatten the rest
        return self.classifier(x)


def print_sample(img, label):
    """Show one training image as text, so you can see what the network sees."""
    print(f'\nsample input — class {label} ({CLASS_NAMES[label]}):')
    for row in range(4, 26):
        print('  ' + ''.join('#' if v > 0.5 else ('.' if v > 0.25 else ' ') for v in img[row]))


def train():
    torch.manual_seed(42)

    X, y = make_shape_dataset(2000)
    split = 1600
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]
    print(f'train {tuple(X_train.shape)} | validation {tuple(X_val.shape)}')
    print_sample(X_train[0, 0].numpy(), int(y_train[0]))

    model = MNIST_CNN()
    n_params = sum(p.numel() for p in model.parameters())
    print(f'\nmodel has {n_params:,} parameters')

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    epochs, batch_size = 30, 64
    print('\n=== training ===')
    for epoch in range(1, epochs + 1):
        model.train()
        running = 0.0
        # Mini-batches, not one giant batch: more update steps per pass over the
        # data, which is how real training is always done.
        for start in range(0, len(X_train), batch_size):
            xb = X_train[start : start + batch_size]
            yb = y_train[start : start + batch_size]
            optimizer.zero_grad()
            loss = criterion(model(xb), yb)
            loss.backward()
            optimizer.step()
            running += loss.item() * len(xb)

        if epoch % 5 == 0 or epoch == 1:
            model.eval()
            with torch.no_grad():
                val_acc = (model(X_val).argmax(1) == y_val).float().mean().item() * 100
            print(f'epoch {epoch:2d}/{epochs} | train loss {running / len(X_train):.4f} | val accuracy {val_acc:.2f}%')

    model.eval()
    with torch.no_grad():
        preds = model(X_val).argmax(1)
    acc = (preds == y_val).float().mean().item() * 100
    print(f'\n=== final validation accuracy: {acc:.2f}%  (chance level is 10%) ===')

    # Per-class accuracy: an overall number can hide one class the model never gets.
    print('\nper-class accuracy:')
    for cls in range(10):
        mask = y_val == cls
        if mask.sum():
            hit = (preds[mask] == cls).float().mean().item() * 100
            print(f'  {cls} {CLASS_NAMES[cls]:16} {hit:6.1f}%  ({int(mask.sum())} samples)')


if __name__ == '__main__':
    train()
