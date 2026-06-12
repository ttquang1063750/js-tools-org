function applyLangContent(lang) {
  document.querySelectorAll('[data-lang-content]').forEach(function(el) {
    el.classList.toggle('active', el.dataset.langContent === lang);
  });
}

var _initLang = localStorage.getItem('lang') || (navigator.language && navigator.language.startsWith('vi') ? 'vi' : 'en');
applyLangContent(_initLang);

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', function() {
      requestAnimationFrame(function() {
        applyLangContent(localStorage.getItem('lang') || 'en');
      });
    });
  }
});
