#!/usr/bin/env node

/**
 * js-tools.org — Automated QA Lesson Checker
 * Auto-validates HTML lesson files according to rules in check-lesson.md
 *
 * Usage: node check-lesson.js <path/to/lesson.html>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color helpers
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const filePath = process.argv[2];

if (!filePath) {
  console.error(`${colors.red}Lỗi: Vui lòng cung cấp đường dẫn tệp bài học HTML.${colors.reset}`);
  console.log(`Sử dụng: node check-lesson.js <path/to/lesson.html>`);
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`${colors.red}Lỗi: Tệp tin không tồn tại: ${filePath}${colors.reset}`);
  process.exit(1);
}

console.log(
  `${colors.cyan}${colors.bold}=== Đang tiến hành kiểm định tự động: ${path.basename(filePath)} ===${colors.reset}\n`
);

const isLessonPage =
  filePath.includes('blog/') &&
  !filePath.endsWith('series.html') &&
  !filePath.endsWith('simulator.html') &&
  !filePath.endsWith('playground.html') &&
  !filePath.endsWith('index.html');

let hasError = false;

// Helpers to record errors
function reportError(rule, message, line = null) {
  hasError = true;
  const lineInfo = line !== null ? ` [Dòng ${line}]` : '';
  console.log(`${colors.red}❌ [THẤT BẠI] ${rule}${lineInfo}: ${message}${colors.reset}`);
}

function reportPass(rule, message) {
  console.log(`${colors.green}✅ [ĐẠT] ${rule}: ${message}${colors.reset}`);
}

// Helper to find original line number of an index in raw HTML
function getLineNumber(rawText, index) {
  return rawText.substring(0, index).split('\n').length;
}

// ----------------------------------------------------
// 1. Prettier Check
// ----------------------------------------------------
try {
  execSync(`npx prettier --check "${filePath}"`, { stdio: 'pipe' });
  reportPass('Định dạng Prettier', 'Tệp đã được định dạng và không có lỗi lồng/thiếu thẻ HTML cơ bản.');
} catch (error) {
  reportError(
    'Định dạng Prettier',
    'Tệp chưa được định dạng Prettier hoặc có lỗi lồng đóng/mở thẻ. Hãy chạy: npx prettier --write ' + filePath
  );
}

// Read raw file content
const rawHTML = fs.readFileSync(filePath, 'utf8');

// Strip script, style, and comment content blocks but preserve the tags and spacing/newlines to preserve line numbers
let cleanHTML = rawHTML;
cleanHTML = cleanHTML.replace(
  /(<script[\s>][^>]*?>)([\s\S]*?)(<\/script>)/gi,
  (m, p1, p2, p3) => p1 + p2.replace(/[^\n]/g, ' ') + p3
);
cleanHTML = cleanHTML.replace(
  /(<style[\s>][^>]*?>)([\s\S]*?)(<\/style>)/gi,
  (m, p1, p2, p3) => p1 + p2.replace(/[^\n]/g, ' ') + p3
);
cleanHTML = cleanHTML.replace(/(<!--)([\s\S]*?)(-->)/g, (m, p1, p2, p3) => p1 + p2.replace(/[^\n]/g, ' ') + p3);

// ----------------------------------------------------
// 2. HTML Tag Balancing Check (Strict stack check)
// ----------------------------------------------------
const tagsStack = [];
const tagRegex = /<\/?([a-z0-9\-]+)(?:[\s][^>]*?)?>/gi;
let match;
let nestingError = false;

const voidElements = [
  'img',
  'br',
  'hr',
  'input',
  'link',
  'meta',
  'source',
  'embed',
  'param',
  'track',
  'wbr',
  'area',
  'base',
  'col',
];

while ((match = tagRegex.exec(cleanHTML)) !== null) {
  const fullTag = match[0];
  const tagName = match[1].toLowerCase();
  const isClosing = fullTag.startsWith('</');
  const isSelfClosing = fullTag.endsWith('/>') || voidElements.includes(tagName);

  if (isSelfClosing) {
    if (isClosing) {
      reportError(
        'Cân bằng thẻ HTML',
        `Thẻ void/self-closing <${tagName}> không được phép có thẻ đóng </${tagName}>`,
        getLineNumber(cleanHTML, match.index)
      );
      nestingError = true;
    }
    continue;
  }

  if (!isClosing) {
    tagsStack.push({ name: tagName, line: getLineNumber(cleanHTML, match.index) });
  } else {
    if (tagsStack.length === 0) {
      reportError(
        'Cân bằng thẻ HTML',
        `Thấy thẻ đóng </${tagName}> nhưng không có thẻ mở tương ứng`,
        getLineNumber(cleanHTML, match.index)
      );
      nestingError = true;
    } else {
      const last = tagsStack.pop();
      if (last.name !== tagName) {
        reportError(
          'Cân bằng thẻ HTML',
          `Thẻ mở <${last.name}> ở dòng ${last.line} lại được đóng bằng </${tagName}>`,
          getLineNumber(cleanHTML, match.index)
        );
        nestingError = true;
      }
    }
  }
}

if (tagsStack.length > 0) {
  tagsStack.forEach((t) => {
    reportError('Cân bằng thẻ HTML', `Thẻ mở <${t.name}> không được đóng`, t.line);
  });
  nestingError = true;
}

if (!nestingError) {
  reportPass('Cân bằng thẻ HTML', 'Toàn bộ cấu trúc thẻ HTML đóng/mở khớp nhau tuyệt đối.');
}

// ----------------------------------------------------
// Helper to search text outside <code>, <pre>, <script>, <style> tags
// ----------------------------------------------------
function getPlainTextOnly(html) {
  // Strip script/style blocks entirely (handles template literals in JS)
  let out = html.replace(/<script[\s>][\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style[\s>][\s\S]*?<\/style>/gi, '');
  // Strip pre/code blocks
  out = out.replace(/<(pre|code)[\s\S]*?<\/\1>/gi, '');
  return out;
}

const plainTextOnly = getPlainTextOnly(rawHTML);

// ----------------------------------------------------
// 3. Raw Markdown Bold (**) & Backticks (`) Check
// ----------------------------------------------------
const rawBoldMatches = [...plainTextOnly.matchAll(/\*\*[^*]+\*\*/g)];
if (rawBoldMatches.length > 0) {
  rawBoldMatches.forEach((m) => {
    const line = getLineNumber(rawHTML, rawHTML.indexOf(m[0]));
    reportError('Markdown thô', `Phát hiện cú pháp bôi đậm '**' chưa convert: "${m[0]}" (hãy dùng thẻ <strong>)`, line);
  });
} else {
  reportPass('Markdown thô (Bold)', 'Không phát hiện ký tự bôi đậm Markdown thô (**).');
}

const rawBacktickMatches = [...plainTextOnly.matchAll(/`[^`]+`/g)];
if (rawBacktickMatches.length > 0) {
  rawBacktickMatches.forEach((m) => {
    const line = getLineNumber(rawHTML, rawHTML.indexOf(m[0]));
    reportError(
      'Markdown thô',
      `Phát hiện cú pháp code inline '\` ' chưa convert: "${m[0]}" (hãy dùng thẻ <code>)`,
      line
    );
  });
} else {
  reportPass('Markdown thô (Backticks)', 'Không phát hiện ký tự inline code Markdown thô (`).');
}

// ----------------------------------------------------
// 4. GitHub Alerts check ([!NOTE], etc.)
// ----------------------------------------------------
const alertMatches = [...plainTextOnly.matchAll(/\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/gi)];
if (alertMatches.length > 0) {
  alertMatches.forEach((m) => {
    const line = getLineNumber(rawHTML, rawHTML.indexOf(m[0]));
    reportError('GitHub Alerts', `Phát hiện cú pháp cảnh báo kiểu GitHub "${m[0]}" (hãy dùng lớp .callout)`, line);
  });
} else {
  reportPass('GitHub Alerts', 'Không phát hiện cảnh báo thô kiểu GitHub.');
}

// ----------------------------------------------------
// 5. LaTeX Control Char / Tab Corruption check
// ----------------------------------------------------
const corruptedLaTeXMatches = [...rawHTML.matchAll(/\t(ext|imes|au|frac|circ)\{/g)];
if (corruptedLaTeXMatches.length > 0) {
  corruptedLaTeXMatches.forEach((m) => {
    const line = getLineNumber(rawHTML, m.index);
    reportError('LaTeX Corrupted', `Phát hiện ký tự TAB bị corrupt trước lệnh LaTeX: \\${m[1]}`, line);
  });
} else {
  reportPass('LaTeX Corrupted', 'Không phát hiện ký tự điều khiển/TAB lỗi trong công thức KaTeX.');
}

// ----------------------------------------------------
// 6. Handwritten arrows check (←, →) in related links
// ----------------------------------------------------
const relatedLinkRegex = /class="[^"]*article-related__link[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
let relatedLinkMatch;
let arrowError = false;

while ((relatedLinkMatch = relatedLinkRegex.exec(rawHTML)) !== null) {
  const text = relatedLinkMatch[1];
  if (/[←→]/.test(text)) {
    const line = getLineNumber(rawHTML, relatedLinkMatch.index);
    reportError(
      'Related Links Arrows',
      `Phát hiện mũi tên viết tay "←" hoặc "→" trong liên kết bài viết liên quan: "${text.trim()}" (hãy để CSS tự vẽ)`,
      line
    );
    arrowError = true;
  }
}
if (!arrowError) {
  reportPass('Related Links Arrows', 'Không phát hiện mũi tên viết tay trong phần Bài viết liên quan.');
}

// ----------------------------------------------------
// 7. SEO Canonical & og:url Align Check
// ----------------------------------------------------
const canonicalMatch = rawHTML.match(/link\s+rel="canonical"\s+href="([^"]+)"/i);
const ogUrlMatch = rawHTML.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);

if (!canonicalMatch) {
  reportError('SEO Canonical', 'Không tìm thấy thẻ link canonical trong head.');
} else {
  const canonicalUrl = canonicalMatch[1];
  const expectedSlug = path.basename(filePath, '.html');
  if (!canonicalUrl.endsWith(expectedSlug)) {
    reportError(
      'SEO Canonical',
      `Đường dẫn canonical "${canonicalUrl}" không khớp với tên tệp thực tế "${expectedSlug}" (bỏ .html).`
    );
  } else {
    reportPass('SEO Canonical', `Khớp tên tệp: ${canonicalUrl}`);
  }

  if (ogUrlMatch && ogUrlMatch[1] !== canonicalUrl) {
    reportError('SEO Canonical', `Thẻ og:url "${ogUrlMatch[1]}" không khớp với canonical "${canonicalUrl}".`);
  } else if (ogUrlMatch) {
    reportPass('SEO og:url', 'og:url khớp chính xác với canonical.');
  }
}

// ----------------------------------------------------
// 8. JSON-LD syntax check (chỉ bắt buộc với trang bài học)
// ----------------------------------------------------
const jsonLdMatch = rawHTML.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (!jsonLdMatch) {
  if (isLessonPage) {
    reportError('JSON-LD', 'Không tìm thấy khối script Dữ liệu cấu trúc JSON-LD.');
  } else {
    reportPass('JSON-LD', 'Trang Hub/Simulator/Playground không yêu cầu JSON-LD — bỏ qua.');
  }
} else {
  try {
    JSON.parse(jsonLdMatch[1]);
    reportPass('JSON-LD', 'Khối dữ liệu cấu trúc JSON-LD hợp lệ cú pháp JSON.');
  } catch (err) {
    reportError('JSON-LD', `Cú pháp JSON-LD bị lỗi: ${err.message}`);
  }
}

// ----------------------------------------------------
// 9. Article Body Wrapper check (chỉ bắt buộc với trang bài học)
// ----------------------------------------------------
const bodyMatchesCount = (rawHTML.match(/class="article-body"/g) || []).length;
if (isLessonPage) {
  if (bodyMatchesCount !== 1) {
    reportError(
      'Article Body Wrapper',
      `Phải có duy nhất 1 thẻ div bọc nội dung có class="article-body" (phát hiện thấy: ${bodyMatchesCount}).`
    );
  } else {
    reportPass('Article Body Wrapper', 'Phần thân bài có đúng 1 lớp bọc class="article-body".');
  }
} else {
  reportPass('Article Body Wrapper', 'Trang Hub/Simulator/Playground không yêu cầu article-body wrapper — bỏ qua.');
}

// ----------------------------------------------------
// Final Evaluation
// ----------------------------------------------------
console.log('\n=======================================');
if (hasError) {
  console.log(`${colors.red}${colors.bold}❌ KIỂM ĐỊNH THẤT BẠI! Tệp vẫn còn lỗi cần sửa.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}🎉 KIỂM ĐỊNH THÀNH CÔNG! Tệp bài học hoàn toàn hợp lệ.${colors.reset}`);
  process.exit(0);
}
