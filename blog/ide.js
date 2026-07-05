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

document.addEventListener('DOMContentLoaded', function() {
  const submitBtns = document.querySelectorAll('.quiz-submit');
  submitBtns.forEach(btn => {
    // If it uses the old onclick method, skip
    if (btn.hasAttribute('onclick')) return;

    btn.addEventListener('click', function() {
      const container = this.closest('.quiz-container');
      const questions = container.querySelectorAll('.quiz-question');
      let allAnswered = true;

      questions.forEach(q => {
        const selected = q.querySelector('input[type="radio"]:checked');
        if (!selected) allAnswered = false;
      });

      if (!allAnswered) {
        alert('Vui lòng trả lời tất cả các câu hỏi trước khi kiểm tra!');
        return;
      }

      questions.forEach(q => {
        const correctVal = q.getAttribute('data-answer');
        const selected = q.querySelector('input[type="radio"]:checked');
        const explanation = q.querySelector('.quiz-explanation');
        
        if (explanation) {
          explanation.style.display = 'block';
        }
        
        if (selected) {
          if (selected.value === correctVal) {
            selected.parentElement.style.color = '#a6e3a1'; // Green
            selected.parentElement.style.fontWeight = 'bold';
          } else {
            selected.parentElement.style.color = '#f38ba8'; // Red
            selected.parentElement.style.textDecoration = 'line-through';
          }
        }
        
        // Highlight correct answer
        const correctInput = q.querySelector(`input[type="radio"][value="${correctVal}"]`);
        if (correctInput && correctInput !== selected) {
          correctInput.parentElement.style.color = '#a6e3a1';
          correctInput.parentElement.style.fontWeight = 'bold';
        }
        
        // Disable inputs
        const inputs = q.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => input.disabled = true);
      });
      
      this.textContent = 'Đã kiểm tra';
      this.disabled = true;
      this.style.opacity = '0.7';
      this.style.cursor = 'default';
    });
  });
});
