/**
 * i18n-locale-selftest.mjs — kiem chung logic locale cua i18n.js.
 *
 *   node i18n-locale-selftest.mjs
 *
 * Vi sao khong test bang trinh duyet: preview pane giu lai DOM va cache script
 * giua cac lan dieu huong, nen mot quan sat kieu "lang van la en" co the chi la
 * gia tri con lai tu lan truoc chu khong phai ket qua that. DOM gia trong Node
 * cho ket qua dut khoat va lap lai duoc.
 *
 * Bon truong hop duoc kiem:
 *   1. Trang co ban dich => KHONG ghi de <html lang> theo localStorage
 *   2. Chieu nguoc lai cua (1)
 *   3. Bam nut tren trang co ban dich => DIEU HUONG sang URL locale kia
 *   4. Trang khong co ban dich => giu nguyen hanh vi cu (doi chu tai cho)
 */
import fs from 'node:fs';

// Doc i18n.js canh file nay, de chay duoc tu bat ky thu muc nao.
const HERE = new URL('.', import.meta.url).pathname;
const SRC = fs.readFileSync(HERE + 'i18n.js', 'utf8');

function makeDom({ htmlLang, alternates, savedLang, navLang }) {
  const el = (attrs = {}, text = '') => ({
    _attrs: attrs,
    innerHTML: text,
    textContent: text,
    title: attrs.title || '',
    dataset: {},
    getAttribute(n) {
      return n in this._attrs ? this._attrs[n] : null;
    },
    setAttribute(n, v) {
      this._attrs[n] = v;
    },
    addEventListener(_e, fn) {
      this._click = fn;
    },
    classList: { toggle() {} },
  });

  const htmlEl = el({ lang: htmlLang });
  Object.defineProperty(htmlEl, 'lang', {
    get() {
      return this._attrs.lang;
    },
    set(v) {
      this._attrs.lang = v;
    },
  });

  const altEls = alternates.map(([hreflang, href]) => el({ rel: 'alternate', hreflang, href }));
  const btn = el({ id: 'langToggle', title: 'Switch language' }, '🇻🇳 Việt Nam');

  const store = { lang: savedLang };
  const nav = { pathname: '/start' };

  // i18n.js thay <button> bang <a href> tren trang co ban dich, nen fake DOM phai
  // ho tro createElement + replaceWith. `toggle` tro toi phan tu DANG nam trong
  // cay — neu getElementById cu tra ve `btn` cu thi khang dinh se do nham phan tu
  // da bi thay the va bao "dat" trong khi trang thuc te khong doi gi.
  let toggle = btn;
  btn.replaceWith = (n) => {
    toggle = n;
  };
  const doc = {
    documentElement: htmlEl,
    createElement(tag) {
      const e = el({});
      e.tagName = tag.toUpperCase();
      e.replaceWith = undefined;
      return e;
    },
    querySelectorAll(sel) {
      if (sel.includes('alternate')) return altEls;
      return [];
    },
    getElementById(id) {
      return id === 'langToggle' ? toggle : null;
    },
    addEventListener(evt, fn) {
      if (evt === 'DOMContentLoaded') this._ready = fn;
    },
  };

  const sandbox = {
    document: doc,
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = v;
      },
    },
    navigator: { language: navLang },
    window: nav,
    Date,
  };
  // `toggle` la getter, khong phai gia tri chup mot lan: sau replaceWith no phai
  // tra ve phan tu MOI, neu khong test se do vao cai <button> da bi bo khoi cay.
  return {
    sandbox,
    doc,
    btn,
    htmlEl,
    store,
    nav,
    get toggle() {
      return toggle;
    },
  };
}

function run(cfg) {
  const d = makeDom(cfg);
  // window.location.href = '...' phai bat duoc, va KHONG duoc coi la da dieu huong
  // khi chua ai gan gi — nen dung mot bien rieng, khong dung chinh doi tuong nav.
  d.navigatedTo = undefined;
  const fakeWindow = {
    location: {
      pathname: '/start',
      set href(v) {
        d.navigatedTo = v;
      },
      get href() {
        return d.navigatedTo;
      },
    },
  };

  const fn = new Function('document', 'localStorage', 'navigator', 'window', SRC);
  fn(d.doc, d.sandbox.localStorage, d.sandbox.navigator, fakeWindow);
  d.doc._ready(); // gia lap DOMContentLoaded
  return d;
}

let fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(
    `  ${ok ? 'DAT ' : 'TRUOT'}  ${name}: ${JSON.stringify(got)}${ok ? '' : ' (mong doi ' + JSON.stringify(want) + ')'}`
  );
};

const ALT = [
  ['en', 'https://js-tools.org/blog/aie/en/aie-js-to-python'],
  ['vi', 'https://js-tools.org/blog/aie/aie-js-to-python'],
  ['x-default', 'https://js-tools.org/blog/aie/aie-js-to-python'],
];

console.log('\n[1] Trang EN co ban dich, localStorage=vi — lang KHONG duoc ghi de');
let d = run({ htmlLang: 'en', alternates: ALT, savedLang: 'vi', navLang: 'vi-VN' });
check('html lang', d.htmlEl.lang, 'en');
check('nhan nut (moi sang VI)', d.toggle.title, 'Chuyển sang tiếng Việt');
check('nut la mot LIEN KET, khong phai <button>', d.toggle.tagName, 'A');
check('href tro dung ban tieng Viet', d.toggle.href, 'https://js-tools.org/blog/aie/aie-js-to-python');

console.log('\n[2] Trang VI co ban dich, localStorage=en — lang KHONG duoc ghi de');
d = run({ htmlLang: 'vi', alternates: ALT, savedLang: 'en', navLang: 'en-US' });
check('html lang', d.htmlEl.lang, 'vi');
check('nhan nut (moi sang EN)', d.toggle.title, 'Switch to English');
check('href tro dung ban tieng Anh', d.toggle.href, 'https://js-tools.org/blog/aie/en/aie-js-to-python');

console.log('\n[3] Trang EN co ban dich — dieu huong bang href, khong bang JS');
d = run({ htmlLang: 'en', alternates: ALT, savedLang: 'en', navLang: 'en-US' });
check('dich den nam trong href', d.toggle.href, 'https://js-tools.org/blog/aie/aie-js-to-python');
// Trinh duyet tu di theo href, nen i18n.js KHONG duoc tu gan window.location:
// lam ca hai la dieu huong hai lan va tao mot muc lich su rac.
d.toggle._click();
check('KHONG tu gan window.location', d.navigatedTo, undefined);
check('localStorage duoc ghi truoc khi roi trang', d.store.lang, 'vi');

console.log('\n[4] Trang KHONG co ban dich — giu hanh vi cu (doi chu, ghi de lang)');
d = run({ htmlLang: 'vi', alternates: [], savedLang: 'en', navLang: 'en-US' });
check('html lang theo localStorage', d.htmlEl.lang, 'en');
d.btn._click();
check('khong dieu huong', d.navigatedTo, undefined);
check('localStorage doi sang vi', d.store.lang, 'vi');

console.log('\n[5] Mo trang VI co ban dich khi da chon "en" — KHONG duoc ghi de lua chon');
d = run({ htmlLang: 'vi', alternates: ALT, savedLang: 'en', navLang: 'vi-VN' });
check('localStorage van giu lua chon cua nguoi dung', d.store.lang, 'en');
check('html lang van la cua trang', d.htmlEl.lang, 'vi');

console.log('\n[6] Mo trang KHONG co ban dich — cung khong duoc ghi de');
d = run({ htmlLang: 'vi', alternates: [], savedLang: 'en', navLang: 'vi-VN' });
check('localStorage van giu "en"', d.store.lang, 'en');

console.log('\n[7] Bam nut thi MOI duoc ghi');
d = run({ htmlLang: 'vi', alternates: [], savedLang: 'en', navLang: 'vi-VN' });
d.btn._click();
check('sau khi bam, localStorage doi', d.store.lang, 'vi');

console.log(fail === 0 ? '\n==> TAT CA DEU DAT\n' : `\n==> ${fail} KHANG DINH TRUOT\n`);
process.exit(fail ? 1 : 0);
