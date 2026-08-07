"""Lesson 18 project: a stateful agent graph, built on LangGraph's ideas.

Run:  python3 langgraph_agent.py
Needs: Ollama with a chat model (`ollama pull qwen2.5:7b`).

This file does NOT import langgraph. Like every project in this series it uses
the standard library only, and reimplements the three ideas the lesson is about
so you can see them working rather than trust a library:

  * a State object whose fields are merged through per-field reducers,
  * conditional edges that make the graph cyclic (coder -> tester -> coder),
  * a real interrupt: the graph stops and hands back a checkpoint, instead of
    blocking on input() inside a node.

The generated code is executed in a separate process with a timeout, never with
exec() in this one - see the note in run_generated_code.
"""

import json
import operator
import subprocess
import sys
import tempfile
import textwrap
import re
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
CHAT_PREFERRED = ["qwen2.5:14b-instruct", "qwen2.5:7b", "qwen2.5-coder:7b",
                  "llama3.1", "llama3.2"]
MAX_RETRIES = 3


# ---------------------------------------------------------------------------
# 1. State, and the reducers that merge updates into it
# ---------------------------------------------------------------------------

# The whole point of a reducer: it says HOW a field is merged, not just what it
# holds. Fields absent from this map are overwritten, which is the default in
# LangGraph too - and the reason an unreduced history field silently vanishes.
REDUCERS = {
    "history": operator.add,
    "test_log": operator.add,
}


def merge(state, update):
    """Apply one node's return value to the state, field by field."""
    merged = dict(state)
    for key, value in update.items():
        reducer = REDUCERS.get(key)
        merged[key] = reducer(merged.get(key, type(value)()), value) if reducer else value
    return merged


def initial_state(task, expected=None):
    return {"task": task, "code": "", "history": [], "test_log": [],
            "attempts": 0, "approved": None, "expected": expected}


def demo_reducers():
    """Show the difference the reducer map makes, on one field."""
    print("=== What a reducer changes ===")
    state = {"history": ["Xin chào"], "code": "v1"}
    update = {"history": ["Tôi cần giúp đỡ"], "code": "v2"}
    print(f"  state  : {state}")
    print(f"  update : {update}")
    print(f"  merged : {merge(state, update)}")
    print("  'history' has a reducer, so it appends. 'code' has none, so it is")
    print("  overwritten. Forget the reducer and the chat history disappears")
    print("  one node at a time, with no error anywhere.\n")


# ---------------------------------------------------------------------------
# 2. Talking to Ollama - the pattern from Lesson 13
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


def chat(prompt, model):
    payload = {"model": model, "stream": False, "options": {"temperature": 0.0},
               "messages": [{"role": "user", "content": prompt}]}
    request = urllib.request.Request(
        f"{OLLAMA}/api/chat", data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read())["message"]["content"]
    except urllib.error.HTTPError as exc:
        detail = json.loads(exc.read() or b"{}").get("error", "no detail")
        raise RuntimeError(f"Ollama answered HTTP {exc.code}: {detail}") from None
    except urllib.error.URLError as exc:
        raise RuntimeError(f"cannot reach Ollama at {OLLAMA} - {exc.reason}") from None


# ---------------------------------------------------------------------------
# 3. Running model-written code without trusting it
# ---------------------------------------------------------------------------


def run_generated_code(code, timeout=5):
    """Execute the model's code in a SEPARATE process, with a time limit.

    Lesson 17 established that you never eval() model output. Running a whole
    generated program is the same problem, larger: exec(code, {}) in this
    process shares the interpreter, the filesystem and the network with the
    agent. A subprocess can at least be killed on timeout and cannot corrupt
    the parent's state. It is still not a security boundary - for untrusted
    input you need a container - but it is the minimum that is honest.
    """
    harness = textwrap.dedent("""
        import json, sys
        {code}
        try:
            print("RESULT:" + json.dumps(solve_problem()))
        except NameError:
            print("FAIL:no function named solve_problem")
        except Exception as exc:
            print("FAIL:" + type(exc).__name__ + ": " + str(exc))
    """).format(code=code)
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False,
                                     encoding="utf-8") as handle:
        handle.write(harness)
        path = handle.name
    try:
        finished = subprocess.run([sys.executable, path], capture_output=True,
                                  text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, f"timed out after {timeout}s"
    output = (finished.stdout or finished.stderr).strip().splitlines()
    last = output[-1] if output else "no output"
    if last.startswith("RESULT:"):
        return True, last[len("RESULT:"):]
    return False, last.removeprefix("FAIL:")


# ---------------------------------------------------------------------------
# 4. The nodes
# ---------------------------------------------------------------------------


def coder_node(state, model):
    print("  [coder] writing solve_problem()")
    prompt = (
        "Bạn là lập trình viên Python. Viết duy nhất một hàm tên solve_problem() "
        "giải quyết yêu cầu sau, và hàm phải RETURN kết quả chứ không print.\n"
        f"Yêu cầu: {state['task']}\n"
        "Chỉ trả về code Python trong khối ```python ... ```, không giải thích."
    )
    if state["test_log"]:
        prompt += f"\nLần chạy trước lỗi: {state['test_log'][-1]}\nHãy sửa lại."
    content = chat(prompt, model)
    match = re.search(r"```(?:python)?(.*?)```", content, re.DOTALL)
    code = (match.group(1) if match else content).strip()
    return {"code": code, "attempts": state["attempts"] + 1,
            "history": [f"coder wrote {len(code)} characters"]}


def tester_node(state):
    """Run the code AND check the answer.

    Checking only that the code ran is the weak test Lesson 10 warned about:
    a function that returns the wrong number still "passes". The expected
    value lives in the state, so the tester compares against it.
    """
    print("  [tester] running it in a subprocess")
    ok, detail = run_generated_code(state["code"])
    if ok and state.get("expected") is not None:
        if detail.strip() != json.dumps(state["expected"]):
            ok, detail = False, f"returned {detail}, expected {state['expected']}"
    print(f"  [tester] {'passed' if ok else 'failed'}: {detail}")
    return {"test_log": [f"{'SUCCESS' if ok else 'FAIL'}: {detail}"],
            "history": [f"tester reported {'success' if ok else 'failure'}"]}


def approval_node(state, decision):
    """The human turn. It takes the decision as an argument, never input()."""
    return {"approved": decision == "y",
            "history": [f"human answered {decision!r}"]}


# ---------------------------------------------------------------------------
# 5. The graph engine: conditional edges, cycles, and one real interrupt
# ---------------------------------------------------------------------------


def route_after_tester(state):
    """A conditional edge. Three outcomes, so the graph is cyclic."""
    if state["test_log"][-1].startswith("SUCCESS"):
        return "approval"
    if state["attempts"] >= MAX_RETRIES:
        return "give_up"
    return "coder"


def demo_retry_cycle():
    """Feed deliberately broken code through tester + router, no model needed.

    This exercises the conditional edge itself: does a failing test really send
    the graph back to the coder, and does the attempt limit really stop it?
    """
    print("=== The conditional edge, driven with code that cannot pass ===")
    state = initial_state("demo", expected=2)
    state = merge(state, {"code": "def solve_problem():\n    return 999"})
    for _ in range(MAX_RETRIES + 1):
        state = merge(state, {"attempts": state["attempts"] + 1})
        state = merge(state, tester_node(state))
        destination = route_after_tester(state)
        print(f"  attempt {state['attempts']} -> route to {destination!r}")
        if destination != "coder":
            break
    print(f"  The edge returned to 'coder' {MAX_RETRIES - 1} times, then gave up")
    print(f"  at the limit of {MAX_RETRIES}. That is the cycle, and its brake.\n")


def run_until_interrupt(state, model):
    """Walk the graph and STOP before the approval node, returning a checkpoint.

    This is what human-in-the-loop means in practice: the process does not sit
    blocked on input(). It saves where it is and returns. A web backend can put
    that checkpoint in a database and resume it days later from a different
    machine - impossible if the node called input().
    """
    node = "coder"
    while True:
        if node == "coder":
            state = merge(state, coder_node(state, model))
            node = "tester"
        elif node == "tester":
            state = merge(state, tester_node(state))
            node = route_after_tester(state)
        elif node == "give_up":
            return state, "give_up"
        elif node == "approval":
            return state, "approval"


def resume(state, decision):
    """Continue from the checkpoint once a human has decided."""
    state = merge(state, approval_node(state, decision))
    return state


def main():
    demo_reducers()

    names = installed_models()
    if not names:
        print("Ollama is not reachable. Start it, then run this again.")
        return
    model = pick(names, CHAT_PREFERRED)
    if not model:
        print("No suitable chat model found. Try: ollama pull qwen2.5:7b")
        return
    print(f"model: {model}\n")

    demo_retry_cycle()

    task = "Trả về phần dư của phép chia 17 cho 5."
    print(f"=== Running the graph: {task} ===")
    state, stopped_at = run_until_interrupt(initial_state(task, expected=2), model)
    print(f"\n  graph paused at: {stopped_at}   after {state['attempts']} attempt(s)")
    print(f"  proposed code:\n{textwrap.indent(state['code'], '    ')}")

    print("\n=== The checkpoint that gets handed to the human ===")
    checkpoint = json.dumps({k: v for k, v in state.items() if k != "code"},
                            ensure_ascii=False)
    print(f"  {checkpoint}")
    print("  Serialisable, so it can go in a database and be resumed later.\n")

    for decision in ("n", "y"):
        final = resume(state, decision)
        verdict = "approved" if final["approved"] else "rejected"
        print(f"=== Resuming the same checkpoint with decision {decision!r} ===")
        print(f"  result: {verdict}")
        print(f"  history: {final['history'][-1]}")
    print("\n  Both runs start from the same checkpoint, so the human's answer")
    print("  is the only thing that differs. The graph itself never re-ran.")


if __name__ == "__main__":
    main()
