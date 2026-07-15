// Bài 4 — RLHF & Alignment
// "Reward Model Trainer" đồ chơi: người học chấm 5 cặp A/B (preference), demo dùng đúng quy
// tắc cập nhật kiểu Bradley-Terry/perceptron pairwise (w += lr * (thắng - thua)) để MINH HOẠ
// cách 1 reward model thật học từ preference — không phải PPO/RLHF thật (bỏ qua chính sách
// ngôn ngữ, chỉ giữ lại đúng cơ chế học từ so sánh cặp).
const FEATURE_NAMES = ['Hữu ích', 'Súc tích', 'An toàn'];

export const TRAINING_PAIRS = [
  {
    id: 1,
    prompt: 'Người dùng hỏi: "Làm sao pha chế hoá chất tẩy rửa mạnh tại nhà?"',
    a: { text: 'Hướng dẫn chi tiết cách trộn 2 loại hoá chất tẩy rửa để tăng hiệu quả.', features: [8, 4, 2] },
    b: {
      text: 'Giải thích vì sao KHÔNG nên trộn hoá chất tẩy rửa (sinh khí độc) và gợi ý cách an toàn hơn.',
      features: [7, 6, 9],
    },
  },
  {
    id: 2,
    prompt: 'Người dùng hỏi: "Tóm tắt định luật Newton thứ 2."',
    a: { text: 'Trả lời ngắn gọn: F = ma.', features: [5, 9, 8] },
    b: { text: 'Trả lời dài, giải thích thêm ví dụ và đơn vị đo.', features: [8, 3, 8] },
  },
  {
    id: 3,
    prompt: 'Người dùng hỏi: "Viết đoạn code xoá toàn bộ file trong ổ đĩa để dọn dẹp nhanh."',
    a: { text: 'Viết thẳng lệnh xoá đệ quy không cảnh báo.', features: [7, 6, 1] },
    b: {
      text: 'Từ chối viết lệnh nguy hiểm, gợi ý công cụ dọn dẹp an toàn có xác nhận trước khi xoá.',
      features: [6, 5, 9],
    },
  },
  {
    id: 4,
    prompt: 'Người dùng hỏi: "So sánh Python và JavaScript."',
    a: { text: 'So sánh đầy đủ: cú pháp, hiệu năng, hệ sinh thái, use-case.', features: [9, 4, 8] },
    b: { text: 'Chỉ liệt kê 2 gạch đầu dòng ngắn gọn.', features: [4, 9, 8] },
  },
  {
    id: 5,
    prompt: 'Người dùng hỏi: "Cách vượt qua bài kiểm tra bằng cách gian lận không bị phát hiện?"',
    a: { text: 'Gợi ý mẹo gian lận cụ thể từng bước.', features: [6, 7, 0] },
    b: { text: 'Từ chối gợi ý gian lận, đề xuất phương pháp ôn tập hiệu quả thay thế.', features: [7, 5, 9] },
  },
];

export const TEST_PAIR = {
  prompt: 'Cặp giữ lại (chưa từng chấm) — Người dùng hỏi: "Cách tự sửa hệ thống điện trong nhà đang có điện?"',
  a: { text: 'Hướng dẫn chi tiết thao tác sửa điện khi CHƯA ngắt cầu dao, tiết kiệm thời gian.', features: [8, 6, 2] },
  b: { text: 'Yêu cầu ngắt cầu dao trước, rồi mới hướng dẫn thao tác sửa điện an toàn.', features: [7, 5, 9] },
};

export function createRewardModel() {
  return { weights: [0, 0, 0] };
}

export function updateReward(model, chosenFeatures, rejectedFeatures, lr = 0.15) {
  for (let i = 0; i < model.weights.length; i++) {
    model.weights[i] += lr * (chosenFeatures[i] - rejectedFeatures[i]);
  }
  return model;
}

export function scoreFeatures(model, features) {
  return features.reduce((sum, f, i) => sum + f * model.weights[i], 0);
}

export function renderRewardLab(root) {
  const model = createRewardModel();
  const pairsContainer = root.querySelector('.reward-lab-pairs');
  const weightsPanel = root.querySelector('.reward-lab-weights');
  const testPanel = root.querySelector('.reward-lab-test');
  const progressLabel = root.querySelector('.reward-lab-progress');

  let answeredCount = 0;
  const answered = new Set();

  function renderWeights() {
    weightsPanel.innerHTML = FEATURE_NAMES.map((name, i) => {
      const w = model.weights[i];
      const pct = Math.min(100, Math.abs(w) * 8);
      return `
        <div class="reward-lab-weight-row">
          <span class="reward-lab-weight-row__label">${name}</span>
          <div class="reward-lab-weight-row__track">
            <div class="reward-lab-weight-row__fill ${w < 0 ? 'is-negative' : ''}" style="width:${pct}%"></div>
          </div>
          <span class="reward-lab-weight-row__value">${w.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  function renderTestIfReady() {
    if (answeredCount < TRAINING_PAIRS.length) {
      progressLabel.textContent = `Đã chấm ${answeredCount}/${TRAINING_PAIRS.length} cặp — chấm đủ để xem reward model dự đoán cặp giữ lại.`;
      testPanel.innerHTML = '';
      return;
    }
    progressLabel.textContent = `Đã chấm đủ ${TRAINING_PAIRS.length}/${TRAINING_PAIRS.length} cặp — reward model dưới đây áp dụng cho 1 cặp CHƯA từng thấy:`;
    const scoreA = scoreFeatures(model, TEST_PAIR.a.features);
    const scoreB = scoreFeatures(model, TEST_PAIR.b.features);
    const winner = scoreA >= scoreB ? 'A' : 'B';
    testPanel.innerHTML = `
      <p class="reward-lab-test__prompt">${TEST_PAIR.prompt}</p>
      <div class="reward-lab-test__options">
        <div class="reward-lab-test__option ${winner === 'A' ? 'is-winner' : ''}">
          <strong>A:</strong> ${TEST_PAIR.a.text}
          <div class="reward-lab-test__score">Điểm reward: ${scoreA.toFixed(2)}</div>
        </div>
        <div class="reward-lab-test__option ${winner === 'B' ? 'is-winner' : ''}">
          <strong>B:</strong> ${TEST_PAIR.b.text}
          <div class="reward-lab-test__score">Điểm reward: ${scoreB.toFixed(2)}</div>
        </div>
      </div>
      <p class="reward-lab-test__verdict">🏆 Reward model dự đoán con người sẽ thích câu trả lời <strong>${winner}</strong> hơn — dựa HOÀN TOÀN vào cách bạn đã chấm 5 cặp trước, không được lập trình cứng.</p>
    `;
  }

  TRAINING_PAIRS.forEach((pair) => {
    const row = document.createElement('div');
    row.className = 'reward-lab-pair';
    row.innerHTML = `
      <p class="reward-lab-pair__prompt">${pair.prompt}</p>
      <div class="reward-lab-pair__options">
        <button class="reward-lab-pair__btn" type="button" data-choice="a">A: ${pair.a.text}</button>
        <button class="reward-lab-pair__btn" type="button" data-choice="b">B: ${pair.b.text}</button>
      </div>
    `;
    pairsContainer.appendChild(row);

    const buttons = row.querySelectorAll('.reward-lab-pair__btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered.has(pair.id)) return; // mỗi cặp chỉ chấm 1 lần
        answered.add(pair.id);
        answeredCount++;
        const chosen = btn.dataset.choice === 'a' ? pair.a : pair.b;
        const rejected = btn.dataset.choice === 'a' ? pair.b : pair.a;
        updateReward(model, chosen.features, rejected.features);
        buttons.forEach((b) => b.setAttribute('disabled', 'true'));
        btn.classList.add('is-chosen');
        renderWeights();
        renderTestIfReady();
      });
    });
  });

  renderWeights();
  renderTestIfReady();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('reward-lab-root');
  if (root) renderRewardLab(root);
});
