// Tạo blog/ai/corpus-kieu.txt — toàn văn Truyện Kiều (Nguyễn Du, 3254 câu lục bát).
// Nguồn: https://vi.wikisource.org/wiki/Truyện_Kiều — public domain ({{PD-old}},
// tác giả mất năm 1820). Văn bản nằm trọn trong một khối <poem>…</poem>,
// số dòng đánh bằng template {{số|N}} — script bóc sạch markup, mỗi câu một dòng.
// Cách chạy (từ repo root):
//   node blog/ai/make-corpus-kieu.js
// Dùng cho: Bài 12 (embedding/word2vec), Bài 16 (tokenizer), Bài 19 (GPT-mini).
const fs = require('fs');
const https = require('https');

const API =
  'https://vi.wikisource.org/w/api.php?action=parse&page=Truy%E1%BB%87n%20Ki%E1%BB%81u&format=json&prop=wikitext';

https.get(API, { headers: { 'User-Agent': 'js-tools.org corpus builder' } }, (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    const wikitext = JSON.parse(body).parse.wikitext['*'];
    const m = wikitext.match(/<poem>([\s\S]*?)<\/poem>/);
    if (!m) throw new Error('không tìm thấy khối <poem>');
    const lines = m[1]
      .split('\n')
      .map((l) =>
        l
          .replace(/\{\{số\|\d+\}\}/g, '')
          .replace(/\t/g, '')
          .trim()
      )
      .filter((l) => l.length > 0);
    if (lines.length !== 3254) throw new Error('kỳ vọng 3254 câu, được ' + lines.length);
    const dirty = lines.filter((l) => /[{}[\]<>|]/.test(l));
    if (dirty.length) throw new Error('còn sót markup: ' + dirty[0]);
    fs.writeFileSync(__dirname + '/corpus-kieu.txt', lines.join('\n') + '\n');
    const words = lines.join(' ').split(/\s+/).filter(Boolean);
    console.log(
      `OK: ${lines.length} câu · ${words.length} âm tiết · ` +
        `${new Set(words.map((w) => w.toLowerCase().replace(/[.,!?;:"'…—–]/g, ''))).size} âm tiết phân biệt`
    );
    console.log('Câu đầu:', lines[0]);
    console.log('Câu cuối:', lines[lines.length - 1]);
  });
});
