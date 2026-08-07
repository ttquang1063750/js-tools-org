# word_similarity.py
# Lesson 8: Text processing & word embeddings
# Practical AI Engineer series
#
# Run it with:  python word_similarity.py
# Requires:     pip install torch
#
# IMPORTANT — THE VECTORS BELOW ARE HAND-WRITTEN, NOT TRAINED.
# This is not Word2Vec. Word2Vec is a training algorithm that reads billions of
# sentences and discovers these numbers on its own. Here the 9 vectors are typed
# out by hand, with each of the 4 dimensions given a meaning by a human, so that
# you can SEE why the geometry works. A real 300-dimensional trained embedding is
# opaque: nobody can say what dimension 174 means.
#
# The cost of that clarity is that the numbers come out artificially clean — see
# the note on the 1.0000 score at the bottom of this file.

import torch
import torch.nn as nn

vocab = {
    'king': 0,
    'queen': 1,
    'man': 2,
    'woman': 3,
    'computer': 4,
    'programming': 5,
    'artificial_intelligence': 6,
    'coffee': 7,
    'tea': 8,
}
inverse_vocab = {v: k for k, v in vocab.items()}

# Dimension 0: royalty · 1: gender (positive male, negative female)
# Dimension 2: technology · 3: drinks
embedding_weights = torch.tensor(
    [
        [1.0, 0.9, 0.0, 0.0],  # king
        [1.0, -0.9, 0.0, 0.0],  # queen
        [0.0, 1.0, 0.0, 0.0],  # man
        [0.0, -1.0, 0.0, 0.0],  # woman
        [0.0, 0.0, 1.0, 0.0],  # computer
        [0.0, 0.0, 0.9, 0.0],  # programming
        [0.0, 0.1, 1.0, 0.0],  # artificial_intelligence
        [0.0, 0.0, 0.0, 1.0],  # coffee
        [0.0, 0.0, 0.0, 0.9],  # tea
    ],
    dtype=torch.float32,
)

vocab_size, embedding_dim = embedding_weights.shape
embed = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embedding_dim)
# Fixed weights, never trained further.
embed.weight = nn.Parameter(embedding_weights, requires_grad=False)


def cosine_similarity(vector_a, matrix_b):
    """Cosine of the angle between one vector (1,d) and every row of (V,d)."""
    dot_product = torch.sum(vector_a * matrix_b, dim=1)
    norm_a = torch.norm(vector_a, p=2, dim=1)
    norm_b = torch.norm(matrix_b, p=2, dim=1)
    # +1e-8 guards against dividing by zero for an all-zero vector.
    return dot_product / (norm_a * norm_b + 1e-8)


def find_most_similar(target_word, top_n=3):
    if target_word not in vocab:
        print(f"'{target_word}' is not in the vocabulary.")
        return

    target_vector = embed(torch.tensor([vocab[target_word]]))
    scores = cosine_similarity(target_vector, embed.weight)
    top_scores, top_indices = torch.topk(scores, k=len(vocab))

    print(f"--- closest words to '{target_word}':")
    shown = 0
    for score, idx in zip(top_scores.tolist(), top_indices.tolist()):
        word = inverse_vocab[idx]
        if word == target_word:
            continue  # a word is always its own closest match; skip it
        print(f'  {shown + 1}. {word:<24} cosine {score:.4f}')
        shown += 1
        if shown >= top_n:
            break
    print()


def analogy(a, b, c, top_n=2):
    """Solve 'a is to b as c is to ?' — the classic king - man + woman."""
    vec = embed(torch.tensor([vocab[a]])) - embed(torch.tensor([vocab[b]])) + embed(torch.tensor([vocab[c]]))
    scores = cosine_similarity(vec, embed.weight)

    print(f'=== word analogy: {a} - {b} + {c}')
    shown = 0
    for score, idx in zip(*[t.tolist() for t in torch.topk(scores, k=len(vocab))]):
        word = inverse_vocab[idx]
        # Exclude the three input words. With hand-made vectors this barely
        # matters, but with REAL trained embeddings the input word almost always
        # ranks first, and forgetting to exclude it is the classic mistake that
        # makes analogy code look broken.
        if word in (a, b, c):
            continue
        print(f'  {shown + 1}. {word:<24} cosine {score:.4f}')
        shown += 1
        if shown >= top_n:
            break
    print()


if __name__ == '__main__':
    find_most_similar('coffee', top_n=2)
    find_most_similar('computer', top_n=2)
    analogy('king', 'man', 'woman')

    # Why 'tea' scores exactly 1.0000 against 'coffee': their vectors are
    # [0,0,0,1] and [0,0,0,0.9] — exactly parallel, differing only in length,
    # and cosine ignores length. A real trained embedding never gives exactly
    # 1.0 for two different words. This is the artificial cleanliness that comes
    # with hand-writing the numbers.
    print('note: coffee and tea are exactly parallel by construction, hence 1.0000.')
