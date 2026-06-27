/**
 * Bài 3: JavaScript Functional Programming, High-Order Functions, Pipe/Compose và V8 Elements Kinds
 * Giáo trình tự học JavaScript - js-tools.org
 */

console.log('=== 1. Pure Functions & Immutability ===');

// Hàm không thuần khiết (impure) - làm thay đổi trực tiếp thuộc tính đối tượng (Side Effect)
function updateAgeImpure(user, newAge) {
  user.age = newAge;
  return user;
}

// Hàm thuần khiết (pure) - tạo ra bản sao mới, bảo toàn nguyên gốc đối tượng cũ
function updateAgePure(user, newAge) {
  return { ...user, age: newAge }; // spread operator tạo bản sao mới
}

const userObj = { name: 'An', age: 20 };
const updatedUser = updateAgePure(userObj, 21);
console.log('Đối tượng gốc không đổi (Immutability):', userObj);
console.log('Đối tượng mới tạo ra:', updatedUser);

console.log('\n=== 2. Currying (Chuyển đổi tham số) ===');

const add = (a, b, c) => a + b + c;

// Curried function dạng mũi tên lồng nhau
const curriedAdd = (a) => (b) => (c) => a + b + c;

console.log('Cộng thông thường add(1, 2, 3):', add(1, 2, 3));
console.log('Cộng curried curriedAdd(1)(2)(3):', curriedAdd(1)(2)(3));

// Ứng dụng: Tạo các hàm ghi log chuyên biệt
const log = (importance) => (message) => {
  console.log(`[${importance.toUpperCase()}] [${new Date().toLocaleTimeString()}]: ${message}`);
};

const logInfo = log('info');
const logError = log('error');

logInfo('Hệ thống khởi chạy thành công.');
logError('Kết nối cơ sở dữ liệu thất bại.');

console.log('\n=== 3. Memoization (Tối ưu hóa bằng lưu trữ bộ nhớ đệm) ===');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// High-Order Function để thực hiện memoize tổng quát
function memoize(fn) {
  const cache = {}; // Object đóng vai trò làm bộ nhớ đệm
  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

const fastFibonacci = memoize(function (n) {
  if (n <= 1) return n;
  return fastFibonacci(n - 1) + fastFibonacci(n - 2);
});

console.time('Fibonacci thông thường (n=35)');
fibonacci(35);
console.timeEnd('Fibonacci thông thường (n=35)');

console.time('Fibonacci tối ưu qua Memoize (n=35)');
fastFibonacci(35);
console.timeEnd('Fibonacci tối ưu qua Memoize (n=35)');

console.log('\n=== 4. Khai thác High-Order Functions trên Array ===');

const products = [
  { id: 1, name: 'Laptop', price: 1500, category: 'Tech' },
  { id: 2, name: 'Phone', price: 800, category: 'Tech' },
  { id: 3, name: 'Book', price: 20, category: 'Lifestyle' },
  { id: 4, name: 'Keyboard', price: 100, category: 'Tech' },
];

// Pipeline biến đổi dữ liệu sạch sẽ
const totalTechPrice = products
  .filter((p) => p.category === 'Tech')
  .map((p) => p.price)
  .reduce((sum, price) => sum + price, 0);

console.log('Tổng giá trị các sản phẩm Tech:', totalTechPrice);

console.log('\n=== 5. Xây dựng hàm Pipe & Compose ===');

// Pipe chạy từ trái qua phải (f -> g -> h)
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((res, fn) => fn(res), x);

// Compose chạy từ phải qua trái (h -> g -> f)
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((res, fn) => fn(res), x);

const doubleVal = (x) => x * 2;
const addTen = (x) => x + 10;

const runPipe = pipe(doubleVal, addTen); // (x * 2) + 10
const runCompose = compose(doubleVal, addTen); // (x + 10) * 2

console.log('Pipe(doubleVal, addTen)(5) = ', runPipe(5)); // 20
console.log('Compose(doubleVal, addTen)(5) = ', runCompose(5)); // 30

console.log('\n=== 6. Mô phỏng V8 Elements Kinds trong Array ===');

// 1. SMI Elements: Mảng chứa toàn số nguyên nhỏ (Small Integers) -> Truy cập bộ nhớ O(1) tối đa
const arrSmi = [1, 2, 3]; // PACKED_SMI_ELEMENTS

// 2. Double Elements: Chứa số thực -> V8 chuyển đổi toàn bộ mảng sang dạng Double
arrSmi.push(4.5); // PACKED_DOUBLE_ELEMENTS (deoptimized)

// 3. Holey Elements: Có lỗ hổng trong chỉ mục mảng
const arrHoley = [1, 2, 3];
arrHoley[10] = 11; // Lỗ hổng ở chỉ mục 3 đến 9 -> HOLEY_SMI_ELEMENTS (truy cập chậm do check prototype)

console.log('arrSmi và arrHoley đã được khởi tạo để V8 xử lý phân loại Elements Kinds.');
