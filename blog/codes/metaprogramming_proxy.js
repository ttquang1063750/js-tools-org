/**
 * Bài 5: Metaprogramming trong JavaScript - Symbol, Proxy & Reflect API
 * Giáo trình tự học JavaScript - js-tools.org
 */

console.log("=== 1. Symbol & Well-known Symbols (Custom hành vi lõi) ===");

// Khởi tạo các key độc bản tránh va chạm trong Object
const internalId = Symbol("id");
const user = {
  [internalId]: 1024,
  name: "Quang",
  age: 28
};

console.log("Truy cập property thường:", user.name);
console.log("Truy cập Symbol property:", user[internalId]);

// Duyệt qua keys thông thường không hiện Symbol
console.log("Keys thông thường:", Object.keys(user)); // [ 'name', 'age' ]
console.log("Symbol keys:", Object.getOwnPropertySymbols(user)); // [ Symbol(id) ]

// Sử dụng Well-known Symbol: Symbol.toStringTag để sửa đổi mô tả kiểu của Object
class SuperArray {
  get [Symbol.toStringTag]() {
    return "SuperArray";
  }
}
const myArr = new SuperArray();
console.log("Định danh Object.prototype.toString.call(myArr):", Object.prototype.toString.call(myArr)); // [object SuperArray]


console.log("\n=== 2. Proxy & Reflect (Can thiệp & chuyển tiếp thao tác) ===");

// Đối tượng dữ liệu cần bảo vệ và xác thực
const targetUser = {
  username: "qtang",
  age: 26,
  email: "support@js-tools.org"
};

// Khởi tạo Proxy Handler can thiệp các hành vi đọc, ghi, tìm kiếm và xóa dữ liệu
const validatorHandler = {
  // Can thiệp hành động đọc (get)
  get(target, prop, receiver) {
    console.log(`[LOG - Đọc]: Đang truy cập thuộc tính "${prop}"`);
    if (!(prop in target)) {
      return `Lỗi: Thuộc tính "${prop}" không tồn tại.`;
    }
    return Reflect.get(target, prop, receiver);
  },

  // Can thiệp hành động ghi (set)
  set(target, prop, value, receiver) {
    console.log(`[LOG - Ghi]: Đang cố gắng cập nhật thuộc tính "${prop}" thành`, value);
    if (prop === "age") {
      if (typeof value !== "number" || value < 0 || value > 120) {
        throw new TypeError("Tuổi phải là số nguyên hợp lệ trong khoảng 0-120.");
      }
    }
    if (prop === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error("Định dạng email không hợp lệ.");
      }
    }
    return Reflect.set(target, prop, value, receiver);
  },

  // Can thiệp toán tử "in" (has)
  has(target, prop) {
    console.log(`[LOG - Kiểm tra]: Kiểm tra thuộc tính "${prop}" có tồn tại hay không`);
    if (prop.startsWith("_")) {
      return false; // Che giấu các biến private bắt đầu bằng "_"
    }
    return Reflect.has(target, prop);
  },

  // Can thiệp hành động xóa thuộc tính (deleteProperty)
  deleteProperty(target, prop) {
    console.log(`[LOG - Xóa]: Đang cố gắng xóa thuộc tính "${prop}"`);
    if (prop === "username") {
      console.log("[LOG - Chặn]: Không cho phép xóa username!");
      return false; // Từ chối xóa
    }
    return Reflect.deleteProperty(target, prop);
  }
};

const proxyUser = new Proxy(targetUser, validatorHandler);

console.log("--- Test đọc thuộc tính ---");
console.log("Đọc username:", proxyUser.username);
console.log("Đọc thuộc tính không có:", proxyUser.address);

console.log("\n--- Test ghi thuộc tính ---");
proxyUser.age = 27;
try {
  proxyUser.age = -5; // Lỗi chặn tuổi
} catch (e) {
  console.log("Xử lý lỗi chặn tuổi:", e.message);
}

console.log("\n--- Test toán tử \"in\" ---");
targetUser._secretKey = "123456"; // Thêm biến ẩn vào đối tượng gốc
console.log("Tìm '_secretKey' trong proxyUser:", "_secretKey" in proxyUser); // false (bị chặn)
console.log("Tìm 'username' trong proxyUser:", "username" in proxyUser); // true

console.log("\n--- Test xóa thuộc tính ---");
console.log("Xóa email:", delete proxyUser.email); // true
console.log("Xóa username:", delete proxyUser.username); // false (bị chặn)


console.log("\n=== 3. Phân tích hiệu năng Proxy trong V8 ===");
console.log("Proxy tạo ra một wrapper trung gian, bắt buộc V8 Engine phải bypass cơ chế tối ưu hóa Inline Cache (IC).");
console.log("Do đó, truy cập thuộc tính qua Proxy thường chậm hơn 1.5x - 5x so với đối tượng thông thường trong các hot loop.");
