function copyCode(btn) {
  var pre = btn.closest('.code-window').querySelector('pre');
  if (!pre) return;
  var code = pre.innerText || pre.textContent;

  navigator.clipboard
    .writeText(code)
    .then(function () {
      var origText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = origText;
        btn.classList.remove('copied');
      }, 2000);
    })
    .catch(function (err) {
      console.error('Failed to copy text: ', err);
    });
}

function checkQuiz(optionBtn, isCorrect, explanation) {
  var container = optionBtn.closest('.quiz-container');
  var options = container.querySelectorAll('.quiz-option');

  // Disable all options
  options.forEach(function (opt) {
    opt.style.pointerEvents = 'none';
  });

  // Highlight correct and selected incorrect options
  if (isCorrect) {
    optionBtn.classList.add('correct');
  } else {
    optionBtn.classList.add('incorrect');
    // Highlight the correct one
    options.forEach(function (opt) {
      if (opt.getAttribute('data-correct') === 'true') {
        opt.classList.add('correct');
      }
    });
  }

  // Display feedback
  var feedback = container.querySelector('.quiz-feedback');
  if (feedback) {
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'success' : 'error');
    feedback.innerHTML = '<strong>' + (isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác.') + '</strong> ' + explanation;
  }
}
