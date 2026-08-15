var _initLang =
  localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('vi') ? 'vi' : 'en');
var currentLang = _initLang;

// GHI CHU: truoc day o day co `setupViOnlyArticles()` — mot ham xu ly truong hop dac biet
// cho cac bai chi co tieng Viet nhung van mang khoi `data-lang-content="en"` chua dong
// disclaimer "only available in Vietnamese". Cac khoi vo do da duoc bo khoi 122 trang bai
// hoc, nen ham do khong con gi de xu ly va da duoc xoa.
//
// `data-lang-content` gio CHI con o 11 trang thuc su song ngu (blog/index.html va cac bai
// cong cu/marketing), va chung duoc `applyLangContent()` ben duoi lo.

function applyLangContent(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-lang-content]').forEach(function (el) {
    el.classList.toggle('active', el.dataset.langContent === lang);
  });

  // Update search input placeholder based on language
  var searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    searchInput.placeholder = lang === 'vi' ? 'Tìm kiếm bài viết, khóa học...' : 'Search articles, courses...';
  }
}

applyLangContent(_initLang);

// Helper to remove diacritics for robust Vietnamese search
function removeDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function renderSearchCard(item) {
  var title = currentLang === 'vi' ? item.titleVi : item.titleEn;
  var tagText = '';
  var tagClass = '';

  var series = item.parentSeries || item.url;
  // Phai dat TRUOC nhanh 'js-': chuoi 'build/nestjs-media-platform' co chua
  // 'js-' (trong "nestjs-media"), de bi gan nham nhan JavaScript.
  if (series.indexOf('build/') !== -1) {
    tagText = currentLang === 'vi' ? 'Code thực chiến' : 'Real-World Build';
    tagClass = 'blog-card__tag--build';
  } else if (series.indexOf('cpp') !== -1) {
    tagText = currentLang === 'vi' ? 'C++ Lập trình' : 'C++ Programming';
    tagClass = 'blog-card__tag--cpp';
  } else if (series.indexOf('webgl') !== -1) {
    tagText = currentLang === 'vi' ? 'WebGL & 3D' : 'WebGL & 3D';
    tagClass = 'blog-card__tag--webgl';
  } else if (series.indexOf('canvas') !== -1) {
    tagText = currentLang === 'vi' ? 'Canvas & Đồ họa' : 'Canvas & Graphics';
    tagClass = 'blog-card__tag--canvas';
  } else if (series.indexOf('bash') !== -1) {
    tagText = currentLang === 'vi' ? 'Bash & Shell' : 'Bash & Shell';
    tagClass = 'blog-card__tag--bash';
  } else if (series.indexOf('js-') !== -1) {
    tagText = currentLang === 'vi' ? 'JS Cốt lõi' : 'JS Core';
    tagClass = 'blog-card__tag--js';
  } else if (series.indexOf('c-') !== -1) {
    tagText = currentLang === 'vi' ? 'C Lập trình' : 'C Programming';
    tagClass = 'blog-card__tag--c';
  } else if (series.indexOf('snapcast') !== -1) {
    tagText = 'SnapCast';
    tagClass = 'blog-card__tag--sc';
  } else if (series.indexOf('coloraquarium') !== -1 || series.indexOf('colorquarium') !== -1) {
    tagText = 'ColorQuarium';
    tagClass = 'blog-card__tag--cq';
  } else if (series.indexOf('qr') !== -1) {
    tagText = 'QR Generator';
    tagClass = 'blog-card__tag--qr';
  } else if (series.indexOf('optimizer') !== -1 || series.indexOf('compress') !== -1 || series.indexOf('webp') !== -1) {
    tagText = 'Image Optimizer';
    tagClass = 'blog-card__tag--io';
  } else if (series.indexOf('rmbg') !== -1) {
    tagText = 'Remove BG';
    tagClass = 'blog-card__tag--rmbg';
  } else {
    tagText = 'Blog';
    tagClass = '';
  }

  var isLesson = !!item.parentSeries;
  var subTag = isLesson ? (currentLang === 'vi' ? ' • Bài học' : ' • Lesson') : '';
  var metaText = isLesson
    ? currentLang === 'vi'
      ? 'Trong khóa học'
      : 'In course'
    : currentLang === 'vi'
      ? 'Bài viết'
      : 'Article';
  var readMoreText = currentLang === 'vi' ? 'Đọc bài học →' : 'Read lesson →';
  if (!isLesson) {
    readMoreText = currentLang === 'vi' ? 'Đọc bài viết →' : 'Read article →';
  }

  return (
    '<a href="' +
    item.url +
    '" class="blog-card">' +
    '<span class="blog-card__tag ' +
    tagClass +
    '">' +
    tagText +
    subTag +
    '</span>' +
    '<h2 class="blog-card__title">' +
    title +
    '</h2>' +
    '<p class="blog-card__excerpt">' +
    (item.desc || '') +
    '</p>' +
    '<div class="blog-card__meta">' +
    '<span>' +
    metaText +
    '</span>' +
    '</div>' +
    '<span class="blog-card__read-more">' +
    readMoreText +
    '</span>' +
    '</a>'
  );
}

document.addEventListener('DOMContentLoaded', function () {
  // 1. Language Toggle Handler
  var btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', function () {
      requestAnimationFrame(function () {
        var newLang = localStorage.getItem('lang') || 'en';
        applyLangContent(newLang);
        // Trigger search rerun if search input is active
        var searchInput = document.getElementById('blogSearchInput');
        if (searchInput && searchInput.value.trim().length > 0) {
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  // 2. Real-time Search Handler using search-index.json
  var searchInput = document.getElementById('blogSearchInput');
  var clearBtn = document.getElementById('clearSearchBtn');
  var noResults = document.getElementById('noSearchResults');
  var defaultContent = document.getElementById('defaultBlogContent');
  var resultsContainer = document.getElementById('searchResultsContainer');
  var resultsGrid = document.getElementById('searchResultsGrid');

  if (searchInput) {
    var blogSearchIndex = [];

    // Fetch search-index.json only on listing page
    fetch('search-index.json')
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        blogSearchIndex = data;
        // In case they typed something before loading completes
        if (searchInput.value.trim().length > 0) {
          searchInput.dispatchEvent(new Event('input'));
        }
      })
      .catch(function (err) {
        console.error('Failed to load search index:', err);
      });

    searchInput.addEventListener('input', function () {
      var query = removeDiacritics(searchInput.value.trim());

      // Toggle clear button visibility
      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
      }

      if (query.length === 0) {
        // Reset view to default
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (defaultContent) defaultContent.style.display = 'block';
        if (noResults) noResults.style.display = 'none';
        return;
      }

      // Filter from index
      // Moi truong deu phai co guard '': search-index.json tung lan hai schema
      // khac nhau (13 muc electronics chi co {title,url,content}), va mot muc
      // thieu titleVi lam removeDiacritics() nem loi NGAY TRONG filter ->
      // toan bo tim kiem chet im lang, khong bao gi cho nguoi dung.
      var matches = blogSearchIndex.filter(function (item) {
        var title = removeDiacritics((currentLang === 'vi' ? item.titleVi : item.titleEn) || '');
        var desc = removeDiacritics(item.desc || '');
        var headings = removeDiacritics((currentLang === 'vi' ? item.headingsVi : item.headingsEn) || '');

        return title.indexOf(query) !== -1 || desc.indexOf(query) !== -1 || headings.indexOf(query) !== -1;
      });

      // Render matches
      if (resultsGrid) {
        resultsGrid.innerHTML = '';
        matches.forEach(function (item) {
          resultsGrid.innerHTML += renderSearchCard(item);
        });
      }

      // Toggle visibility based on result count
      if (matches.length === 0) {
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (defaultContent) defaultContent.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
      } else {
        if (resultsContainer) resultsContainer.style.display = 'block';
        if (defaultContent) defaultContent.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
      }
    });
  }

  // Clear search handler
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', function () {
      searchInput.value = '';
      searchInput.focus();
      searchInput.dispatchEvent(new Event('input'));
    });
  }

  // 3. Giscus Comments Loader
  var giscusContainer = document.querySelector('.giscus');
  if (giscusContainer) {
    var script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'ttquang1063750/js-tools-org');
    script.setAttribute('data-repo-id', 'R_kgDOSrDM-g');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOSrDM-s4C_0a-');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'transparent_dark');
    script.setAttribute('data-lang', currentLang === 'vi' ? 'vi' : 'en');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    giscusContainer.appendChild(script);
  }

  // 4. Auto Code Viewer for Interactive Demos (.canvas-demo)
  var demos = document.querySelectorAll('.canvas-demo');
  demos.forEach(function (demo) {
    var scriptEl = demo.nextElementSibling;
    while (scriptEl && scriptEl.tagName !== 'SCRIPT') {
      scriptEl = scriptEl.nextElementSibling;
    }

    if (scriptEl) {
      var header = demo.querySelector('.canvas-demo__header');
      if (header) {
        var actions = header.querySelector('.canvas-demo__actions');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'canvas-demo__actions';
          actions.style.display = 'flex';
          actions.style.gap = '8px';
          actions.style.alignItems = 'center';

          var resetBtn = header.querySelector('.canvas-demo__reset');
          if (resetBtn) {
            header.removeChild(resetBtn);
            actions.appendChild(resetBtn);
          }
          header.appendChild(actions);
        }

        var codeBtn = document.createElement('button');
        codeBtn.type = 'button';
        codeBtn.className = 'canvas-demo__view-code';
        codeBtn.innerHTML = '⟨⟩ Xem Code';
        codeBtn.style.fontSize = '12px';
        codeBtn.style.fontWeight = '600';
        codeBtn.style.color = '#4b5563';
        codeBtn.style.background = '#fff';
        codeBtn.style.border = '1px solid #d1d5db';
        codeBtn.style.borderRadius = '6px';
        codeBtn.style.padding = '4px 12px';
        codeBtn.style.cursor = 'pointer';
        codeBtn.style.transition = 'all 0.15s';

        codeBtn.addEventListener('mouseenter', function () {
          codeBtn.style.background = '#f3f4f6';
          codeBtn.style.color = '#111827';
        });
        codeBtn.addEventListener('mouseleave', function () {
          codeBtn.style.background = '#fff';
          codeBtn.style.color = '#4b5563';
        });

        actions.insertBefore(codeBtn, actions.firstChild);

        var codeContainer = document.createElement('div');
        codeContainer.className = 'canvas-demo__code-wrapper hidden';
        codeContainer.style.display = 'none';
        codeContainer.style.borderTop = '1px solid #e5e5e5';
        codeContainer.style.background = '#1e1e24';
        codeContainer.style.padding = '16px';

        var rawCode = scriptEl.textContent.trim();
        // Remove outer IIFE if present for cleaner display
        if (rawCode.indexOf('(function') === 0 && rawCode.slice(-5) === ')();') {
          var innerMatch = rawCode.match(/^\(function\s*\(\)\s*\{([\s\S]*)\}\)\(\);$/);
          if (innerMatch) {
            rawCode = innerMatch[1].trim();
            var lines = rawCode.split('\n');
            var minIndent = Infinity;
            lines.forEach(function (line) {
              if (line.trim()) {
                var indent = line.match(/^\s*/)[0].length;
                if (indent < minIndent) minIndent = indent;
              }
            });
            if (minIndent !== Infinity && minIndent > 0) {
              rawCode = lines
                .map(function (line) {
                  return line.substring(minIndent);
                })
                .join('\n');
            }
          }
        }

        var pre = document.createElement('pre');
        pre.style.margin = '0';
        pre.style.overflowX = 'auto';
        pre.style.fontSize = '13px';
        pre.style.lineHeight = '1.5';

        var code = document.createElement('code');
        code.className = 'language-javascript';
        code.textContent = rawCode;
        pre.appendChild(code);
        codeContainer.appendChild(pre);

        demo.appendChild(codeContainer);

        codeBtn.addEventListener('click', function () {
          if (codeContainer.style.display === 'none') {
            codeContainer.style.display = 'block';
            codeBtn.style.background = '#e5e7eb';
            codeBtn.style.borderColor = '#9ca3af';
            codeBtn.textContent = '⟨⟩ Ẩn Code';
            if (window.Prism) {
              window.Prism.highlightElement(code);
            }
          } else {
            codeContainer.style.display = 'none';
            codeBtn.style.background = '#fff';
            codeBtn.style.borderColor = '#d1d5db';
            codeBtn.textContent = '⟨⟩ Xem Code';
          }
        });
      }
    }
  });

  // 5. Dynamic Code Viewer for Embedded Visualizer iFrames
  var iframes = document.querySelectorAll('iframe');
  iframes.forEach(function (iframe) {
    var src = iframe.getAttribute('src');
    if (src && src.indexOf('.html') !== -1 && src.indexOf('http') === -1) {
      var container = iframe.parentNode;
      if (container) {
        var wrapper = document.createElement('div');
        wrapper.className = 'iframe-code-explorer';
        wrapper.style.margin = '16px 0 28px 0';
        wrapper.style.textAlign = 'center';

        var viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'canvas-demo__btn canvas-demo__btn--ghost';
        viewBtn.innerHTML = '⟨⟩ Xem Code Công Cụ Mô Phỏng';
        viewBtn.style.padding = '8px 16px';
        viewBtn.style.fontSize = '13px';
        viewBtn.style.fontWeight = '600';
        viewBtn.style.cursor = 'pointer';
        viewBtn.style.borderRadius = '6px';
        viewBtn.style.transition = 'all 0.15s';

        wrapper.appendChild(viewBtn);
        iframe.after(wrapper);

        var codeContainer = document.createElement('div');
        codeContainer.style.display = 'none';
        codeContainer.style.textAlign = 'left';
        codeContainer.style.marginTop = '16px';
        codeContainer.style.border = '1px solid #e5e5e5';
        codeContainer.style.borderRadius = '8px';
        codeContainer.style.background = '#1e1e24';
        codeContainer.style.padding = '16px';
        codeContainer.style.overflow = 'hidden';

        var pre = document.createElement('pre');
        pre.style.margin = '0';
        pre.style.overflowX = 'auto';
        pre.style.maxHeight = '500px';
        pre.style.fontSize = '12.5px';

        var code = document.createElement('code');
        code.className = 'language-markup';
        pre.appendChild(code);
        codeContainer.appendChild(pre);
        wrapper.appendChild(codeContainer);

        var fetched = false;

        viewBtn.addEventListener('click', function () {
          if (codeContainer.style.display === 'none') {
            if (!fetched) {
              viewBtn.textContent = 'Đang tải mã nguồn...';
              fetch(src)
                .then(function (r) {
                  return r.text();
                })
                .then(function (text) {
                  code.textContent = text;
                  if (window.Prism) {
                    window.Prism.highlightElement(code);
                  }
                  viewBtn.textContent = '⟨⟩ Ẩn Code Công Cụ Mô Phỏng';
                  codeContainer.style.display = 'block';
                  fetched = true;
                })
                .catch(function (err) {
                  viewBtn.textContent = 'Lỗi tải mã nguồn';
                  console.error(err);
                });
            } else {
              viewBtn.textContent = '⟨⟩ Ẩn Code Công Cụ Mô Phỏng';
              codeContainer.style.display = 'block';
            }
          } else {
            codeContainer.style.display = 'none';
            viewBtn.textContent = '⟨⟩ Xem Code Công Cụ Mô Phỏng';
          }
        });
      }
    }
  });

  // 5. Tabbed code viewer (Xem trước | HTML | CSS)
  document.querySelectorAll('.code-tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('.code-tabs__tab');
    var panels = tabs.querySelectorAll('.code-tabs__panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        btns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        panels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === target);
        });
      });
    });
  });
});
