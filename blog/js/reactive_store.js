/**
 * Bài 7: Browser Events & Reactive Store - Lan truyền sự kiện, Tối ưu hóa Hiệu năng & Lập trình Phản ứng
 * Giáo trình tự học JavaScript nâng cao - js-tools.org
 */

console.log('=========================================================================');
console.log('BÀI 7: BROWSER EVENTS & REACTIVE STATE STORE - TỐI ƯU HÓA & LẬP TRÌNH PHẢN ỨNG');
console.log('=========================================================================\n');

// ==========================================
// 1. TỐI ƯU HIỆU NĂNG: DEBOUNCE & THROTTLE DƯỚI LĂNG KÍNH ENGINE CƠ CHẾ HẸN GIỜ (TIMERS)
// ==========================================
console.log('=== 1. Debounce & Throttle (Tối ưu hóa Hot Events) ===');

/**
 * DEBOUNCE: Gom nhóm nhiều lần kích hoạt sự kiện liên tiếp thành một lần duy nhất.
 * Cơ chế dưới V8: Mỗi lần gọi, ta hủy bỏ (clearTimeout) tác vụ Macrotask cũ trong hàng đợi
 * và lên lịch một Macrotask mới. Chỉ khi ngưng kích hoạt đủ thời gian, tác vụ mới được đẩy
 * vào Event Loop để thực thi.
 */
function debounce(fn, delay) {
  let timeoutId = null;
  return function (...args) {
    const context = this;
    // V8 Timer Module: Hủy tác vụ cũ nếu vẫn còn trong hàng đợi
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Lên lịch tác vụ mới
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * THROTTLE: Giới hạn tần suất thực thi của hàm, chỉ cho chạy 1 lần trong mỗi chu kỳ thời gian.
 * Cơ chế dưới V8: Lưu lại thời điểm thực thi cuối cùng (lastTime).
 * Khi sự kiện kích hoạt, ta so sánh thời gian hiện tại với lastTime.
 * Nếu đã vượt quá chu kỳ delay, ta thực thi ngay lập tức; ngược lại, ta bỏ qua sự kiện.
 */
function throttle(fn, limit) {
  let lastRun = 0;
  let timeoutId = null;

  return function (...args) {
    const context = this;
    const now = Date.now();

    if (now - lastRun >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      fn.apply(context, args);
      lastRun = now;
    } else if (!timeoutId) {
      // Đảm bảo lượt kích hoạt cuối cùng vẫn được thực thi sau khi kết thúc chu kỳ
      const remaining = limit - (now - lastRun);
      timeoutId = setTimeout(() => {
        fn.apply(context, args);
        lastRun = Date.now();
        timeoutId = null;
      }, remaining);
    }
  };
}

// --- Mô phỏng sự kiện cuộn màn hình (Scroll Event) hoặc gõ chữ (Keyup Event) ---
function onScroll(offset) {
  console.log(`[EXECUTE] Xử lý scroll tại offset: ${offset}px vào lúc ${Date.now()}`);
}

const debouncedScroll = debounce(onScroll, 100);
const throttledScroll = throttle(onScroll, 100);

console.log('--- Bắt đầu kích hoạt sự kiện liên tục mỗi 30ms (Mô phỏng Scroll liên tục trong 300ms) ---');

let time = 0;
const interval = setInterval(() => {
  time += 30;
  // console.log(`[Event Triggered] Người dùng scroll tại thời điểm ${time}ms`);
  debouncedScroll(time);
  throttledScroll(time);

  if (time >= 300) {
    clearInterval(interval);
    console.log('--- Kết thúc chu kỳ scroll liên tục ---');
  }
}, 30);

// Chờ các sự kiện hoàn tất và tiến hành phần tiếp theo
setTimeout(() => {
  // ==========================================
  // 2. MÔ PHỎNG MỘT MINI DOM & REACTIVE STATE STORE VỚI DATA-BINDING
  // ==========================================
  console.log('\n=== 2. Thiết Kế Reactive State Store & Mô Phỏng Bind Dữ Liệu Lên DOM ===');

  // Giả lập một hệ thống cây DOM tối giản (Mock DOM) để chứng minh tính năng tự động render UI
  const MockDOM = {
    elements: {},
    createElement(id, tag, innerHTML = '') {
      this.elements[id] = {
        id,
        tag,
        innerHTML,
        // Hàm mô phỏng phản hồi khi cập nhật DOM
        update(newHTML) {
          const oldHTML = this.innerHTML;
          if (oldHTML !== newHTML) {
            this.innerHTML = newHTML;
            console.log(`[DOM RENDER] Element #${this.id} updated: "${oldHTML}" -> "${newHTML}"`);
          }
        },
      };
      return this.elements[id];
    },
    getElementById(id) {
      return this.elements[id];
    },
  };

  // Tạo các DOM elements mô phỏng trong giao diện giỏ hàng
  MockDOM.createElement('cart-badge', 'span', '0 sản phẩm');
  MockDOM.createElement('total-price', 'div', '0 VNĐ');
  MockDOM.createElement('checkout-btn', 'button', 'Thanh toán (0 VNĐ)');

  /**
   * Lớp ReactiveStore nâng cao: Quản lý State bằng Proxy.
   * Khi ghi đè (Set) dữ liệu, Proxy kích hoạt các subscriber tương ứng.
   */
  class ReactiveStore {
    constructor(initialState) {
      this.subscribers = new Set();

      this.state = new Proxy(initialState, {
        get: (target, prop, receiver) => {
          return Reflect.get(target, prop, receiver);
        },
        set: (target, prop, value, receiver) => {
          const oldValue = target[prop];
          if (oldValue !== value) {
            const success = Reflect.set(target, prop, value, receiver);
            if (success) {
              // Phát thông báo cập nhật bất đồng bộ (giống scheduler trong Vue/React)
              this.notify(prop, value, oldValue);
            }
            return success;
          }
          return true;
        },
      });
    }

    subscribe(callback) {
      this.subscribers.add(callback);
      // Hủy đăng ký (unsubscribe)
      return () => {
        this.subscribers.delete(callback);
      };
    }

    notify(prop, newValue, oldValue) {
      this.subscribers.forEach((callback) => {
        callback({ prop, newValue, oldValue, state: this.state });
      });
    }

    // Tiện ích cập nhật nhiều trường dữ liệu cùng lúc
    updateState(newState) {
      Object.entries(newState).forEach(([key, val]) => {
        this.state[key] = val;
      });
    }
  }

  // Khởi tạo Store quản lý giỏ hàng
  const cartStore = new ReactiveStore({
    items: [],
    totalPrice: 0,
  });

  // Đăng ký Reactive Bindings: Kết nối sự thay đổi của Store trực tiếp với DOM
  cartStore.subscribe(({ state, prop, newValue }) => {
    if (prop === 'items') {
      const badge = MockDOM.getElementById('cart-badge');
      badge.update(`${newValue.length} sản phẩm`);
    }

    if (prop === 'totalPrice') {
      const priceTag = MockDOM.getElementById('total-price');
      priceTag.update(`${newValue.toLocaleString('vi-VN')} VNĐ`);

      const checkoutBtn = MockDOM.getElementById('checkout-btn');
      checkoutBtn.update(`Thanh toán (${newValue.toLocaleString('vi-VN')} VNĐ)`);
    }
  });

  console.log('\n--- Bắt đầu tương tác giỏ hàng ---');
  console.log('Trạng thái DOM ban đầu:');
  console.log('badge.innerHTML:', MockDOM.getElementById('cart-badge').innerHTML);
  console.log('priceTag.innerHTML:', MockDOM.getElementById('total-price').innerHTML);

  console.log('\n[Hành động]: Người dùng thêm Mũ Bảo Hiểm (150k) và Áo Khoác (350k)');
  cartStore.updateState({
    items: [
      { name: 'Mũ Bảo Hiểm', price: 150000 },
      { name: 'Áo Khoác', price: 350000 },
    ],
    totalPrice: 500000,
  });

  console.log('\n[Hành động]: Người dùng áp dụng mã giảm giá, tổng tiền giảm còn 400.000 VNĐ');
  // Chỉ cập nhật totalPrice, danh sách items giữ nguyên
  cartStore.state.totalPrice = 400000;

  console.log('\nGiao diện DOM sau các lần thay đổi trạng thái phản ứng:');
  console.log('badge.innerHTML:', MockDOM.getElementById('cart-badge').innerHTML);
  console.log('priceTag.innerHTML:', MockDOM.getElementById('total-price').innerHTML);
  console.log('checkoutBtn.innerHTML:', MockDOM.getElementById('checkout-btn').innerHTML);
}, 500);
