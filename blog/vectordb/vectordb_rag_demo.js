/**
 * vectordb_rag_demo.js
 * Mã nguồn thực hành Bài 9: Dự án Capstone - RAG Search Engine
 *
 * Hướng dẫn chạy:
 *   node vectordb_rag_demo.js
 */

// Hàm tính khoảng cách Euclidean bình phương
function squaredEuclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// Giả lập một Encoder đơn giản chuyển từ chuỗi từ khóa sang Vector 8 chiều
function mockEmbed(text) {
  const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  };

  // Sinh 8 chiều từ hash của văn bản
  const vector = [];
  const lowercase = text.toLowerCase();
  for (let d = 0; d < 8; d++) {
    const seed = lowercase + '_' + d;
    const val = Math.abs(hash(seed) % 1000) / 1000.0;
    vector.push(val);
  }

  // Chuẩn hóa vector đơn vị (để tính cosine / dot product dễ dàng)
  const len = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  return vector.map((v) => v / (len || 1));
}

// ====================================================
// 1. CƠ SỞ DỮ LIỆU VECTOR NỘI BỘ (MOCK VECTOR DB)
// ====================================================

class SimpleVectorStore {
  constructor() {
    this.records = [];
  }

  // Phân đoạn (Chunking) & Indexing văn bản
  addDocument(docId, title, content, category) {
    // Tách câu đơn giản
    const sentences = content.split(/[.!?]\s+/);

    sentences.forEach((sentence, idx) => {
      if (sentence.trim().length < 10) return;

      const chunkText = sentence.trim();
      const vector = mockEmbed(chunkText);

      this.records.push({
        chunkId: `${docId}_chunk_${idx}`,
        title,
        text: chunkText,
        vector,
        metadata: { category },
      });
    });
  }

  // Tìm kiếm ngữ nghĩa lân cận gần nhất
  search(queryText, limit = 2, filterCategory = null) {
    const queryVector = mockEmbed(queryText);

    const scores = this.records
      .filter((record) => !filterCategory || record.metadata.category === filterCategory)
      .map((record) => {
        // Dot product của 2 vector đã chuẩn hóa (tương đương cosine similarity)
        const dotProduct = queryVector.reduce((sum, val, idx) => sum + val * record.vector[idx], 0);
        return {
          record,
          score: dotProduct,
        };
      });

    // Sắp xếp tương đồng giảm dần
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit).map((s) => s.record);
  }
}

// ====================================================
// 2. KHỞI TẠO DỮ LIỆU ĐÀU VÀO
// ====================================================

const store = new SimpleVectorStore();

store.addDocument(
  'doc1',
  'Tìm hiểu cơ sở dữ liệu Vector',
  'Cơ sở dữ liệu Vector lưu trữ dữ liệu dưới dạng các vector nhúng đa chiều. Nó hỗ trợ tìm kiếm ngữ nghĩa lân cận gần nhất thay vì so khớp từ khóa thô.',
  'Công nghệ'
);

store.addDocument(
  'doc2',
  'Hướng dẫn kỹ thuật RAG',
  'RAG viết tắt của Retrieval-Augmented Generation. Đây là kỹ thuật giúp tối ưu hóa câu trả lời của mô hình ngôn ngữ lớn LLM bằng cách nhét thêm ngữ cảnh thực tế truy vấn từ cơ sở dữ liệu vector.',
  'AI'
);

store.addDocument(
  'doc3',
  'Chỉ mục HNSW',
  'HNSW là chỉ mục đồ thị lân cận phân tầng cho phép định tuyến tìm kiếm vector xấp xỉ siêu nhanh với độ chính xác cao.',
  'Công nghệ'
);

// ====================================================
// 3. PIPELINE RAG (RETRIEVAL-AUGMENTED GENERATION)
// ====================================================

function runRAGPipeline(userQuestion, categoryFilter = null) {
  console.log(`\n[User Question]: "${userQuestion}"`);
  if (categoryFilter) {
    console.log(`[Filter]: Chuyên mục = "${categoryFilter}"`);
  }

  // Giai đoạn 1: Retrieval (Truy vấn ngữ cảnh)
  const retrievedChunks = store.search(userQuestion, 2, categoryFilter);
  console.log(`\n--- GIAI ĐOẠN 1: RETRIEVAL (Tìm thấy ${retrievedChunks.length} chunks phù hợp) ---`);
  retrievedChunks.forEach((chunk, i) => {
    console.log(`  Chunk ${i + 1} [${chunk.chunkId}]: "${chunk.text}"`);
  });

  // Giai đoạn 2: Augmentation (Ghép ngữ cảnh vào Prompt)
  const context = retrievedChunks.map((c) => `- ${c.text}`).join('\n');
  const prompt = `Bạn là trợ lý AI thông minh. Hãy trả lời câu hỏi dựa trên các tài liệu ngữ cảnh dưới đây:
NGỮ CẢNH:
${context}

CÂU HỎI:
${userQuestion}

TRẢ LỜI:`;

  console.log('\n--- GIAI ĐOẠN 2: AUGMENTATION (Prompt lắp ráp gửi LLM) ---');
  console.log(prompt);

  // Giai đoạn 3: Generation (LLM sinh câu trả lời dựa trên ngữ cảnh)
  console.log('\n--- GIAI ĐOẠN 3: GENERATION (Mô phỏng phản hồi LLM) ---');
  let simulatedAnswer = '';
  if (userQuestion.toLowerCase().includes('rag')) {
    simulatedAnswer =
      'RAG (Retrieval-Augmented Generation) là một phương pháp tối ưu hóa câu trả lời của LLM bằng cách bổ sung thêm thông tin ngữ cảnh thực tế được truy vấn trực tiếp từ cơ sở dữ liệu vector, giúp hạn chế ảo tưởng (hallucination).';
  } else if (userQuestion.toLowerCase().includes('hnsw')) {
    simulatedAnswer =
      'HNSW là một loại chỉ mục dựa trên đồ thị phân tầng giúp tìm kiếm vector lân cận gần nhất xấp xỉ (ANN) một cách nhanh chóng với độ phức tạp thời gian logarit O(log N).';
  } else {
    simulatedAnswer =
      'Dựa trên ngữ cảnh cung cấp, đây là hệ thống lưu trữ vector nhúng hỗ trợ truy vấn thông tin ngữ nghĩa thay vì so khớp từ khóa đơn thuần.';
  }
  console.log(simulatedAnswer);
}

// === THỬ NGHIỆM THỰC HÀNH ===

function run() {
  console.log('=== BẮT ĐẦU CHẠY THỬ NGHIỆM HỆ THỐNG RAG CAPSTONE ===');

  // Thử nghiệm 1: Hỏi về kỹ thuật RAG
  runRAGPipeline('Kỹ thuật RAG là gì?');

  // Thử nghiệm 2: Hỏi về HNSW kèm lọc chuyên mục Công nghệ
  runRAGPipeline('Cơ chế chỉ mục HNSW ra sao?', 'Công nghệ');
}

run();
