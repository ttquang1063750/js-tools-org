/**
 * Bài 6: Quản lý Module trong JavaScript - Scope Isolation, ESM vs CommonJS, Live Bindings & Tree Shaking
 * Giáo trình tự học JavaScript nâng cao - js-tools.org
 */

console.log('=========================================================================');
console.log('BÀI 6: HỆ THỐNG MODULE TRONG JAVASCRIPT - CHI TIẾT SÂU HƠN VÀ CHUYÊN NGHIỆP');
console.log('=========================================================================\n');

// ==========================================
// 1. GIẢ LẬP SỰ KHÁC BIỆT CỐT LÕI: LIVE BINDINGS (ESM) VS COPY-ON-IMPORT (CJS)
// ==========================================
console.log('=== 1. Live Bindings (ESM) vs Copy-on-Import (CommonJS) ===');

/**
 * Trong CommonJS, khi require() một module, các giá trị nguyên thủy (primitives)
 * sẽ được COPY vào biến nhận. Nếu module thay đổi giá trị nội bộ sau đó,
 * nơi import sẽ KHÔNG nhận được cập nhật (trừ khi đối tượng là reference type).
 */
const FakeCommonJSModule = (function () {
  let counter = 0;
  function increment() {
    counter++;
  }

  return {
    counter: counter, // COPY giá trị tại thời điểm export!
    increment: increment,
  };
})();

/**
 * Trong ES Modules, các import là "Live Bindings" (tham chiếu trực tiếp vào ô nhớ).
 * Khi module đích cập nhật giá trị của biến, các nơi import sẽ nhìn thấy giá trị mới ngay lập tức.
 * Chúng ta giả lập cơ chế này bằng ES6 Getters.
 */
const FakeESModule = (function () {
  let counter = 0;
  function increment() {
    counter++;
  }

  return {
    // Sử dụng Getter để giả lập Live Binding (kết nối trực tiếp tới biến counter cục bộ)
    get counter() {
      return counter;
    },
    increment: increment,
  };
})();

// Thử nghiệm với CommonJS
console.log('\n--- Kiểm nghiệm CommonJS (Copy-on-Import) ---');
let cjsCounter = FakeCommonJSModule.counter;
console.log('Khởi tạo ban đầu:', cjsCounter); // 0
FakeCommonJSModule.increment();
console.log('Sau khi gọi increment() trong Module:');
console.log('-> Giá trị counter trong Module:', FakeCommonJSModule.counter); // Vẫn là 0 vì thuộc tính của object FakeCommonJSModule copy giá trị counter = 0 ban đầu
console.log('-> Biến cjsCounter ở nơi import:', cjsCounter); // Vẫn là 0

// Thử nghiệm với ES Modules (Live Bindings)
console.log('\n--- Kiểm nghiệm ES Modules (Live Bindings) ---');
console.log('Khởi tạo ban đầu:', FakeESModule.counter); // 0
FakeESModule.increment();
console.log('Sau khi gọi increment() trong Module:');
console.log('-> Giá trị counter trong Module (Live Binding):', FakeESModule.counter); // 1
// Lưu ý: ESM không cho phép gán lại biến đã import trực tiếp (Read-only view),
// chỉ module export mới có quyền thay đổi nó.

// ==========================================
// 2. CƠ CHẾ CACHING MODULE & SINGLETON PATTERN
// ==========================================
console.log('\n=== 2. Module Caching & Singleton Behavior ===');

/**
 * Cả ESM và CommonJS đều thực hiện lưu cache module (Module Caching).
 * Đoạn mã khởi tạo của một module chỉ chạy duy nhất 1 lần đầu tiên.
 * Các lần import tiếp theo chỉ đơn thuần trả về object/exports đã được cached.
 */
const DatabaseConnection = (function () {
  let instanceCount = 0;

  // Constructor giả lập
  function Connection() {
    instanceCount++;
    this.connectionId = `DB_CONN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log(`[LOG]: Khởi tạo kết nối vật lý mới! Số lượng instance: ${instanceCount}`);
  }

  // Singleton instance
  const singleInstance = new Connection();

  return {
    getInstance: () => singleInstance,
    getInstanceCount: () => instanceCount,
  };
})();

console.log('Import lần 1 (Client A):');
const clientA = DatabaseConnection.getInstance();
console.log('-> ID kết nối Client A:', clientA.connectionId);

console.log('\nImport lần 2 (Client B - Tận dụng Module Cache):');
const clientB = DatabaseConnection.getInstance();
console.log('-> ID kết nối Client B:', clientB.connectionId);
console.log('-> Hai client dùng chung một kết nối?', clientA === clientB ? 'Đúng (Singleton)' : 'Sai');
console.log('-> Tổng số lần tạo kết nối vật lý:', DatabaseConnection.getInstanceCount()); // Vẫn là 1

// ==========================================
// 3. GIẢ LẬP DYNAMIC IMPORT & LAZY LOADING
// ==========================================
console.log('\n=== 3. Dynamic Import & Lazy Loading ===');

// Kho lưu trữ module giả lập trên mạng hoặc đĩa
const MockRegistry = {
  './analytics.js': function () {
    console.log('[Network]: Đang tải analytics.js...');
    return {
      trackEvent: (name) => console.log(`[Analytics]: Đang ghi nhận sự kiện "${name}"`),
    };
  },
};

// Hàm tải module động giống cú pháp import() trả về Promise
function importModule(path) {
  return new Promise((resolve, reject) => {
    // Giả lập độ trễ mạng 500ms
    setTimeout(() => {
      if (MockRegistry[path]) {
        const moduleExports = MockRegistry[path]();
        resolve(moduleExports);
      } else {
        reject(new Error(`Không thể tìm thấy module tại đường dẫn: ${path}`));
      }
    }, 500);
  });
}

// Hàm khởi chạy ứng dụng chính
async function startApp() {
  console.log('1. Ứng dụng chính bắt đầu chạy.');
  console.log('2. Thực hiện các chức năng cơ bản...');

  // Chỉ khi người dùng thực hiện một hành động cụ thể (ví dụ click nút),
  // chúng ta mới tải động module phân tích (Analytics) để tối ưu hóa thời gian tải trang ban đầu.
  console.log("\n[Hành động]: Người dùng click nút 'Thanh toán'...");
  try {
    const analytics = await importModule('./analytics.js');
    analytics.trackEvent('UserCheckoutSuccess');
    console.log('-> Hoàn tất ghi nhận!');
  } catch (error) {
    console.error('-> Lỗi nạp module động:', error.message);
  }
}

startApp();
