# image_normalize.py
# Lesson 3: Working with large data — NumPy & Pandas in depth
# Practical AI Engineer series
#
# Run it with:  python image_normalize.py
# Requires:     pip install numpy pandas
#
# A small but complete preprocessing pipeline, the shape you meet in real
# projects: Pandas inspects and cleans the batch metadata, then NumPy does the
# heavy per-pixel arithmetic. Not one `for` loop over pixels anywhere.

import numpy as np
import pandas as pd

BATCH, HEIGHT, WIDTH = 12, 28, 28


def generate_dummy_images(num_images=BATCH, height=HEIGHT, width=WIDTH):
    """Fake a batch of grayscale images that genuinely differ from each other.

    Each image gets its own brightness level and its own amount of noise, so the
    per-image statistics below actually vary. (Drawing every image from the same
    uniform 0-255 distribution would make them statistically identical, and the
    normalisation step would have nothing to show.)

    Two images are deliberately broken, to give the cleaning step real work:
    one is entirely black, one is entirely white.
    """
    rng = np.random.default_rng(42)
    images = np.empty((num_images, height, width), dtype=np.uint8)

    for i in range(num_images):  # per IMAGE, not per pixel — 12 iterations, not 9408
        brightness = 40 + i * 15  # 40, 55, 70, ... a different level each time
        noise = rng.normal(0.0, 18.0, size=(height, width))
        images[i] = np.clip(brightness + noise, 0, 255).astype(np.uint8)

    images[3] = 0  # a dead sensor: completely black
    images[8] = 255  # an overexposed frame: completely white
    return images


def describe_batch(images):
    """Build a Pandas table of per-image statistics — one row per image.

    This is what Pandas is for: a small table with named, mixed-type columns that
    you want to inspect, filter and group. The pixels themselves stay in NumPy.
    """
    flat = images.reshape(len(images), -1)  # (batch, height*width), still no loop
    df = pd.DataFrame(
        {
            "image_id": np.arange(len(images)),
            "camera": ["cam-a", "cam-b"] * (len(images) // 2),
            "mean": flat.mean(axis=1),  # axis=1 -> collapse pixels, keep images
            "std": flat.std(axis=1),
            "min": flat.min(axis=1),
            "max": flat.max(axis=1),
        }
    )
    # A flat image has zero variation in it, so std == 0 marks a broken frame.
    # Storing the verdict as a column keeps the rule in one readable place.
    df["is_flat"] = df["std"] == 0
    return df


def normalise(images):
    """Min-max scale to [0, 1] and z-score standardise, both fully vectorised."""
    if not isinstance(images, np.ndarray):
        raise TypeError("expected a NumPy ndarray")

    x = images.astype(np.float32)

    lo, hi = x.min(), x.max()
    span = hi - lo or 1.0  # guard against a batch where every pixel is identical
    minmax = (x - lo) / span

    mean, std = x.mean(), x.std()
    zscore = (x - mean) / (std or 1.0)
    return minmax, zscore, float(mean), float(std)


if __name__ == "__main__":
    raw = generate_dummy_images()
    print(f"raw batch: {raw.shape}  (batch x height x width), dtype={raw.dtype}")

    print("\n=== Pandas: per-image statistics ===")
    stats = describe_batch(raw)
    print(stats.round(2).to_string(index=False))

    print("\n=== Pandas: average brightness per camera ===")
    print(stats.groupby("camera")["mean"].mean().round(2).to_string())

    bad = stats.loc[stats["is_flat"], "image_id"].to_numpy()
    print(f"\nflat (broken) images found: {bad.tolist()}")

    keep = stats.loc[~stats["is_flat"], "image_id"].to_numpy()
    clean = raw[keep]  # NumPy fancy indexing: select rows by an array of positions
    print(f"kept {len(clean)} of {len(raw)} images -> {clean.shape}")

    print("\n=== NumPy: vectorised normalisation ===")
    minmax, zscore, mean, std = normalise(clean)
    print(f"batch mean = {mean:.4f} | batch std = {std:.4f}")
    print(f"after min-max: min = {minmax.min():.4f}, max = {minmax.max():.4f}")
    print("  (expected exactly 0 and 1)")
    print(f"after z-score: mean = {zscore.mean():.4f}, std = {zscore.std():.4f}")
    print("  (expected ~0 and ~1)")
