/**
 * Bài 2: Prototype, ES6 Class, OOP, Từ khóa 'this', và cơ chế hoạt động của toán tử 'new'
 * Giáo trình tự học JavaScript - js-tools.org
 */

console.log('=== 1. Prototypal Inheritance (Kế thừa nguyên mẫu) ===');

// Khởi tạo đối tượng cơ sở bằng constructor function kiểu cũ
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  console.log(`${this.name} đang phát ra âm thanh.`);
};

// Khởi tạo đối tượng Dog kế thừa từ Animal
function Dog(name, breed) {
  Animal.call(this, name); // B1: Gọi constructor cha và liên kết 'this'
  this.breed = breed;
}
// B2: Thiết lập chuỗi prototype kế thừa phương thức
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  console.log(`${this.name} đang sủa gâu gâu!`);
};

const myDog = new Dog('Lu', 'Golden');
myDog.speak(); // Kế thừa phương thức từ Animal.prototype
myDog.bark(); // Phương thức riêng trên Dog.prototype

console.log('\n=== 2. ES6 Class & Encapsulation (Class ES6 dưới nắp máy) ===');

class User {
  // Thuộc tính private (Được V8 lưu trữ dưới dạng Private Symbols nội bộ)
  #password;

  constructor(username, password) {
    this.username = username;
    this.#password = password;
  }

  get passwordHint() {
    return '********';
  }

  verifyPassword(inputPassword) {
    return this.#password === inputPassword;
  }
}

class Admin extends User {
  constructor(username, password, role) {
    super(username, password); // Gọi constructor cha
    this.role = role;
  }

  showRole() {
    console.log(`Admin ${this.username} có quyền: ${this.role}`);
  }
}

const adminObj = new Admin('quang_admin', 'SuperSecr3t', 'Owner');
adminObj.showRole();
console.log('Mật khẩu hint qua getter:', adminObj.passwordHint);

try {
  eval('adminObj.#password');
} catch (e) {
  console.log('Không thể truy cập thuộc tính private:', e.message);
}

console.log("\n=== 3. Từ khóa 'this' và cơ chế liên kết (Binding) ===");

const person = {
  name: 'Hoàng',
  greet() {
    console.log(`Xin chào, tôi tên là ${this.name}`);
  },
};

person.greet(); // Implicit Binding -> 'this' trỏ về đối tượng trước dấu chấm (person)

const unboundGreet = person.greet;
console.log('Gọi hàm không liên kết (this bị mất):');
try {
  unboundGreet(); // undefined hoặc lỗi trong strict mode
} catch (e) {
  console.log('Lỗi:', e.message);
}

// Explicit Binding với bind()
console.log('Gọi hàm sau khi liên kết tường minh:');
const boundGreet = unboundGreet.bind(person);
boundGreet();

const guest = { name: 'Nam' };
unboundGreet.call(guest); // call() liên kết 'this' tạm thời thành guest

// 4. Giả lập cơ chế hoạt động của toán tử 'new'
console.log("\n=== 4. Custom 'new' Operator Simulation ===");

function myNew(Constructor, ...args) {
  // Bước 1: Tạo một đối tượng rỗng mới
  const newObj = {};

  // Bước 2: Thiết lập liên kết __proto__ trỏ vào prototype của Constructor
  Object.setPrototypeOf(newObj, Constructor.prototype);

  // Bước 3: Thực thi Constructor với từ khóa 'this' là newObj vừa tạo
  const result = Constructor.apply(newObj, args);

  // Bước 4: Trả về object mới, trừ khi Constructor chủ động trả về một object khác
  return typeof result === 'object' && result !== null ? result : newObj;
}

// Test hàm myNew
const customDog = myNew(Dog, 'Ki', 'Poodle');
customDog.speak();
customDog.bark();

// 5. Dictionary sạch không có Prototype (Object.create(null))
console.log('\n=== 5. Clean Dictionary using Object.create(null) ===');

const dirtyDict = {}; // Kế thừa từ Object.prototype
const cleanDict = Object.create(null); // Hoàn toàn trống rỗng

console.log('dirtyDict.toString:', typeof dirtyDict.toString); // 'function'
console.log('cleanDict.toString:', typeof cleanDict.toString); // 'undefined' (tránh lỗi prototype pollution)
