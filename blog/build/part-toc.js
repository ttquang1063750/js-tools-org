/**
 * Mục lục cho các trang "code thực chiến" (blog/build/<du-an>/part-N.html).
 *
 * Sinh hoàn toàn từ các thẻ h2/h3 có sẵn trong bài, KHÔNG có danh sách gõ tay —
 * các trang này bị sửa liên tục nên một mục lục viết tay sẽ trôi khỏi nội dung
 * mà không ai biết.
 */
(function () {
  'use strict';

  var article = document.querySelector('.article-body') || document.querySelector('article');
  if (!article) return;

  var headings = article.querySelectorAll('h2, h3');
  if (headings.length < 4) return; // trang ngắn thì không cần mục lục

  // ── id cho từng heading ──────────────────────────────────────────────────
  // Ưu tiên số mục ("8.2. Tái hiện lỗi" -> #muc-8-2): ngắn, và không đổi khi
  // ai đó sửa câu chữ của tiêu đề. Không có số thì mới slug hoá phần chữ.
  // Bo dau bang normalize('NFD'): moi ky tu tieng Viet co dau se tach thanh
  // chu goc + dau to hop, xoa dau to hop la xong. KHONG dung bang tra gõ tay —
  // ban dau lam vay va bang bi lech do dai, sinh ra id "undefinedoi-toi-khi-...".
  // Rieng d/D khong tach duoc vi no la mot chu cai rieng, phai doi tay.
  function slug(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  var used = Object.create(null);
  var items = [];

  Array.prototype.forEach.call(headings, function (h) {
    var text = (h.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    var num = text.match(/^(\d+(?:\.\d+)*)[.\s]/);
    var base = num ? 'muc-' + num[1].replace(/\./g, '-') : slug(text);
    var id = base;
    for (var n = 2; used[id]; n++) id = base + '-' + n;
    used[id] = true;

    if (!h.id) h.id = id;
    items.push({ el: h, id: h.id, text: text, level: h.tagName === 'H2' ? 2 : 3 });
  });

  if (!items.length) return;

  // ── dựng panel ───────────────────────────────────────────────────────────
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ptoc-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML =
    '<span class="ptoc-btn__icon" aria-hidden="true">☰</span><span class="ptoc-btn__label">Mục lục</span>';

  var panel = document.createElement('nav');
  panel.className = 'ptoc-panel';
  panel.setAttribute('aria-label', 'Mục lục bài viết');
  panel.hidden = true;

  var head = document.createElement('div');
  head.className = 'ptoc-panel__head';
  head.innerHTML = '<strong>Mục lục</strong>';
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'ptoc-close';
  close.setAttribute('aria-label', 'Đóng mục lục');
  close.textContent = '✕';
  head.appendChild(close);
  panel.appendChild(head);

  var list = document.createElement('ol');
  list.className = 'ptoc-list';
  items.forEach(function (it) {
    var li = document.createElement('li');
    li.className = 'ptoc-item ptoc-item--h' + it.level;
    var a = document.createElement('a');
    a.href = '#' + it.id;
    a.textContent = it.text;
    li.appendChild(a);
    list.appendChild(li);
    it.link = a;
  });
  panel.appendChild(list);

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  function setOpen(open) {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('ptoc-open', open);
  }

  btn.addEventListener('click', function () {
    setOpen(panel.hidden);
  });
  close.addEventListener('click', function () {
    setOpen(false);
    btn.focus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      btn.focus();
    }
  });
  // Trên màn hình hẹp panel chiếm cả trang, nên bấm xong phải đóng lại.
  list.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && window.matchMedia('(max-width: 900px)').matches) {
      setOpen(false);
    }
  });

  // ── highlight mục đang đọc ───────────────────────────────────────────────
  // Dùng IntersectionObserver thay vì lắng nghe scroll: rẻ hơn nhiều trên
  // những trang dài như thế này (part-1 có 28 heading).
  var current = null;
  function mark(it) {
    if (current === it) return;
    if (current) current.link.classList.remove('is-current');
    current = it;
    if (!current) return;
    current.link.classList.add('is-current');
    btn.querySelector('.ptoc-btn__label').textContent = current.level === 2 ? current.text.slice(0, 22) : 'Mục lục';
  }

  if ('IntersectionObserver' in window) {
    var seen = [];
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var it = items.filter(function (x) {
            return x.el === en.target;
          })[0];
          if (!it) return;
          var pos = seen.indexOf(it);
          if (en.isIntersecting) {
            if (pos === -1) seen.push(it);
          } else if (pos !== -1) {
            seen.splice(pos, 1);
          }
        });
        // heading nào đang hiển thị và nằm cao nhất thì coi là mục đang đọc
        if (seen.length) {
          mark(
            seen.slice().sort(function (a, b) {
              return a.el.offsetTop - b.el.offsetTop;
            })[0]
          );
        }
      },
      { rootMargin: '-70px 0px -60% 0px' }
    );
    items.forEach(function (it) {
      io.observe(it.el);
    });
  }
})();
