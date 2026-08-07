"""Lesson 17 project: a ReAct agent written by hand, with its two sharp edges.

Run:  python3 react_agent.py
Needs: Ollama with a chat model (`ollama pull qwen2.5:7b`).

Two things this file takes seriously that a first ReAct implementation usually
does not: the agent's own output must go back as an `assistant` message rather
than as user text, and the tool that evaluates arithmetic must never be `eval`.
"""

import ast
import json
import operator
import re
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
CHAT_PREFERRED = ["qwen2.5:14b-instruct", "qwen2.5:7b", "llama3.1", "llama3.2",
                  "qwen2.5-coder:7b"]


# ---------------------------------------------------------------------------
# 1. The tools the agent is allowed to call
# ---------------------------------------------------------------------------

# Only these node types are allowed through. Note that ast.Pow is NOT here:
# the model can write 9**9**9, which passes a character filter untouched and
# then hangs the process for hours inside eval(). Blocking it is not paranoia.
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
}


def _evaluate(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in SAFE_OPERATORS:
        return SAFE_OPERATORS[type(node.op)](_evaluate(node.left),
                                             _evaluate(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in SAFE_OPERATORS:
        return SAFE_OPERATORS[type(node.op)](_evaluate(node.operand))
    raise ValueError("unsupported expression")


def calculate(expression):
    """Evaluate arithmetic without eval(): parse, then walk a whitelist."""
    try:
        return str(_evaluate(ast.parse(expression, mode="eval").body))
    except ZeroDivisionError:
        return "Division by zero."
    except (SyntaxError, ValueError, TypeError):
        return f"Cannot evaluate '{expression}' - only + - * / are supported."


def get_stock_price(symbol):
    """Look up a share price. Fixed data, so the run stays reproducible."""
    prices = {"AAPL": "185.50 USD", "GOOGL": "172.30 USD",
              "MSFT": "420.10 USD", "TSLA": "175.20 USD"}
    return prices.get(symbol.strip().upper(),
                      f"No price on file for '{symbol}'.")


TOOL_MAP = {"calculate": calculate, "get_stock_price": get_stock_price}


# ---------------------------------------------------------------------------
# 2. The system prompt that defines the ReAct protocol
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Bạn là một AI Agent hoạt động theo vòng lặp ReAct (Thought -> Action -> Observation).
Bạn được cung cấp các công cụ sau:

1. get_stock_price[symbol]: Lấy giá cổ phiếu của một mã chứng khoán. Ví dụ: get_stock_price[AAPL]
2. calculate[expression]: Thực hiện phép tính số học. Ví dụ: calculate[150 * 1.1]

Quy trình làm việc của bạn:
Bước 1: Suy nghĩ về câu hỏi của người dùng (Thought: ...)
Bước 2: Nếu cần dùng công cụ, hãy xuất ra: Action: ten_cong_cu[tham_so] rồi DỪNG LẠI.
        Tuyệt đối không tự viết dòng Observation - hệ thống sẽ cung cấp nó.
Bước 3: Sau khi nhận được Observation, tiếp tục suy nghĩ (Thought: ...) để quyết
        định hành động tiếp theo hoặc đưa ra câu trả lời cuối cùng.
Bước 4: Khi đã có câu trả lời, hãy xuất ra: Final Answer: [câu trả lời của bạn].

Bắt đầu!
"""

# Belt and braces for step 2. A well-behaved model stops on its own, but a stop
# sequence makes an invented Observation impossible rather than merely unlikely
# - the same distinction as the logit mask in Lesson 12.
STOP_SEQUENCES = ["Observation:"]


# ---------------------------------------------------------------------------
# 3. Talking to Ollama - the pattern from Lesson 13
# ---------------------------------------------------------------------------


def installed_models():
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as response:
            return [m["name"] for m in json.loads(response.read())["models"]]
    except urllib.error.URLError:
        return []


def pick(names, preferred):
    for wanted in preferred:
        for name in names:
            if name == wanted or name.startswith(wanted):
                return name
    return None


def chat(messages, model, stop=None):
    """One call. No try/except swallowing: a broken call must stop the agent.

    The earlier version of this project returned the error text as if it were
    the model's answer, so the loop went on to parse "[connection error]" as a
    Thought and carried on for five iterations.
    """
    payload = {"model": model, "messages": messages, "stream": False,
               "options": {"temperature": 0.0, **({"stop": stop} if stop else {})}}
    request = urllib.request.Request(
        f"{OLLAMA}/api/chat", data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read())["message"]["content"].strip()
    except urllib.error.HTTPError as exc:
        detail = json.loads(exc.read() or b"{}").get("error", "no detail")
        raise RuntimeError(f"Ollama answered HTTP {exc.code}: {detail}") from None
    except urllib.error.URLError as exc:
        raise RuntimeError(f"cannot reach Ollama at {OLLAMA} - {exc.reason}") from None


# ---------------------------------------------------------------------------
# 4. The ReAct control loop
# ---------------------------------------------------------------------------

ACTION_PATTERN = re.compile(r"Action:\s*(\w+)\[(.*?)\]", re.S)


def run_react_agent(question, model, max_iterations=5, use_roles=True):
    """Drive the Thought/Action/Observation loop until a Final Answer.

    use_roles=False reproduces the original mistake - see main().
    """
    print(f"Question: {question}")
    messages = [{"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question}]
    flat_context = question

    for step in range(1, max_iterations + 1):
        if use_roles:
            reply = chat(messages, model, stop=STOP_SEQUENCES)
        else:
            # Everything the agent ever said, glued into one user message.
            reply = chat([{"role": "system", "content": SYSTEM_PROMPT},
                          {"role": "user", "content": flat_context}],
                         model, stop=STOP_SEQUENCES)
        print(f"\n  --- step {step} ---")
        for line in reply.splitlines():
            if line.strip():
                print(f"  {line}")

        messages.append({"role": "assistant", "content": reply})
        flat_context += f"\n{reply}"

        if "Final Answer:" in reply:
            answer = reply.split("Final Answer:")[-1].strip()
            print(f"\n  RESULT: {answer}")
            return answer, messages

        match = ACTION_PATTERN.search(reply)
        if not match:
            print("\n  The model produced neither an Action nor a Final Answer.")
            return None, messages

        tool_name, argument = match.group(1), match.group(2)
        tool = TOOL_MAP.get(tool_name)
        observation = (tool(argument) if tool
                       else f"Error: no tool named '{tool_name}'.")
        print(f"  [tool] {tool_name}({argument!r}) -> {observation}")

        # The observation is new information from outside, so it is a user turn.
        messages.append({"role": "user", "content": f"Observation: {observation}"})
        flat_context += f"\nObservation: {observation}"

    print(f"\n  Gave up after {max_iterations} iterations.")
    return None, messages


# ---------------------------------------------------------------------------
# 5. Demonstrations
# ---------------------------------------------------------------------------


def demo_calculator_safety():
    """The tool the agent is allowed to call must survive hostile input."""
    print("=== Why the calculator does not use eval() ===")
    cases = ["185.50 * 12", "1 / 0", "9**9**9", "__import__('os').system('ls')"]
    for expression in cases:
        stripped = re.sub(r"[^0-9+\-*/().\s]", "", expression)
        survives = "**" in stripped
        print(f"  {expression!r}")
        print(f"    after the old character filter: {stripped!r}"
              f"{'   <-- ** SURVIVES' if survives else ''}")
        print(f"    this version returns: {calculate(expression)}")
    print("  A filter that keeps '*' cannot stop '**'. 9**9**9 has around 370")
    print("  million digits, so eval() on it hangs the agent indefinitely.\n")


def show_message_roles(messages):
    print("=== The message array the agent built ===")
    for message in messages:
        first_line = message["content"].splitlines()[0] if message["content"] else ""
        print(f"  {message['role']:<9} | {first_line[:58]}")
    roles = [m["role"] for m in messages]
    print(f"  assistant turns recorded: {roles.count('assistant')}")
    print("  Without them the model reads its own reasoning as if the user had")
    print("  typed it - the exact mistake Lesson 11 warns about.\n")


def main():
    names = installed_models()
    if not names:
        print("Ollama is not reachable. Start it, then run this again.")
        return
    model = pick(names, CHAT_PREFERRED)
    if not model:
        print("No suitable chat model found. Try: ollama pull qwen2.5:7b")
        return
    print(f"model: {model}\n")

    demo_calculator_safety()

    question = ("Nếu tôi mua 12 cổ phiếu AAPL thì tôi cần trả tổng cộng "
                "bao nhiêu tiền?")
    print("=== ReAct loop, with proper message roles ===")
    answer, messages = run_react_agent(question, model)
    print()
    show_message_roles(messages)

    print("=== The same question, with the history flattened into one string ===")
    print("  (this is what the first version of this project did)")
    run_react_agent(question, model, use_roles=False)


if __name__ == "__main__":
    main()
