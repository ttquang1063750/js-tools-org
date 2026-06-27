/**
 * Modern JavaScript (ES6+) Features Demo
 * File: js_modern.js
 *
 * Mã nguồn minh họa chi tiết các cú pháp ES6+ nâng cao giúp code tối giản và an toàn.
 * Chạy bằng Node.js: `node js_modern.js`
 */

// 1. Destructuring & Rest/Spread Operators
function demoDestructuringAndSpread() {
  console.log('=== 1. DESTRUCTURING & SPREAD/REST OPERATORS ===');

  const userProfile = {
    username: 'quang_dev',
    email: 'support@js-tools.org',
    skills: ['JS', 'Bash', 'C++'],
    address: { city: 'Hanoi', country: 'Vietnam' },
  };

  // Object Destructuring có gán alias và giá trị mặc định
  const {
    username: developerName,
    address: { city },
    role = 'Developer',
  } = userProfile;
  console.log(`Developer Name: ${developerName}, City: ${city}, Role: ${role}`);

  // Spread: Sao chép và thêm thuộc tính cho Object
  const updatedProfile = { ...userProfile, active: true, skills: [...userProfile.skills, 'Docker'] };
  console.log('Profile mới sau khi thêm kỹ năng & cờ active:', updatedProfile);

  // Rest Parameter: Thu gom tham số còn lại vào một mảng
  function calculateSum(first, ...others) {
    const sumOthers = others.reduce((acc, curr) => acc + curr, 0);
    return first + sumOthers;
  }
  console.log(`calculateSum(10, 20, 30, 40) = ${calculateSum(10, 20, 30, 40)}`);
}

// 2. Optional Chaining (?.) & Nullish Coalescing (??)
function demoSafetyOperators() {
  console.log('\n=== 2. OPTIONAL CHAINING & NULLISH COALESCING ===');

  const response = {
    status: 'success',
    data: {
      user: {
        name: 'Quang',
        preferences: null, // preferences bị rỗng
        activeCount: 0, // số lượng tích cực bằng 0 (falsy)
      },
    },
  };

  // A. Optional Chaining (?.) tránh lỗi crash "Cannot read properties of null/undefined"
  // Thử truy cập thuộc tính lồng sâu mà không sợ lỗi:
  const theme = response.data?.user?.preferences?.theme;
  console.log('Theme truy cập an toàn:', theme); // Sẽ trả ra undefined thay vì crash!

  // B. Phân biệt Nullish Coalescing (??) vs Logical OR (||)
  // Logical OR (||) lấy vế sau nếu vế trước là falsy (false, 0, "", null, undefined, NaN)
  const countOr = response.data.user.activeCount || 10;

  // Nullish Coalescing (??) chỉ lấy vế sau nếu vế trước thực sự là null hoặc undefined (giữ lại 0 và "")
  const countNullish = response.data.user.activeCount ?? 10;

  console.log(`Sử dụng Logical OR (||): count = ${countOr} (Bị sai vì mất giá trị 0 thực tế)`);
  console.log(`Sử dụng Nullish (??)  : count = ${countNullish} (Chính xác, giữ lại giá trị 0)`);
}

// 3. Arrow Function & Lexical "this" Context
class ClickCounter {
  constructor() {
    this.count = 0;
  }

  // Lỗi ngữ cảnh "this" của Regular Function khi gọi bất đồng bộ
  startTimerRegular() {
    setTimeout(function () {
      this.count++;
      // Lỗi: "this" ở đây trỏ tới đối tượng Global/Timeout chứ không phải ClickCounter!
      console.log(`[Regular] Count: ${this.count} (NaN vì this.count ở đây undefined)`);
    }, 100);
  }

  // Arrow Function bảo toàn lexical context "this" từ scope bao quanh nó
  startTimerArrow() {
    setTimeout(() => {
      this.count++;
      console.log(`[Arrow] Count: ${this.count} (Chính xác! this trỏ tới instance ClickCounter)`);
    }, 200);
  }
}

function demoLexicalThis() {
  console.log('\n=== 3. ARROW FUNCTION & LEXICAL THIS ===');
  const counter = new ClickCounter();
  counter.startTimerRegular();
  counter.startTimerArrow();
}

// Chạy các demo
demoDestructuringAndSpread();
demoSafetyOperators();
demoLexicalThis();
