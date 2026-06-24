/**
 * Bài 1: Execution Context, Hoisting, Scope Chain, Closures, V8 Shapes & Memory Leaks
 * Giáo trình tự học JavaScript - js-tools.org
 */

// 1. Minh họa Hoisting & Temporal Dead Zone (TDZ)
console.log("=== 1. Hoisting & TDZ ===");
try {
  console.log("Giá trị của x (var) trước khai báo:", x); // undefined do Hoisting
  var x = 10;
  console.log("Giá trị của x (var) sau khai báo:", x);
} catch (e) {
  console.error("Lỗi:", e.message);
}

try {
  // Let/Const cũng bị hoisted nhưng nằm trong Temporal Dead Zone (TDZ)
  console.log("Giá trị của y (let) trước khai báo:");
  console.log(y); 
} catch (e) {
  console.log("Lỗi mong đợi (TDZ let):", e.message); // Cannot access 'y' before initialization
}
let y = 20;

// Hoisting đối với Function Declaration vs Function Expression
sayHello(); // Hoạt động tốt nhờ Hoisting của hàm khai báo trực tiếp

function sayHello() {
  console.log("Xin chào từ Function Declaration!");
}

try {
  sayGoodbye(); // Lỗi: sayGoodbye is not a function (biến được hoist dạng undefined)
} catch (e) {
  console.log("Lỗi mong đợi (Function Expression var):", e.message);
}

var sayGoodbye = function() {
  console.log("Tạm biệt từ Function Expression!");
};


// 2. Minh họa Scope Chain & Lexical Environment
console.log("\n=== 2. Scope Chain ===");
const globalVar = "Global";

function outerFunction() {
  const outerVar = "Outer";

  function innerFunction() {
    const innerVar = "Inner";
    // Tìm kiếm biến từ trong ra ngoài theo Scope Chain
    console.log(`Scope Chain: ${innerVar} -> ${outerVar} -> ${globalVar}`);
  }
  innerFunction();
}
outerFunction();


// 3. Minh họa Closure & Tính Đóng Gói
console.log("\n=== 3. Closures & Encapsulation ===");
function createCounter() {
  let count = 0; // Biến này nằm trong Lexical Environment của createCounter, lưu trên Heap
  
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log("Increment 1:", counter.increment()); // 1
console.log("Increment 2:", counter.increment()); // 2
console.log("Decrement 1:", counter.decrement()); // 1
// count không thể truy cập trực tiếp từ bên ngoài -> Đảm bảo tính đóng gói dữ liệu
console.log("Truy cập counter.count trực tiếp:", counter.count); // undefined
console.log("Lấy giá trị an toàn qua getCount():", counter.getCount()); // 1


// 4. V8 Hidden Classes (Shapes) & Inline Cache (IC)
console.log("\n=== 4. V8 Hidden Classes & Performance ===");

function FastPerson(name, age) {
  this.name = name;
  this.age = age;
}
// V8 tạo 1 Hidden Class (Shape) và chia sẻ cho cả p1, p2
const p1 = new FastPerson("An", 25);
const p2 = new FastPerson("Bình", 30);

// Khác biệt thứ tự gán thuộc tính -> V8 buộc phải tạo ra 2 Hidden Classes riêng biệt
const slowObj1 = { name: "An", age: 25 };
const slowObj2 = { age: 30, name: "Bình" };

console.log("p1 & p2 dùng chung Shape -> Inline Cache hoạt động tối ưu.");
console.log("slowObj1 & slowObj2 khác Shape -> Bypass Inline Cache, truy cập chậm hơn.");


// 5. Nguy cơ Rò Rỉ Bộ Nhớ (Memory Leak) từ Closures
console.log("\n=== 5. Closure Memory Leaks ===");
let leakyContainer = null;

function runLeakyApp() {
  let originalContainer = leakyContainer; // Giữ tham chiếu đến object cũ
  
  // unused() giữ tham chiếu đến originalContainer thông qua Lexical Scope
  let unused = function() {
    if (originalContainer) {
      console.log("unused variable");
    }
  };
  
  // leakyContainer được ghi đè bằng object mới chứa mảng 1 triệu phần tử
  leakyContainer = {
    bigData: new Array(1000000).fill("*"),
    someMethod: function() {
      // someMethod dùng chung Lexical Environment Context với unused()
      // Do đó, originalContainer cũng bị kẹt lại trong Heap Context
      // Tạo thành chuỗi liên kết kéo dài qua mỗi lần chạy -> Rò rỉ RAM nghiêm trọng!
      console.log("someMethod running");
    }
  };
}

runLeakyApp();
runLeakyApp();
console.log("Mô phỏng rò rỉ bộ nhớ closures hoàn tất.");
