var _initLang =
  localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('vi') ? 'vi' : 'en');
var currentLang = _initLang;

function setupViOnlyArticles() {
  var articleWrap = document.querySelector('.article-wrap');
  if (articleWrap) {
    var enDisclaimer = articleWrap.querySelector('[data-lang-content="en"]');
    if (enDisclaimer && enDisclaimer.textContent.indexOf('only available in Vietnamese') !== -1) {
      // 1. Hide/remove the English disclaimer block
      enDisclaimer.removeAttribute('data-lang-content');
      enDisclaimer.style.display = 'none';

      // 2. Make the Vietnamese content always visible
      var viContent = articleWrap.querySelector('[data-lang-content="vi"]');
      if (viContent) {
        viContent.removeAttribute('data-lang-content');
        viContent.style.display = 'block';

        // Remove data-lang-content from any nested elements inside the Vietnamese content to prevent them from being hidden in English mode
        viContent.querySelectorAll('[data-lang-content]').forEach(function (nestedEl) {
          nestedEl.removeAttribute('data-lang-content');
        });
      }
    }
  }
}

setupViOnlyArticles();

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
  if (series.indexOf('cpp') !== -1) {
    tagText = currentLang === 'vi' ? 'C++ Lập trình' : 'C++ Programming';
    tagClass = 'blog-card__tag--cpp';
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
      var matches = blogSearchIndex.filter(function (item) {
        var title = removeDiacritics(currentLang === 'vi' ? item.titleVi : item.titleEn);
        var desc = removeDiacritics(item.desc || '');
        var headings = removeDiacritics(currentLang === 'vi' ? item.headingsVi : item.headingsEn);

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
});
