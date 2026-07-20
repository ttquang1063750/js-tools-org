/**
 * vectordb_embeddings_demo.js
 * Mã nguồn thực hành Bài 2: Pipeline Nhúng Dữ Liệu (Embeddings)
 *
 * Hướng dẫn chạy:
 *   node vectordb_embeddings_demo.js
 */

// ====================================================
// 1. TỰ CÀI ĐẶT BỘ VECTOR HÓA TẦN SUẤT TỪ (TF-IDF RÚT GỌN)
// ====================================================

class SimpleTFIDFVectorizer {
  constructor() {
    this.vocabulary = [];
    this.idf = {};
  }

  // Tách từ đơn giản và chuẩn hóa chữ thường
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  // Huấn luyện bộ từ vựng và tính toán chỉ số IDF từ tập tài liệu
  fit(documents) {
    const docTokens = documents.map((doc) => this.tokenize(doc));
    const allWords = new Set();

    docTokens.forEach((tokens) => {
      tokens.forEach((w) => allWords.add(w));
    });

    this.vocabulary = Array.from(allWords).sort();
    const N = documents.length;

    this.vocabulary.forEach((word) => {
      // Đếm số lượng tài liệu chứa từ này
      const docCount = docTokens.filter((tokens) => tokens.includes(word)).length;
      // Công thức IDF cơ bản: log(N / df)
      this.idf[word] = Math.log(N / (docCount || 1)) + 1;
    });
  }

  // Biến đổi một tài liệu thành vector số thực
  transform(text) {
    const tokens = this.tokenize(text);
    const vector = new Array(this.vocabulary.length).fill(0);

    // Tính toán TF (Tần suất xuất hiện của từ trong câu)
    const tf = {};
    tokens.forEach((w) => {
      tf[w] = (tf[w] || 0) + 1;
    });

    // Nhân TF với IDF của từng từ trong từ vựng
    this.vocabulary.forEach((word, idx) => {
      if (tf[word]) {
        const tfVal = tf[word] / tokens.length; // Chuẩn hóa TF theo độ dài câu
        vector[idx] = tfVal * this.idf[word];
      }
    });

    return vector;
  }
}

// ====================================================
// 2. TRÌNH QUẢN LÝ HÀNG ĐỢI GỬI BATCH EMBEDDING (CLIENT-SIDE)
// ====================================================

class BatchEmbeddingQueue {
  constructor(concurrencyLimit = 2) {
    this.concurrencyLimit = concurrencyLimit;
    this.queue = [];
    this.runningCount = 0;
    this.cache = new Map(); // Bộ nhớ đệm lưu trữ các vector đã tính
  }

  // Thêm tác vụ nhúng vào hàng đợi
  enqueue(text, id) {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, id, resolve, reject });
      this.processQueue();
    });
  }

  // Xử lý hàng đợi
  async processQueue() {
    if (this.runningCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    this.runningCount++;

    // Kiểm tra cache trước
    if (this.cache.has(task.text)) {
      console.log(`[Cache Hit] Lấy vector từ bộ nhớ đệm cho tác vụ: "${task.id}"`);
      task.resolve(this.cache.get(task.text));
      this.runningCount--;
      this.processQueue();
      return;
    }

    try {
      console.log(`[API Call] Bắt đầu tính toán Embedding cho tác vụ: "${task.id}"...`);
      const vector = await this.mockApiCall(task.text);
      this.cache.set(task.text, vector);
      task.resolve(vector);
    } catch (err) {
      task.reject(err);
    } finally {
      this.runningCount--;
      this.processQueue();
    }
  }

  // Giả lập cuộc gọi API nhúng tốn 500ms
  mockApiCall(text) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Sinh vector ngẫu nhiên 3 chiều làm ví dụ đại diện
        const vector = Array.from({ length: 3 }, () => parseFloat(Math.random().toFixed(4)));
        resolve(vector);
      }, 500);
    });
  }
}

// === CHẠY THỬ NGHIỆM THỰC HÀNH ===

async function run() {
  console.log('=== PHẦN 1: THỬ NGHIỆM TF-IDF VECTORIZER ===');
  const docs = [
    'Tôi học lập trình C',
    'Lập trình JavaScript là ngôn ngữ chạy trên trình duyệt',
    'Cơ sở dữ liệu Vector lưu trữ embeddings',
  ];

  const vectorizer = new SimpleTFIDFVectorizer();
  vectorizer.fit(docs);

  console.log('Từ vựng học được:', vectorizer.vocabulary);

  const testSentence = 'Tôi học lập trình JavaScript';
  const vec = vectorizer.transform(testSentence);
  console.log(`\nVector biểu diễn của câu "${testSentence}":`);
  console.log(vec.map((v) => v.toFixed(4)));

  console.log('\n=== PHẦN 2: THỬ NGHIỆM BATCH EMBEDDING QUEUE ===');
  const queue = new BatchEmbeddingQueue(2); // Giới hạn chạy song song tối đa 2 tác vụ

  const tasks = [
    { id: 'task_1', text: 'Xin chào thế giới' },
    { id: 'task_2', text: 'Lập trình AI' },
    { id: 'task_3', text: 'Xin chào thế giới' }, // Trùng lặp để test cache
    { id: 'task_4', text: 'Cơ sở dữ liệu lớn' },
  ];

  const promises = tasks.map((t) =>
    queue.enqueue(t.text, t.id).then((vector) => {
      console.log(`  [Hoàn thành] Tác vụ "${t.id}" trả về vector:`, vector);
    })
  );

  await Promise.all(promises);
  console.log('\nTất cả tác vụ nhúng đã hoàn thành!');
}

run();
