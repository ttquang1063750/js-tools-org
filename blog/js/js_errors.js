/**
 * JavaScript Error Handling Demo
 * File: js_errors.js
 *
 * Mã nguồn minh họa toàn diện các kỹ thuật xử lý lỗi chuyên sâu trong JavaScript.
 * Chạy bằng Node.js: `node js_errors.js`
 */

// 1. Định nghĩa Custom Error kế thừa lớp Error chuẩn
class DatabaseConnectionError extends Error {
  constructor(message, host, port) {
    super(message);
    this.name = 'DatabaseConnectionError';
    this.host = host;
    this.port = port;
    this.timestamp = new Date();

    // Hỗ trợ V8 Engine lưu trữ ngăn xếp cuộc gọi (stack trace)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseConnectionError);
    }
  }
}

// 2. Demo Try-Catch-Finally Đồng bộ
function queryDatabase(query) {
  console.log(`\n[DB] Đang thực thi truy vấn: "${query}"`);

  // Giả lập lỗi kết nối ngẫu nhiên
  const isNetworkDown = true;
  if (isNetworkDown) {
    throw new DatabaseConnectionError('Không thể kết nối đến cơ sở dữ liệu.', '127.0.0.1', 5432);
  }
  return { status: 'success', data: [] };
}

function runSynchronousDemo() {
  console.log('=== 1. DEMO TRY-CATCH-FINALLY ĐỒNG BỘ ===');
  try {
    const result = queryDatabase('SELECT * FROM users;');
    console.log('Kết quả:', result);
  } catch (error) {
    console.error(`Bắt được lỗi: [${error.name}] ${error.message}`);
    console.error(`Chi tiết máy chủ: ${error.host}:${error.port} vào lúc ${error.timestamp}`);
    // Xem stack trace nếu cần: console.error(error.stack);
  } finally {
    console.log('[DB] Luôn đóng kết nối cơ sở dữ liệu tại khối finally!');
  }
}

// 3. Demo Xử lý lỗi Bất đồng bộ (Promises và Async/Await)
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 999) {
        reject(new Error(`Người dùng ID ${userId} không tồn tại.`));
      } else {
        resolve({ id: userId, username: 'john_doe' });
      }
    }, 100);
  });
}

async function runAsynchronousDemo() {
  console.log('\n=== 2. DEMO XỬ LÝ LỖI BẤT ĐỒNG BỘ ===');

  // Cách A: Xử lý lỗi với Async/Await sử dụng Try-Catch
  try {
    console.log('[Async] Đang lấy dữ liệu user 999...');
    const user = await fetchUserData(999);
    console.log('User:', user);
  } catch (error) {
    console.warn(`[Async Catch] Phát hiện lỗi: ${error.message}`);
  }

  // Cách B: Xử lý lỗi với Promise Chain sử dụng .catch()
  console.log('[Async] Đang lấy dữ liệu user 1...');
  fetchUserData(1)
    .then((user) => {
      console.log('Lấy user thành công:', user);
      // Cố ý tạo lỗi trong callback block
      return fetchUserData(999);
    })
    .catch((err) => {
      console.error(`[Promise Chain Catch] Bắt được lỗi: ${err.message}`);
    });
}

// Chạy demo
runSynchronousDemo();
runAsynchronousDemo();
