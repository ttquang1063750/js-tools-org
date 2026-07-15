// Kỹ Thuật Hệ Thống AI — Series 18
// "LLM" tất định (deterministic) dùng xuyên suốt Track C/B — KHÔNG gọi API thật,
// quyết định hành động theo luật khớp từ khoá. Đủ để dạy đúng CƠ CHẾ (khi nào gọi
// tool, khi nào trả lời trực tiếp) mà không cần model AI thật/khoá API.
const MATH_EXPR_PATTERN = /-?\d+(\.\d+)?(\s*[+\-*/]\s*-?\(?-?\d+(\.\d+)?\)?)+/;

export function mockDecide(userQuery, toolNames) {
  const lower = userQuery.toLowerCase();

  const mathMatch = userQuery.match(MATH_EXPR_PATTERN);
  if (mathMatch && toolNames.includes('calculator')) {
    const expr = mathMatch[0].trim();
    return {
      thought: `Câu hỏi có vẻ cần tính toán số học: "${expr}". Mình sẽ gọi tool "calculator".`,
      action: { tool: 'calculator', args: { expression: expr } },
    };
  }

  if (/định nghĩa|nghĩa là gì|là gì\??$/.test(lower) && toolNames.includes('dictionary')) {
    const term = lower.replace(/định nghĩa của|nghĩa là gì|là gì|\?/g, '').trim();
    return {
      thought: `Câu hỏi cần tra nghĩa của thuật ngữ "${term}". Mình sẽ gọi tool "dictionary".`,
      action: { tool: 'dictionary', args: { term } },
    };
  }

  return {
    thought: 'Câu hỏi này có thể trả lời trực tiếp, không cần gọi tool nào.',
    action: null,
    finalAnswer: 'Đây là câu trả lời trực tiếp (mô phỏng) — không cần dữ liệu ngoài.',
  };
}
