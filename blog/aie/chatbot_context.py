"""Lesson 11 project: a chat client whose sampling knobs actually do something.

Run:  python3 chatbot_context.py
Optional, for real token counts:  pip install tiktoken

The reply text is canned so the file runs with no API key and no network.
Everything else - the softmax, the temperature scaling, the top-p cut, the
sliding context window - is the real algorithm, not a stub.
"""

import math
import random

try:
    import tiktoken

    HAS_TIKTOKEN = True
except ImportError:
    HAS_TIKTOKEN = False


# ---------------------------------------------------------------------------
# Part 1 - the two sampling knobs, implemented rather than described
# ---------------------------------------------------------------------------


def softmax(logits, temperature=1.0):
    """Raw scores -> probabilities, after dividing every score by T."""
    if temperature <= 0:
        raise ValueError("temperature must be > 0 (T=0 means greedy decoding)")
    scaled = [z / temperature for z in logits]
    # Subtracting the max changes nothing mathematically, but it stops exp()
    # overflowing at small T, where z/T grows very large.
    ceiling = max(scaled)
    exps = [math.exp(s - ceiling) for s in scaled]
    total = sum(exps)
    return [e / total for e in exps]


def nucleus_filter(probs, top_p):
    """Keep the fewest top candidates whose probabilities first sum past top_p.

    Returns (kept_indices, probabilities renormalised over those indices).
    """
    order = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
    kept, running = [], 0.0
    for i in order:
        kept.append(i)
        running += probs[i]
        if running >= top_p:
            break  # everything from here on is the tail we throw away
    mass = sum(probs[i] for i in kept)
    return kept, [probs[i] / mass for i in kept]


def sample(candidates, logits, temperature, top_p, rng):
    """Pick one candidate the way a model picks its next token."""
    probs = softmax(logits, temperature)
    kept, kept_probs = nucleus_filter(probs, top_p)
    chosen = rng.choices(kept, weights=kept_probs, k=1)[0]
    return candidates[chosen]


def demo_sampling_knobs():
    """Print the exact numbers the lesson quotes, so you can check them."""
    logits = [4.0, 3.0, 2.0, 1.0, 0.5]
    print("=== What temperature does to one distribution ===")
    print(f"raw logits: {logits}")
    for t in (0.1, 1.0, 5.0):
        row = "  ".join(f"{p:.4f}" for p in softmax(logits, t))
        print(f"  T={t:<4} -> {row}")

    print("\n=== What top-p keeps, out of that T=1.0 distribution ===")
    probs = softmax(logits, 1.0)
    running = 0.0
    for rank, p in enumerate(sorted(probs, reverse=True)):
        running += p
        print(f"  rank {rank}: p={p:.4f}   cumulative={running:.4f}")
    kept, _ = nucleus_filter(probs, 0.9)
    print(f"  top_p=0.9 keeps {len(kept)} of {len(probs)} candidates, drops the rest")


# ---------------------------------------------------------------------------
# Part 2 - counting tokens: the estimate everyone writes, and what it costs
# ---------------------------------------------------------------------------


def naive_tokens(text):
    """The estimate you will find in most tutorials: words x 1.3."""
    return int(len(text.split()) * 1.3)


def make_counter(encoding_name="cl100k_base"):
    """Return a token counter: the real tokenizer if available, else the guess."""
    if not HAS_TIKTOKEN:
        return naive_tokens
    encoder = tiktoken.get_encoding(encoding_name)
    return lambda text: len(encoder.encode(text))


def demo_token_estimate(texts):
    """Show how far the words x 1.3 guess lands from two real tokenizers."""
    print("=== How many tokens is this conversation, really? ===")
    words = sum(len(t.split()) for t in texts)
    guess = sum(naive_tokens(t) for t in texts)
    print(f"  words in the sample text : {words}")
    print(f"  naive estimate (x1.3)    : {guess}")
    if not HAS_TIKTOKEN:
        print("  tiktoken is not installed, so the real counts are skipped.")
        print("  Install it with `pip install tiktoken` to see them.")
        return
    for name in ("cl100k_base", "o200k_base"):
        encoder = tiktoken.get_encoding(name)
        real = sum(len(encoder.encode(t)) for t in texts)
        error = (guess - real) / real * 100
        print(f"  {name:<12} actual   : {real:<4} (the guess is off by {error:+.0f}%)")


# ---------------------------------------------------------------------------
# Part 3 - a stand-in chat API
# ---------------------------------------------------------------------------


class MockLLMClient:
    """A stand-in for a real chat API, so this file runs with no key.

    Each topic offers several phrasings with fixed logits. Which phrasing comes
    back is decided by the same softmax + top-p sampling used above, so
    temperature and top_p visibly change the output instead of being ignored.
    """

    TOPICS = {
        "chào": (
            [
                "Xin chào! Tôi là trợ lý AI thực chiến, bạn cần giúp gì?",
                "Chào bạn, tôi đang sẵn sàng.",
                "Ối dào, chào bạn nhé, hôm nay trời đẹp ghê!",
            ],
            [4.0, 2.5, 0.5],
        ),
        "toán": (
            [
                "Toán học là ngôn ngữ của vũ trụ. Bạn cần giải bài nào?",
                "Cứ đưa bài toán ra, tôi giải từng bước một.",
                "Toán á? Tôi thích lắm, kể tôi nghe đi!",
            ],
            [4.0, 2.5, 0.5],
        ),
        "code": (
            [
                "Lập trình là cách ta nói chuyện với máy. Bạn dùng ngôn ngữ gì?",
                "Bạn muốn viết code gì, tôi xem giúp cho.",
                "Code hả? Chơi luôn, quăng file đây!",
            ],
            [4.0, 2.5, 0.5],
        ),
        "ai": (
            [
                "Trí tuệ nhân tạo đang đổi thay thế giới qua kiến trúc Transformer.",
                "AI là các mô hình học từ dữ liệu để đoán bước tiếp theo.",
                "AI hả? Nói cả ngày không hết chuyện đâu!",
            ],
            [4.0, 2.5, 0.5],
        ),
    }

    FALLBACK = (
        [
            "Tôi đã ghi nhận. Lịch sử hội thoại vẫn đang nằm trong bộ đệm.",
            "Rõ rồi, tôi nhớ đấy.",
        ],
        [4.0, 1.0],
    )

    def __init__(self, seed=42):
        # A fixed seed so two runs of this file print the same thing.
        self.rng = random.Random(seed)

    def generate_response(self, messages, temperature=1.0, top_p=1.0):
        """Answer the last user message, sampling with the knobs given."""
        last_user = messages[-1]["content"].lower()
        candidates, logits = self.FALLBACK
        for keyword, (options, scores) in self.TOPICS.items():
            if keyword in last_user:
                candidates, logits = options, scores
                break
        return sample(candidates, logits, temperature, top_p, self.rng)


# ---------------------------------------------------------------------------
# Part 4 - the sliding context window
# ---------------------------------------------------------------------------


class ContextChatbot:
    """A chat loop that keeps the request under a token budget.

    prune_after_reply exists to demonstrate a bug on purpose - see main().
    """

    def __init__(self, system_prompt, max_tokens=80, count_tokens=None,
                 temperature=1.0, top_p=1.0, prune_after_reply=True, quiet=False):
        self.client = MockLLMClient()
        self.max_tokens = max_tokens
        self.count_tokens = count_tokens or naive_tokens
        self.temperature = temperature
        self.top_p = top_p
        self.prune_after_reply = prune_after_reply
        self.quiet = quiet
        # The system prompt sits outside the history so pruning can never eat it.
        self.system_message = {"role": "system", "content": system_prompt}
        self.history = []

    def total_tokens(self):
        """Tokens in everything we would send: system prompt plus history."""
        total = self.count_tokens(self.system_message["content"])
        for message in self.history:
            total += self.count_tokens(message["content"])
        return total

    def _log(self, text):
        if not self.quiet:
            print(text)

    def prune(self, phase):
        """Drop the oldest messages until the whole request fits the budget."""
        while self.total_tokens() > self.max_tokens and self.history:
            dropped = self.history.pop(0)
            self._log(f"  [prune {phase}] dropped {dropped['role']}: "
                      f"'{dropped['content'][:30]}...'")
            # A history that now begins with an assistant turn is an answer to a
            # question the model can no longer see. Drop that orphan too.
            while self.history and self.history[0]["role"] == "assistant":
                orphan = self.history.pop(0)
                self._log(f"  [prune {phase}] dropped its orphaned reply: "
                          f"'{orphan['content'][:30]}...'")

    def build_payload(self):
        """The exact array a real chat API expects as its `messages` field."""
        return [self.system_message] + self.history

    def chat(self, user_input):
        self.history.append({"role": "user", "content": user_input})
        self.prune("before")  # make THIS request fit
        payload = self.build_payload()
        reply = self.client.generate_response(payload, self.temperature, self.top_p)
        self.history.append({"role": "assistant", "content": reply})
        if self.prune_after_reply:
            self.prune("after")  # and make the NEXT one fit too
        return reply


SYSTEM_PROMPT = "Bạn là một trợ lý AI chuyên nghiệp, vui vẻ và súc tích."

# Deliberately small, so the window slides within five turns instead of five
# hundred. A real deployment sits far below the model's own context limit.
BUDGET = 120

SAMPLE_TURNS = [
    "Xin chào trợ lý, bạn khỏe không?",
    "Tôi muốn hỏi một chút kiến thức về Toán học AI.",
    "Tôi cũng cần viết một số đoạn code Python.",
    "Trí tuệ nhân tạo AI là gì?",
    "Cảm ơn bạn rất nhiều nhé.",
]


def demo_temperature_on_replies(draws=200):
    """Ask the same question 200 times per temperature and tally the answers."""
    print("=== The same question, 200 times, at three temperatures ===")
    question = [{"role": "user", "content": "Xin chào, bạn khỏe không?"}]
    options, _ = MockLLMClient.TOPICS["chào"]
    for temperature in (0.2, 1.0, 6.0):
        client = MockLLMClient(seed=42)
        tally = {text: 0 for text in options}
        for _ in range(draws):
            tally[client.generate_response(question, temperature)] += 1
        share = "  ".join(f"{tally[text] / draws:.0%}" for text in options)
        print(f"  T={temperature:<4} -> {share}   (phrasing 1 / 2 / 3)")
    print("  T=0.2 always returns the top-scoring phrasing; T=6.0 spreads out.")
    print()


def run_conversation(label, **kwargs):
    """Run the sample turns through one chatbot and report the peak usage."""
    print(f"=== {label} ===")
    bot = ContextChatbot(SYSTEM_PROMPT, **kwargs)
    peak = 0
    for turn in SAMPLE_TURNS:
        print(f"User: {turn}")
        print(f"Assistant: {bot.chat(turn)}")
        used = bot.total_tokens()
        peak = max(peak, used)
        flag = "" if used <= bot.max_tokens else "   <-- OVER BUDGET"
        print(f"  buffer: {used}/{bot.max_tokens} tokens{flag}\n")
    return bot, peak


def main():
    demo_sampling_knobs()
    print()
    demo_token_estimate([SYSTEM_PROMPT] + SAMPLE_TURNS)
    print()

    counter = make_counter("cl100k_base")
    demo_temperature_on_replies()

    # The window, done right.
    good, peak = run_conversation("Sliding window, pruning after the reply",
                                  max_tokens=BUDGET, count_tokens=counter,
                                  temperature=0.2)
    print(f"peak usage: {peak}/{BUDGET} tokens")
    assert peak <= BUDGET, "the buffer went over budget"
    print("PASS - the buffer never exceeded its budget.\n")

    # The same code with the second prune removed, to show the test can fail.
    print("=== The same window, pruning ONLY before the request ===")
    bad = ContextChatbot(SYSTEM_PROMPT, max_tokens=BUDGET, count_tokens=counter,
                         temperature=0.2, prune_after_reply=False, quiet=True)
    over = 0
    for turn in SAMPLE_TURNS:
        bad.chat(turn)
        used = bad.total_tokens()
        over = max(over, used)
        flag = "" if used <= BUDGET else "   <-- OVER BUDGET"
        print(f"  buffer after this turn: {used}/{BUDGET}{flag}")
    print(f"peak usage: {over}/{BUDGET} tokens")
    print("FAIL - the reply is appended after the only check, so nothing ever")
    print("       measures it. Two of the five turns end over budget.\n")

    print("=== What actually goes over the wire on the next call ===")
    for message in good.build_payload():
        print(f"  {message['role']:<9} | {message['content'][:56]}")


if __name__ == "__main__":
    main()
