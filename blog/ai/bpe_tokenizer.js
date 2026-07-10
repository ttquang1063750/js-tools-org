// bpe_tokenizer.js — Byte-Pair Encoding tự xây từ số 0: đếm cặp kề phổ biến
// nhất, merge, lặp lại N lần.
// Bài 16: Tokenizer & pretraining LLM
// js-tools.org/blog/ai/ai-tokenizer-llm-pretraining
//
// Cách chạy self-test (cần Node.js, đọc corpus-kieu.txt cùng thư mục):
//   node bpe_tokenizer.js
// Kỳ vọng in ra: "SELF-TEST PASS (N checks)"

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Huấn luyện: mỗi "từ" (tách theo khoảng trắng) biểu diễn thành mảng KÝ TỰ
// (code point, giữ nguyên tổ hợp dấu thanh tiếng Việt) + token đặc biệt
// "</w>" đánh dấu ranh giới cuối từ (chuẩn Sennrich et al. 2016). Vòng lặp:
// đếm mọi cặp ký hiệu kề nhau trên toàn bộ corpus, tìm cặp phổ biến nhất,
// merge thành 1 ký hiệu mới, lặp lại.
// ---------------------------------------------------------------------------
function initVocabFromText(text) {
  const wordFreq = new Map();
  for (const w of text.split(/\s+/).filter(Boolean)) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }
  const vocab = new Map(); // "c h ữ </w>" (ký hiệu cách nhau bởi space) -> tần suất
  for (const [w, f] of wordFreq) {
    vocab.set([...w, '</w>'].join(' '), f);
  }
  return vocab;
}

function getPairFreqs(vocab) {
  const pairs = new Map();
  for (const [symbolStr, freq] of vocab) {
    const symbols = symbolStr.split(' ');
    for (let i = 0; i < symbols.length - 1; i++) {
      const pair = symbols[i] + '\x00' + symbols[i + 1];
      pairs.set(pair, (pairs.get(pair) || 0) + freq);
    }
  }
  return pairs;
}

function mergeVocab(vocab, pairKey) {
  const [a, b] = pairKey.split('\x00');
  const bigram = a + ' ' + b;
  const merged = a + b;
  const newVocab = new Map();
  for (const [symbolStr, freq] of vocab) {
    newVocab.set(symbolStr.split(bigram).join(merged), freq);
  }
  return newVocab;
}

// Trả về danh sách merge theo ĐÚNG THỨ TỰ đã học — bắt buộc để encode văn
// bản mới sau này đúng (áp merge sai thứ tự sẽ ra token khác hẳn).
function trainBPE(text, numMerges) {
  let vocab = initVocabFromText(text);
  const merges = [];
  for (let i = 0; i < numMerges; i++) {
    const pairs = getPairFreqs(vocab);
    if (pairs.size === 0) break;
    let bestPair = null,
      bestFreq = -1;
    for (const [pair, freq] of pairs) {
      if (freq > bestFreq) {
        bestFreq = freq;
        bestPair = pair;
      }
    }
    vocab = mergeVocab(vocab, bestPair);
    merges.push(bestPair);
  }
  return merges;
}

// Encode 1 từ: áp lần lượt từng merge đã học, ĐÚNG thứ tự train.
function encodeWord(word, merges) {
  let symbols = [...word, '</w>'];
  for (const pairKey of merges) {
    const [a, b] = pairKey.split('\x00');
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < symbols.length - 1; i++) {
        if (symbols[i] === a && symbols[i + 1] === b) {
          symbols = [...symbols.slice(0, i), a + b, ...symbols.slice(i + 2)];
          changed = true;
          break;
        }
      }
    }
  }
  return symbols;
}

function encodeText(text, merges) {
  const tokens = [];
  for (const w of text.split(/\s+/).filter(Boolean)) tokens.push(...encodeWord(w, merges));
  return tokens;
}

// Decode: "</w>" có thể đã bị merge DÍNH vào ký tự cuối (vd "ta,</w>" là 1
// token duy nhất, không còn đứng riêng) — phải kiểm tra SUFFIX, không phải
// so sánh bằng tuyệt đối.
function decodeTokens(tokens) {
  const words = [];
  let word = '';
  for (const t of tokens) {
    if (t.endsWith('</w>')) {
      word += t.slice(0, -4);
      words.push(word);
      word = '';
    } else {
      word += t;
    }
  }
  if (word) words.push(word);
  return words.join(' ');
}

// ---------------------------------------------------------------------------
// Self-test — đối chiếu với corpus-kieu.txt thật (vendored cùng thư mục)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const corpusFull = readFileSync(join(__dirname, 'corpus-kieu.txt'), 'utf8');
const corpus = corpusFull.slice(0, 20000);

let errors = 0;
let checks = 0;
function check(name, got, exp) {
  checks++;
  if (got !== exp) {
    console.log('LOI', name, 'got=' + JSON.stringify(got), 'ky vong=' + JSON.stringify(exp));
    errors++;
  }
}

// Merge đầu tiên phải là cặp PHỔ BIẾN NHẤT trong corpus tí hon tự chế
{
  const merges = trainBPE('ab ab ab ab cd cd ef', 1);
  check('merge dau tien la cap pho bien nhat', merges[0], 'a\x00b');
}

// Round-trip: encode roi decode phai ra DUNG lai cau goc
{
  const merges = trainBPE(corpus, 300);
  const testSentences = [
    'Trăm năm trong cõi người ta,',
    'Chữ tài chữ mệnh khéo là ghét nhau.',
    'Đau đớn thay phận đàn bà,',
  ];
  for (const s of testSentences) {
    check('round-trip: ' + s, decodeTokens(encodeText(s, merges)), s);
  }
}

// Vocab lon hon -> so token tren CUNG 1 cau giam (do THAT, khong doan)
{
  const testSentence = 'Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau.';
  const tokens100 = encodeText(testSentence, trainBPE(corpus, 100));
  const tokens1000 = encodeText(testSentence, trainBPE(corpus, 1000));
  checks++;
  if (!(tokens1000.length < tokens100.length)) {
    console.log('LOI: vocab lon hon phai it token hon tren cung 1 cau');
    errors++;
  }
  console.log(`Cau test: vocab~100 -> ${tokens100.length} token; vocab~1000 -> ${tokens1000.length} token`);
}

// Pitfall "strawberry": tu ngoai corpus train (tieng Anh) bi cat vun thanh
// nhieu manh subword khong thang hang voi ky tu that
{
  const tokens = encodeText('strawberry', trainBPE(corpus, 500));
  checks++;
  if (tokens.length < 3) {
    console.log('LOI: tu ngoai corpus train phai bi cat vun thanh nhieu token');
    errors++;
  }
  console.log('Tokenize "strawberry" (BPE train tren tieng Viet):', JSON.stringify(tokens));
}

console.log(errors === 0 ? 'SELF-TEST PASS (' + checks + ' checks)' : errors + ' LOI');

export { trainBPE, encodeText, decodeTokens };
