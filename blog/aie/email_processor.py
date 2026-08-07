"""Lesson 12 project: structured outputs and function calling, made checkable.

Run:  python3 email_processor.py

No API key and no network. The model is mocked, but everything the lesson
claims is executed here: JSON Schema validation actually runs and actually
fails, constrained decoding actually masks logits, and the extracted fields
actually come from the input email rather than from a constant.
"""

import json
import math
import random
import re

# ---------------------------------------------------------------------------
# Part 1 - the schema, and what "valid JSON" does not buy you
# ---------------------------------------------------------------------------

EMAIL_SCHEMA = {
    "type": "object",
    "properties": {
        "sender": {"type": "string"},
        "urgency": {"type": "string", "enum": ["low", "high"]},
        "summary": {"type": "string"},
    },
    "required": ["sender", "urgency", "summary"],
    "additionalProperties": False,
}

TYPES = {"string": str, "number": (int, float), "boolean": bool, "object": dict}


def validate(obj, schema):
    """Check obj against a small subset of JSON Schema. Returns a list of errors.

    An empty list means valid. This is deliberately hand-written: the point is
    that the check is separate from parsing, not that it is production-grade.
    """
    errors = []
    if not isinstance(obj, dict):
        return [f"expected an object, got {type(obj).__name__}"]
    for field in schema.get("required", []):
        if field not in obj:
            errors.append(f"missing required field '{field}'")
    for key, value in obj.items():
        rule = schema["properties"].get(key)
        if rule is None:
            if not schema.get("additionalProperties", True):
                errors.append(f"unexpected field '{key}'")
            continue
        expected = TYPES[rule["type"]]
        if not isinstance(value, expected):
            errors.append(f"field '{key}' should be {rule['type']}")
        elif "enum" in rule and value not in rule["enum"]:
            errors.append(f"field '{key}' must be one of {rule['enum']}, got '{value}'")
    return errors


def demo_json_mode_gap(schema):
    """Three replies a model might return, put through parse + validate."""
    replies = [
        ('complete and correct',
         '{"sender": "a@b.com", "urgency": "high", "summary": "DB is down"}'),
        ('valid JSON, missing a required field',
         '{"sender": "a@b.com", "summary": "DB is down"}'),
        ('valid JSON, urgency outside the enum',
         '{"sender": "a@b.com", "urgency": "khan cap", "summary": "DB is down"}'),
        ('wrapped in a markdown fence, as models love to do',
         'Here is your result:\n```json\n{"sender": "a@b.com"}\n```'),
    ]
    print("=== JSON Mode guarantees syntax, not shape ===")
    for label, raw in replies:
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            print(f"  {label}")
            print(f"    json.loads : CRASHED - {exc.msg}")
            print(f"    validate   : never reached\n")
            continue
        errors = validate(parsed, schema)
        verdict = "OK" if not errors else "; ".join(errors)
        print(f"  {label}")
        print(f"    json.loads : ok")
        print(f"    validate   : {verdict}\n")


# ---------------------------------------------------------------------------
# Part 2 - why Structured Outputs cannot fail: constrained decoding
# ---------------------------------------------------------------------------

# A toy vocabulary. A real model has ~100k of these; the mechanism is identical.
VOCAB = ['{', '}', ':', ',', '"urgency"', '"summary"', '"low"', '"high"',
         'Chao', 'ban', 'nhe']

# The grammar as a state machine: at step i, only these tokens keep the output
# on a path that can still finish as a valid object matching the schema.
ALLOWED = [
    ['{'],
    ['"urgency"'],
    [':'],
    ['"low"', '"high"'],
    ['}'],
]


def softmax(logits, temperature=1.0):
    """Same function as Lesson 11, repeated here so this file stands alone."""
    scaled = [z / temperature for z in logits]
    ceiling = max(scaled)
    exps = [math.exp(s - ceiling) for s in scaled]
    total = sum(exps)
    return [e / total for e in exps]


def generate(rng, constrained, temperature=2.0):
    """Emit five tokens. With constrained=True, illegal tokens are masked off."""
    out = []
    for step in range(len(ALLOWED)):
        # Pretend the model's raw preferences are mildly random each step.
        logits = [rng.uniform(0.0, 4.0) for _ in VOCAB]
        if constrained:
            # This is the whole trick: drive illegal tokens to -infinity BEFORE
            # softmax, so their probability is exactly zero, not merely small.
            legal = set(ALLOWED[step])
            logits = [z if t in legal else -1e9 for z, t in zip(logits, VOCAB)]
        probs = softmax(logits, temperature)
        out.append(rng.choices(VOCAB, weights=probs, k=1)[0])
    return "".join(out)


def demo_constrained_decoding(trials=500):
    """Count how many generations parse, with and without the mask."""
    print("=== Constrained decoding: masking logits before softmax ===")
    for label, constrained in (("free sampling", False), ("constrained", True)):
        rng = random.Random(42)
        valid = 0
        first_bad = None
        for _ in range(trials):
            text = generate(rng, constrained)
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                if first_bad is None:
                    first_bad = text
                continue
            if not validate(parsed, {"type": "object",
                                     "properties": EMAIL_SCHEMA["properties"],
                                     "required": ["urgency"]}):
                valid += 1
            elif first_bad is None:
                first_bad = text
        print(f"  {label:<14}: {valid}/{trials} parsed and matched the schema")
        if first_bad is not None:
            print(f"                  first failure looked like: {first_bad}")
    print("  Masking makes an invalid token unreachable, not just unlikely.\n")


# ---------------------------------------------------------------------------
# Part 3 - the local tools the model is allowed to ask for
# ---------------------------------------------------------------------------

TOOL_SPECS = [
    {
        "type": "function",
        "function": {
            "name": "send_alert_email",
            "description": "Send an urgent alert email to the systems administrator.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recipient_email": {"type": "string"},
                    "subject": {"type": "string"},
                    "alert_content": {"type": "string"},
                },
                "required": ["recipient_email", "subject", "alert_content"],
            },
        },
    }
]

SENT_MAILBOX = []  # so the test at the end can check the tool really ran


def send_alert_email(recipient_email, subject, alert_content):
    """The real local action. In production this would hit an SMTP server."""
    print(f"  [ACTION] sending alert email")
    print(f"    to      : {recipient_email}")
    print(f"    subject : {subject}")
    print(f"    body    : {alert_content[:60]}")
    SENT_MAILBOX.append({"to": recipient_email, "subject": subject})
    return json.dumps({"status": "delivered", "recipient": recipient_email})


# ---------------------------------------------------------------------------
# Part 4 - a mock model that extracts from the input instead of inventing it
# ---------------------------------------------------------------------------

URGENT_WORDS = ["khẩn cấp", "sập nguồn", "sự cố", "không thể kết nối", "treo"]


class MockStructuredLLM:
    """Stands in for a model called with response_format + tools.

    Every field it returns is derived from the text it was given. That matters:
    a mock that returns constants would still print a convincing transcript
    while proving nothing about extraction.
    """

    def process_request(self, messages, tools=None):
        body = messages[-1]["content"]

        # sender: the first address actually present in the email text
        match = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", body)
        sender = match.group(0) if match else "unknown@unknown"

        # urgency: keyword evidence from the text, not a hardcoded branch
        lowered = body.lower()
        hits = [w for w in URGENT_WORDS if w in lowered]
        urgency = "high" if hits else "low"

        # summary: the first sentence of the email, trimmed
        first = re.split(r"(?<=[.!?])\s", body.strip())[0]
        summary = first if len(first) <= 90 else first[:87] + "..."

        data = {"sender": sender, "urgency": urgency, "summary": summary}
        errors = validate(data, EMAIL_SCHEMA)
        if errors:
            raise ValueError(f"the model broke its own schema: {errors}")

        if urgency == "low" or not tools:
            return {"type": "structured", "content": data, "evidence": hits}

        return {
            "type": "tool_call",
            "content": data,
            "evidence": hits,
            "tool_call": {
                "id": "call_0001",
                "name": "send_alert_email",
                "arguments": {
                    "recipient_email": "admin_ops@company.com",
                    "subject": f"URGENT: {summary[:40]}",
                    "alert_content": f"Reported by {sender}: {summary}",
                },
            },
        }


class EmailProcessingPipeline:
    """Runs the four-step tool loop and keeps the message array it built."""

    def __init__(self):
        self.model = MockStructuredLLM()
        self.available_tools = {"send_alert_email": send_alert_email}

    def run(self, raw_email_body):
        print(f"  input: '{raw_email_body[:72]}...'")

        # Step 1 - send the request, declaring which tools exist.
        messages = [
            {"role": "system", "content": "You classify support email precisely."},
            {"role": "user", "content": raw_email_body},
        ]
        # Step 2 - the model answers with structured data, and maybe a tool call.
        response = self.model.process_request(messages, tools=TOOL_SPECS)

        data = response["content"]
        print(f"  extracted sender  : {data['sender']}")
        print(f"  extracted urgency : {data['urgency']}"
              f"   evidence: {response['evidence'] or 'none'}")
        print(f"  extracted summary : {data['summary'][:60]}")

        if response["type"] != "tool_call":
            print("  no tool needed; the record goes straight to the database\n")
            return messages, data

        call = response["tool_call"]
        function = self.available_tools.get(call["name"])
        if function is None:
            raise KeyError(f"the model asked for an unknown tool: {call['name']}")

        # Step 3 - our code runs the function. The model never touches it.
        observation = function(**call["arguments"])

        # Step 4 - hand the result back, tagged with the role "tool".
        messages.append({"role": "assistant", "content": None,
                         "tool_calls": [call]})
        messages.append({"role": "tool", "tool_call_id": call["id"],
                         "content": observation})
        print(f"  observation returned to the model: {observation}\n")
        return messages, data


SAMPLE_EMAILS = [
    "Xin chào, tôi là lan.pham@khachhang.vn, tôi cảm ơn đội ngũ kỹ thuật rất "
    "nhiều. Tôi muốn hỏi thêm thông tin về lịch khai giảng khóa sau.",
    "Cảnh báo khẩn cấp từ monitor@company.com: cơ sở dữ liệu chính đang bị treo "
    "và sập nguồn, không thể kết nối từ 3 giờ sáng!",
]


def main():
    demo_json_mode_gap(EMAIL_SCHEMA)
    demo_constrained_decoding()

    print("=== The four-step tool loop, on two real emails ===")
    transcripts = [EmailProcessingPipeline().run(body) for body in SAMPLE_EMAILS]

    print("=== Did extraction really read the input? ===")
    for body, (_, data) in zip(SAMPLE_EMAILS, transcripts):
        found = data["sender"] in body
        print(f"  sender '{data['sender']}' appears in its own email: {found}")
        assert found, "the extracted sender is not in the email it came from"
    assert len(SENT_MAILBOX) == 1, "exactly one alert should have been sent"
    print("  PASS - every extracted address came out of the text it belongs to,")
    print("         and exactly one alert email was sent.\n")

    print("=== The message array after the tool loop ===")
    for message in transcripts[1][0]:
        content = message.get("content")
        if content:
            shown = content[:52]
        else:
            shown = f"tool_calls={message['tool_calls'][0]['name']}"
        print(f"  {message['role']:<10} | {shown}")


if __name__ == "__main__":
    main()
