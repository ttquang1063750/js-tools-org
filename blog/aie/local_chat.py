"""Lesson 13 project: talk to a local Ollama server, and measure it.

Run:  python3 local_chat.py
Needs: Ollama running, plus at least one model pulled (`ollama pull qwen2.5:7b`).

Standard library only - no `requests`, no `ollama` package. The point is to see
the HTTP stream itself rather than have a library hide it.
"""

import json
import sys
import urllib.error
import urllib.request

OLLAMA = "http://localhost:11434"
PREFERRED = ["qwen2.5-coder:7b", "qwen2.5:7b", "llama3.2", "llama3.1", "gemma2"]


def list_models():
    """Ask the server which models are pulled. Returns [] if it is not running."""
    try:
        with urllib.request.urlopen(f"{OLLAMA}/api/tags", timeout=5) as response:
            payload = json.loads(response.read())
    except urllib.error.URLError as exc:
        print(f"Cannot reach Ollama at {OLLAMA} - {exc.reason}")
        print("Start the Ollama app (or run `ollama serve`) and try again.")
        return []
    return payload.get("models", [])


def pick_model(models):
    """Choose a model that actually exists here, instead of hardcoding a name.

    Hardcoding "llama3" is the most common way this script fails for a reader:
    the server is running fine, the model simply was never pulled.
    """
    names = [m["name"] for m in models]
    for wanted in PREFERRED:
        for name in names:
            if name == wanted or name.startswith(wanted + ":"):
                return name
    return names[0] if names else None


def report_models(models):
    """Print what is installed, with the size and quantisation of each."""
    print("=== Models available on this machine ===")
    for model in models:
        details = model.get("details", {})
        print(f"  {model['name']:<30} {model['size'] / 1e9:5.2f} GB"
              f"  params={details.get('parameter_size', '?'):>7}"
              f"  quant={details.get('quantization_level', '?')}")
    print()


def stream_chat(prompt, model, show_raw_lines=0):
    """Send one chat request and print tokens as they arrive.

    Returns the final `done: true` object, which carries the timing counters.
    """
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{OLLAMA}/api/chat", data=body,
        headers={"Content-Type": "application/json"},
    )

    print(f"[{model}] {prompt}")

    final = {}
    kept = []
    try:
        with urllib.request.urlopen(request) as response:
            print("  ", end="")
            sys.stdout.flush()
            for raw in response:
                line = raw.decode("utf-8").strip()
                if not line:
                    continue  # a blank line is not JSON; json.loads() would raise
                chunk = json.loads(line)
                if len(kept) < show_raw_lines:
                    # Same line, minus two fields that repeat on every chunk,
                    # so the part that changes stays readable at this width.
                    kept.append({k: v for k, v in chunk.items()
                                 if k not in ("model", "created_at")})
                sys.stdout.write(chunk.get("message", {}).get("content", ""))
                sys.stdout.flush()
                if chunk.get("done"):
                    final = chunk
    except urllib.error.HTTPError as exc:
        # NOT the same failure as the server being down, and the message must
        # say so. HTTPError is a subclass of URLError, so the order matters:
        # catching URLError first would swallow this and blame the connection.
        detail = json.loads(exc.read() or b"{}").get("error", "no detail given")
        print(f"\n  the server answered HTTP {exc.code}: {detail}")
        print(f"  Ollama is running. Pull the model first: `ollama pull {model}`")
        return {}
    except urllib.error.URLError as exc:
        print(f"\n  cannot reach Ollama at {OLLAMA} - {exc.reason}")
        print("  Start the Ollama app (or run `ollama serve`) and try again.")
        return {}
    print()
    for number, chunk in enumerate(kept, 1):
        print(f"  chunk {number}: {json.dumps(chunk, ensure_ascii=False)}")
    if kept and final:
        counters = {k: v for k, v in final.items()
                    if k.endswith(("_count", "_duration"))}
        print(f"  last chunk carries the counters: "
              f"{json.dumps(counters, ensure_ascii=False)}")
    return final


def report_speed(final):
    """Turn the counters in the last chunk into numbers you can compare."""
    if not final:
        return
    tokens = final.get("eval_count", 0)
    eval_ns = final.get("eval_duration", 0)
    load_ns = final.get("load_duration", 0)
    prompt_tokens = final.get("prompt_eval_count", 0)
    if not eval_ns:
        return
    print(f"  generated {tokens} tokens in {eval_ns / 1e9:.2f}s"
          f"  ->  {tokens / (eval_ns / 1e9):.1f} tokens/s")
    print(f"  prompt was {prompt_tokens} tokens;"
          f" loading the model took {load_ns / 1e9:.2f}s")
    print()


def main():
    models = list_models()
    if not models:
        print("No models found. Pull one first, for example:")
        print("  ollama pull qwen2.5:7b")
        return
    report_models(models)

    model = pick_model(models)

    # First call: show the raw stream lines, so the wire format is visible.
    print("=== What the stream actually looks like ===")
    final = stream_chat("Why is the sky blue? Answer in under 12 words.",
                        model, show_raw_lines=3)
    report_speed(final)

    # Second call: the same model is already loaded, so load_duration collapses.
    print("=== Same model, second call ===")
    final = stream_chat("Name three primary colours, comma separated.", model)
    report_speed(final)

    # A model that is certainly not installed, to see the right error message.
    print("=== Asking for a model that was never pulled ===")
    stream_chat("hello", "definitely-not-a-real-model")


if __name__ == "__main__":
    main()
