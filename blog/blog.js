function applyLangContent(lang) {
  document.querySelectorAll('[data-lang-content]').forEach(function(el) {
    el.classList.toggle('active', el.dataset.langContent === lang);
  });
  
  // Update search input placeholder based on language
  var searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    searchInput.placeholder = lang === 'vi' ? 'Tìm kiếm bài viết, khóa học...' : 'Search articles, courses...';
  }
}

var _initLang = localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('vi') ? 'vi' : 'en');
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

document.addEventListener('DOMContentLoaded', function() {
  // 1. Language Toggle Handler
  var btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', function() {
      requestAnimationFrame(function() {
        applyLangContent(localStorage.getItem('lang') || 'en');
      });
    });
  }

  // 2. Real-time Search Handler
  var searchInput = document.getElementById('blogSearchInput');
  var clearBtn = document.getElementById('clearSearchBtn');
  var noResults = document.getElementById('noSearchResults');
  var cards = document.querySelectorAll('.blog-card');
  var grids = document.querySelectorAll('.blog-grid');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var query = removeDiacritics(searchInput.value.trim());

      // Toggle clear button visibility
      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
      }

      // Filter cards
      cards.forEach(function(card) {
        var cardText = removeDiacritics(card.textContent);
        if (cardText.indexOf(query) !== -1) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Filter grids and section headers
      grids.forEach(function(grid) {
        var visibleCards = grid.querySelectorAll('.blog-card:not(.hidden)');
        var header = grid.previousElementSibling;
        
        if (visibleCards.length === 0) {
          grid.classList.add('hidden');
          if (header && header.classList.contains('blog-section__title')) {
            header.classList.add('hidden');
          }
        } else {
          grid.classList.remove('hidden');
          if (header && header.classList.contains('blog-section__title')) {
            header.classList.remove('hidden');
          }
        }
      });

      // Show/hide no results container
      var totalVisible = document.querySelectorAll('.blog-card:not(.hidden)').length;
      if (noResults) {
        noResults.style.display = totalVisible === 0 ? 'block' : 'none';
      }
    });
  }

  // Clear search handler
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      searchInput.focus();
      // Dispatch input event to trigger filter reset
      searchInput.dispatchEvent(new Event('input'));
    });
  }
});
