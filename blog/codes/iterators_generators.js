/**
 * Bài 4: Iterators, Generators & Lập Trình Bất Đồng Bộ (Event Loop Internals)
 * Giáo trình tự học JavaScript - js-tools.org
 */

console.log("=== 1. Custom Iterators (Tự định nghĩa giao thức duyệt) ===");

// Tạo một đối tượng Range số nguyên cho phép duyệt bằng vòng lặp for...of
const numberRange = {
  from: 1,
  to: 5,
  
  // Định nghĩa phương thức Symbol.iterator
  [Symbol.iterator]() {
    let current = this.from;
    let last = this.to;
    
    // Giao thức iterator phải trả về một đối tượng có phương thức next()
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
};

console.log("Duyệt qua đối tượng range số nguyên tự định nghĩa:");
for (let num of numberRange) {
  console.log(num); // In từ 1 đến 5
}


console.log("\n=== 2. Generators (Hàm sinh tạm dừng bằng yield) ===");

// Generator function tạo chuỗi số Fibonacci vô hạn
function* fibonacciSequence() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fibGen = fibonacciSequence();
console.log("5 số Fibonacci đầu tiên sinh ra từ Generator:");
console.log(fibGen.next().value); // 1
console.log(fibGen.next().value); // 1
console.log(fibGen.next().value); // 2
console.log(fibGen.next().value); // 3
console.log(fibGen.next().value); // 5


console.log("\n=== 3. Lập trình bất đồng bộ: Promises và Async/Await ===");

// Giả lập hàm fetch dữ liệu bất đồng bộ từ API
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, username: `user_${userId}`, active: true });
      } else {
        reject(new Error("Mã người dùng không hợp lệ"));
      }
    }, 100);
  });
}

// Gọi bằng Promise Chain
fetchUserData(10)
  .then(user => console.log("Promise.then: Đã tải thông tin", user.username))
  .catch(err => console.error("Lỗi:", err.message));

// Gọi bằng Async/Await để viết code bất đồng bộ trông giống như đồng bộ
async function runAsyncDemo() {
  console.log("Khởi động async call...");
  try {
    const user = await fetchUserData(42);
    console.log("Async/Await: Tải thành công user:", user);
  } catch (err) {
    console.error("Lỗi Async/Await:", err.message);
  }
}
runAsyncDemo();


console.log("\n=== 4. Async Generators và Vòng lặp 'for await...of' ===");

// Giả lập một Generator sinh dữ liệu bất đồng bộ (ví dụ: kéo trang API ngắt quãng)
async function* fetchPages(maxPages) {
  for (let page = 1; page <= maxPages; page++) {
    // Chờ 50ms trước khi tải trang tiếp theo
    await new Promise(resolve => setTimeout(resolve, 50));
    yield `Dữ liệu trang số ${page}`;
  }
}

async function readAllPages() {
  const pagesGen = fetchPages(3);
  console.log("Bắt đầu duyệt trang bất đồng bộ:");
  for await (const pageData of pagesGen) {
    console.log("Nhận được:", pageData);
  }
  console.log("Hoàn thành duyệt toàn bộ các trang.");
}
readAllPages();


console.log("\n=== 5. Trực quan hóa thứ tự chạy của Event Loop ===");

// Macrotask Queue
setTimeout(() => {
  console.log("[Macrotask] Callback của setTimeout(0ms) thực thi");
}, 0);

// Microtask Queue
Promise.resolve().then(() => {
  console.log("[Microtask 1] Promise.then callback thực thi");
});

queueMicrotask(() => {
  console.log("[Microtask 2] queueMicrotask callback thực thi");
});

// Đồng bộ (Synchronous)
console.log("[Sync] Lệnh đồng bộ cuối cùng của file code");
