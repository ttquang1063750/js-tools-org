/**
 * Automated Audit Script for Practical AI Engineer Series
 * Run this to check spelling typos, logical links, cross-linking structure, and download links.
 */

const fs = require('fs');
const path = require('path');

const seriesDir = __dirname;

const lessons = [
  { num: 1, file: 'aie-js-to-python.html', key: 'aie-js-to-python' },
  { num: 2, file: 'aie-math-code.html', key: 'aie-math-code' },
  { num: 3, file: 'aie-numpy-pandas.html', key: 'aie-numpy-pandas' },
  { num: 4, file: 'aie-pytorch-autograd.html', key: 'aie-pytorch-autograd' },
  { num: 5, file: 'aie-mlp-neural-network.html', key: 'aie-mlp-neural-network' },
  { num: 6, file: 'aie-training-backprop.html', key: 'aie-training-backprop' },
  { num: 7, file: 'aie-cnn-convolution.html', key: 'aie-cnn-convolution' },
  { num: 8, file: 'aie-text-embeddings.html', key: 'aie-text-embeddings' },
  { num: 9, file: 'aie-rnn-attention.html', key: 'aie-rnn-attention' },
  { num: 10, file: 'aie-transformer-mechanism.html', key: 'aie-transformer-mechanism' },
  { num: 11, file: 'aie-llm-api-prompting.html', key: 'aie-llm-api-prompting' },
  { num: 12, file: 'aie-structured-output-tools.html', key: 'aie-structured-output-tools' },
  { num: 13, file: 'aie-local-llm-ollama.html', key: 'aie-local-llm-ollama' },
  { num: 14, file: 'aie-rag-basics.html', key: 'aie-rag-basics' },
  { num: 15, file: 'aie-chunking-vector-db.html', key: 'aie-chunking-vector-db' },
  { num: 16, file: 'aie-advanced-rag.html', key: 'aie-advanced-rag' },
  { num: 17, file: 'aie-agents-react.html', key: 'aie-agents-react' },
  { num: 18, file: 'aie-langgraph-stateful-agents.html', key: 'aie-langgraph-stateful-agents' },
  { num: 19, file: 'aie-fine-tuning-lora.html', key: 'aie-fine-tuning-lora' },
  { num: 20, file: 'aie-mlops-eval.html', key: 'aie-mlops-eval' },
];

const typos = [
  { pattern: /kiến nghiệm/gi, correction: 'kinh nghiệm' },
  { pattern: /triễn khai/gi, correction: 'triển khai' },
  { pattern: /giã lập/gi, correction: 'giả lập' },
  { pattern: /sữ dụng/gi, correction: 'sử dụng' },
  { pattern: /dử liệu/gi, correction: 'dữ liệu' },
  { pattern: /giãi quyết/gi, correction: 'giải quyết' },
];

console.log('=== KHỞI CHẠY KIỂM TRA TOÀN DIỆN LỘ TRÌNH KỸ SƯ AI ===\n');

let totalErrors = 0;

lessons.forEach((lesson, index) => {
  const filePath = path.join(seriesDir, lesson.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Tệp tin không tồn tại: ${lesson.file}`);
    totalErrors++;
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`Analyzing: ${lesson.file} (Bài ${lesson.num})...`);

  // 1. Kiểm tra chính tả phổ biến
  typos.forEach((t) => {
    let match;
    while ((match = t.pattern.exec(html)) !== null) {
      // Find line number
      const line = html.substring(0, match.index).split('\n').length;
      console.warn(`  ⚠️  [CHÍNH TẢ] Dòng ${line}: Tìm thấy "${match[0]}", nên sửa thành "${t.correction}"`);
      totalErrors++;
    }
  });

  // 2. Kiểm tra tính liên kết tuần tự (Prev / Next links)
  // Check prev link
  if (lesson.num > 1) {
    const prevLesson = lessons[index - 1];
    const prevPattern = new RegExp(`href=["']${prevLesson.key}["']`, 'i');
    if (!prevPattern.test(html)) {
      console.error(`  ❌ [LIÊN KẾT] Không tìm thấy liên kết đúng đến Bài trước (${prevLesson.file})`);
      totalErrors++;
    }
  }

  // Check next link
  if (lesson.num < 20) {
    const nextLesson = lessons[index + 1];
    const nextPattern = new RegExp(`href=["']${nextLesson.key}["']`, 'i');
    if (!nextPattern.test(html)) {
      console.error(`  ❌ [LIÊN KẾT] Không tìm thấy liên kết đúng đến Bài tiếp theo (${nextLesson.file})`);
      totalErrors++;
    }
  }

  // 3. Kiểm tra tệp tải xuống đính kèm có tồn tại không
  const downloadMatch = html.match(/href=["']([^"']+\.py)["']\s+download/i);
  if (downloadMatch) {
    const pyFile = downloadMatch[1];
    const pyPath = path.join(seriesDir, pyFile);
    if (!fs.existsSync(pyPath)) {
      console.error(`  ❌ [TẬP TIN ĐÍNH KÈM] Tệp tải xuống ${pyFile} không tồn tại trên ổ đĩa!`);
      totalErrors++;
    } else {
      // Check if file size is > 0
      const stats = fs.statSync(pyPath);
      if (stats.size === 0) {
        console.error(`  ❌ [TẬP TIN ĐÍNH KÈM] Tệp tải xuống ${pyFile} bị rỗng (0 bytes)!`);
        totalErrors++;
      }
    }
  }
});

// Check Hub page spelling & visualizer links
const hubPath = path.join(seriesDir, 'aie-programming-series.html');
if (fs.existsSync(hubPath)) {
  const hubHtml = fs.readFileSync(hubPath, 'utf8');
  console.log(`\nAnalyzing Hub page: aie-programming-series.html...`);
  typos.forEach((t) => {
    let match;
    while ((match = t.pattern.exec(hubHtml)) !== null) {
      const line = hubHtml.substring(0, match.index).split('\n').length;
      console.warn(`  ⚠️  [CHÍNH TẢ] Dòng ${line}: Tìm thấy "${match[0]}", nên sửa thành "${t.correction}"`);
      totalErrors++;
    }
  });

  // Verify all 20 lesson cards exist and are linked
  lessons.forEach((l) => {
    const pattern = new RegExp(`href=["']${l.key}["']`, 'i');
    if (!pattern.test(hubHtml)) {
      console.error(`  ❌ [HUB LINK] Không tìm thấy liên kết thẻ bài học đến ${l.file}`);
      totalErrors++;
    }
  });
}

console.log(`\n=== KẾT QUẢ KIỂM TRA: Phát hiện ${totalErrors} lỗi/cảnh báo cần xử lý. ===`);
