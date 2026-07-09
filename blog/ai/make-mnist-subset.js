// Trích subset MNIST cân bằng: 200 mẫu/chữ số × 10 = 2000 mẫu.
// Định dạng mnist-subset.bin (little-endian):
//   4 byte magic "MNS1" | uint16 count | uint8 rows(28) | uint8 cols(28)
//   sau đó count × (1 byte label + rows*cols byte pixel grayscale 0-255)
// Chọn mẫu tất định: lấy 200 ảnh đầu tiên của mỗi chữ số theo thứ tự file gốc,
// rồi xáo trộn bằng mulberry32(seed=42) để batch huấn luyện trộn đều các lớp.
const fs = require('fs');
const zlib = require('zlib');

// Cách chạy (từ repo root):
//   curl -sLo /tmp/train-images.gz https://ossci-datasets.s3.amazonaws.com/mnist/train-images-idx3-ubyte.gz
//   curl -sLo /tmp/train-labels.gz https://ossci-datasets.s3.amazonaws.com/mnist/train-labels-idx1-ubyte.gz
//   node blog/ai/make-mnist-subset.js /tmp
const dir = process.argv[2] || '/tmp';
const imgBuf = zlib.gunzipSync(fs.readFileSync(dir + '/train-images.gz'));
const lblBuf = zlib.gunzipSync(fs.readFileSync(dir + '/train-labels.gz'));

// IDX header: images = magic(4) count(4) rows(4) cols(4); labels = magic(4) count(4)
const imgMagic = imgBuf.readUInt32BE(0);
const lblMagic = lblBuf.readUInt32BE(0);
if (imgMagic !== 0x00000803 || lblMagic !== 0x00000801) throw new Error('IDX magic sai: ' + imgMagic + ' ' + lblMagic);
const n = imgBuf.readUInt32BE(4);
const rows = imgBuf.readUInt32BE(8);
const cols = imgBuf.readUInt32BE(12);
if (lblBuf.readUInt32BE(4) !== n) throw new Error('count ảnh/nhãn lệch nhau');
console.log(`MNIST gốc: ${n} ảnh ${rows}×${cols}`);

const PER_CLASS = 200;
const picked = []; // { label, offset }
const counts = new Array(10).fill(0);
for (let i = 0; i < n; i++) {
  const label = lblBuf[8 + i];
  if (counts[label] < PER_CLASS) {
    counts[label]++;
    picked.push({ label, offset: 16 + i * rows * cols });
    if (picked.length === PER_CLASS * 10) break;
  }
}
if (picked.length !== PER_CLASS * 10) throw new Error('không đủ mẫu: ' + picked.length);

// mulberry32 seed=42 — trùng với PRNG dùng trong các demo của series
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
for (let i = picked.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [picked[i], picked[j]] = [picked[j], picked[i]];
}

const sampleBytes = 1 + rows * cols;
const out = Buffer.alloc(8 + picked.length * sampleBytes);
out.write('MNS1', 0, 'ascii');
out.writeUInt16LE(picked.length, 4);
out.writeUInt8(rows, 6);
out.writeUInt8(cols, 7);
picked.forEach((p, k) => {
  const base = 8 + k * sampleBytes;
  out[base] = p.label;
  imgBuf.copy(out, base + 1, p.offset, p.offset + rows * cols);
});

const dest = __dirname + '/mnist-subset.bin';
fs.mkdirSync(require('path').dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);

// Tự kiểm: đọc lại, đếm phân bố nhãn, in checksum + 10 nhãn đầu
const back = fs.readFileSync(dest);
if (back.toString('ascii', 0, 4) !== 'MNS1') throw new Error('magic sai khi đọc lại');
const cnt = back.readUInt16LE(4);
const dist = new Array(10).fill(0);
let nonzeroPixels = 0;
for (let k = 0; k < cnt; k++) {
  const base = 8 + k * sampleBytes;
  dist[back[base]]++;
  for (let px = 0; px < rows * cols; px++) if (back[base + 1 + px] > 0) nonzeroPixels++;
}
console.log('Đọc lại:', cnt, 'mẫu · phân bố nhãn:', dist.join(','));
console.log('Pixel khác 0 trung bình/ảnh:', (nonzeroPixels / cnt).toFixed(1), '(kỳ vọng ~150)');
console.log('10 nhãn đầu sau shuffle:', Array.from({ length: 10 }, (_, k) => back[8 + k * sampleBytes]).join(' '));
console.log('Kích thước file:', (out.length / 1024).toFixed(0), 'KB');
