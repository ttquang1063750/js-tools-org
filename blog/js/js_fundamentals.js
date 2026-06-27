/**
 * JavaScript Fundamentals & Data Types Demo
 * File: js_fundamentals.js
 *
 * Mã nguồn minh họa chi tiết về Primitives vs Objects, Coercion, và cơ chế bộ nhớ.
 * Chạy bằng Node.js: `node js_fundamentals.js`
 */

// 1. Primitive vs Objects (Stack vs Heap)
function demoValueVsReference() {
  console.log('=== 1. TRUYỀN THAM TRỊ (VALUE) VS TRUYỀN THAM CHIẾU (REFERENCE) ===');

  // Primitives: Giá trị lưu trực tiếp trong Stack, gán bản sao giá trị
  let numberA = 100;
  let numberB = numberA;
  numberB = 200;
  console.log(`Primitives (Stack): numberA = ${numberA} (giữ nguyên), numberB = ${numberB}`);

  // Objects: Giá trị lưu ở Heap, biến lưu địa chỉ tham chiếu (Reference Pointer) trong Stack
  let userA = { name: 'Quang', role: 'Admin' };
  let userB = userA; // Copy địa chỉ tham chiếu
  userB.name = 'Alex'; // Sửa thuộc tính qua tham chiếu mới
  console.log(
    `Objects (Heap reference): userA.name = "${userA.name}" (bị thay đổi theo!), userB.name = "${userB.name}"`
  );
}

// 2. Type Coercion (Ép kiểu ngầm định)
function demoCoercion() {
  console.log('\n=== 2. TYPE COERCION (ÉP KIỂU NGẦM ĐỊNH) ===');

  // Phép toán cộng với chuỗi sẽ ép kiểu thành Chuỗi (String Concatenation)
  console.log(`"5" + 3 = "${'5' + 3}" (Type: ${typeof ('5' + 3)})`);

  // Các phép toán số học khác (-, *, /) sẽ ép kiểu chuỗi thành Số (Numeric Coercion)
  console.log(`"5" - 3 = ${'5' - 3} (Type: ${typeof ('5' - 3)})`);
  console.log(`"5" * "2" = ${'5' * '2'} (Type: ${typeof ('5' * '2')})`);

  // Phép so sánh Loose Equality (==) vs Strict Equality (===)
  console.log(`"5" == 5  : ${'5' == 5} (So sánh giá trị sau khi ép kiểu)`);
  console.log(`"5" === 5 : ${'5' === 5} (So sánh cả giá trị và kiểu dữ liệu)`);

  // Cạm bẫy đặc biệt: null vs undefined
  console.log(`null == undefined  : ${null == undefined}`);
  console.log(`null === undefined : ${null === undefined}`);
}

// 3. Deep Copy vs Shallow Copy
function demoCloning() {
  console.log('\n=== 3. SAO CHÉP ĐỐI TƯỢNG (SHALLOW VS DEEP COPY) ===');

  const original = {
    name: 'js-tools',
    features: ['optimizer', 'snapcast'],
    settings: { theme: 'dark' },
  };

  // Cách A: Shallow Copy (Spread Operator)
  const shallowCopy = { ...original };
  shallowCopy.features.push('colorquarium');
  shallowCopy.settings.theme = 'light';

  console.log('--- Shallow Copy sửa đổi ---');
  console.log('Original theme (bị sửa):', original.settings.theme);
  console.log('Original features (bị sửa):', original.features);

  // Khôi phục lại dữ liệu gốc
  original.settings.theme = 'dark';
  original.features = ['optimizer', 'snapcast'];

  // Cách B: Deep Copy thực thụ sử dụng structuredClone (ES2022)
  const deepCopy = structuredClone(original);
  deepCopy.features.push('colorquarium');
  deepCopy.settings.theme = 'light';

  console.log('--- Deep Copy thực thụ ---');
  console.log('Original theme (an toàn):', original.settings.theme);
  console.log('Original features (an toàn):', original.features);
  console.log('Deep Copy theme:', deepCopy.settings.theme);
  console.log('Deep Copy features:', deepCopy.features);
}

// Chạy demo
demoValueVsReference();
demoCoercion();
demoCloning();
