/**
 * JavaScript Regular Expressions (Regex) Demo
 * File: js_regex.js
 *
 * Mã nguồn minh họa toàn diện cách sử dụng Biểu thức chính quy trong JavaScript.
 * Chạy bằng Node.js: `node js_regex.js`
 */

// 1. Khai báo Regex
// Cách A: Literal (Biên dịch tĩnh khi script được parse)
const emailRegexLiteral = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Cách B: Constructor (Biên dịch động ở runtime, hữu ích khi pattern thay đổi theo biến)
const domain = 'js-tools.org';
const dynamicRegex = new RegExp(`@${domain.replace('.', '\\.')}$`, 'i');

// 2. Demo kiểm tra định dạng dữ liệu (Validation)
function validateEmail(email) {
  const isValid = emailRegexLiteral.test(email);
  console.log(`Kiểm tra Email "${email}": ${isValid ? 'HỢP LỆ ✅' : 'KHÔNG HỢP LỆ ❌'}`);
  return isValid;
}

// 3. Demo trích xuất thông tin (Capturing Groups)
function parseURL(url) {
  console.log(`\n[Trích xuất URL] Đang phân tích: ${url}`);

  // Pattern chia làm 3 nhóm capturing: Protocol, Domain, và Path
  const urlPattern = /^(https?):\/\/([^/]+)(.*)$/;
  const match = urlPattern.exec(url);

  if (match) {
    console.log('Full Match:', match[0]);
    console.log('Nhóm 1 (Protocol):', match[1]);
    console.log('Nhóm 2 (Domain):', match[2]);
    console.log('Nhóm 3 (Path):', match[3]);
  } else {
    console.log('Không tìm thấy khớp!');
  }
}

// 4. Demo Tìm kiếm & Thay thế (Replace & Lookarounds)
function formatLogs() {
  console.log('\n=== 3. TÌM KIẾM VÀ THAY THẾ ===');
  const rawLogs = 'IP: 192.168.1.1, Time: 12:00; IP: 10.0.0.5, Time: 12:05;';

  // Ẩn một phần địa chỉ IP (dùng Replace)
  const hiddenIPs = rawLogs.replace(/\d+\.\d+\.\d+\.(\d+)/g, 'xxx.xxx.xxx.$1');
  console.log('Logs gốc:', rawLogs);
  console.log('Logs sau khi ẩn IP:', hiddenIPs);

  // Sử dụng Positive Lookbehind (?<=...) để lấy giờ sau từ "Time: "
  const timePattern = /(?<=Time:\s)\d{2}:\d{2}/g;
  const times = rawLogs.match(timePattern);
  console.log('Mốc thời gian trích xuất được:', times);
}

// Chạy các demo
console.log('=== 1. DEMO KIỂM TRA EMAIL ===');
validateEmail('support@js-tools.org');
validateEmail('invalid-email@domain');

console.log('\n=== 2. DEMO CAPTURING GROUPS ===');
parseURL('https://js-tools.org/blog/bash/bash-terminal-basics');

formatLogs();
