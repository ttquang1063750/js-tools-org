// Bài 1 — Vòng Đời Một AI Product Thật
// Dữ liệu mô phỏng (không phải số liệu tài chính thật của bất kỳ công ty cụ thể nào) —
// chỉ mang tính minh hoạ TƯƠNG QUAN chi phí/thời gian giữa các giai đoạn, dựa trên các
// con số công khai phổ biến trong ngành (pretraining áp đảo chi phí compute).
export const LIFECYCLE_STAGES = [
  {
    id: 'collect',
    label: '1. Thu thập & Làm sạch',
    time: 'Vài tháng',
    costPct: 15,
    costNote: 'Lưu trữ dữ liệu thô + nhân công gán nhãn/lọc chất lượng',
    roles: ['Data Engineer', 'Data Labeler', 'Legal/Compliance'],
    detail:
      'Crawl/mua dữ liệu, khử trùng lặp (dedup), lọc nội dung độc hại/kém chất lượng, kiểm tra license & PII. ' +
      'Đây là giai đoạn tốn NHÂN LỰC nhất (con người rà soát) nhưng compute rẻ nhất trong 6 giai đoạn.',
  },
  {
    id: 'pretrain',
    label: '2. Huấn luyện phân tán (Pretraining)',
    time: 'Vài tuần – vài tháng',
    costPct: 100,
    costNote: 'Cụm GPU/TPU hàng nghìn chip chạy liên tục — chiếm phần lớn tổng chi phí compute',
    roles: ['ML/Research Scientist', 'Infra/Platform Engineer'],
    detail:
      'Model học biểu diễn ngôn ngữ/thị giác từ dữ liệu thô quy mô lớn qua hàng triệu bước gradient descent. ' +
      'Đây là giai đoạn ĐẮT NHẤT — thường chiếm hơn một nửa tổng chi phí compute của cả vòng đời.',
  },
  {
    id: 'rlhf',
    label: '3. RLHF / Alignment',
    time: 'Vài tuần',
    costPct: 40,
    costNote: 'Compute nhỏ hơn pretraining nhiều, nhưng gán nhãn preference con người rất tốn kém',
    roles: ['Alignment Researcher', 'Human Rater (preference labeling)'],
    detail:
      'Dùng phản hồi con người (so sánh A/B câu trả lời) để huấn luyện reward model, rồi tinh chỉnh policy bằng ' +
      'PPO để model trả lời hữu ích/an toàn hơn — không chỉ đúng cú pháp.',
  },
  {
    id: 'eval',
    label: '4. Đánh giá & Red-team',
    time: 'Vài tuần (song song RLHF)',
    costPct: 20,
    costNote: 'Chi phí chuyên gia bảo mật/domain + compute chạy benchmark',
    roles: ['Trust & Safety', 'Security Researcher', 'Domain QA'],
    detail:
      'Chủ động tấn công thử (jailbreak, adversarial prompt) và chạy benchmark đa nhiệm trước khi phát hành, ' +
      'để tìm lỗ hổng và đo chất lượng thật thay vì chỉ tin vào 1 con số leaderboard.',
  },
  {
    id: 'deploy',
    label: '5. Triển khai (Canary → Full rollout)',
    time: 'Vài ngày → vài tuần',
    costPct: 25,
    costNote: 'Hạ tầng inference (không phải training) — chi phí vận hành liên tục bắt đầu từ đây',
    roles: ['MLOps Engineer', 'SRE', 'Product Manager'],
    detail:
      'Phát hành dần cho một phần nhỏ traffic (canary), so sánh metric với bản cũ, rồi mới rollout toàn bộ. ' +
      'Luôn giữ khả năng rollback tức thời nếu phát hiện regression.',
  },
  {
    id: 'monitor',
    label: '6. Giám sát & Lặp lại',
    time: 'Liên tục (suốt vòng đời sản phẩm)',
    costPct: 30,
    costNote: 'Chi phí inference + giám sát + support cộng dồn theo thời gian, có thể vượt cả chi phí training ban đầu',
    roles: ['MLOps', 'Customer Support', 'Product/Research (vòng lặp cải tiến)'],
    detail:
      'Theo dõi drift, phản hồi người dùng, sự cố sản xuất — dữ liệu thu thập được ở đây quay lại nuôi vòng lặp ' +
      "Bài 2 (thu thập dữ liệu) của phiên bản model kế tiếp. Vòng đời không kết thúc ở 'deploy'.",
  },
];

export function renderLifecycleDemo(root) {
  const stageBtns = root.querySelectorAll('.lifecycle-stage');
  const detailPanel = root.querySelector('.lifecycle-detail');

  function show(stageId) {
    const stage = LIFECYCLE_STAGES.find((s) => s.id === stageId);
    if (!stage) return;
    stageBtns.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.stage === stageId));
    detailPanel.innerHTML = `
      <div class="lifecycle-detail__header">
        <strong>${stage.label}</strong>
        <span class="lifecycle-detail__time">⏱ ${stage.time}</span>
      </div>
      <div class="lifecycle-detail__cost">
        <div class="lifecycle-detail__cost-label">Chi phí tương đối: ${stage.costPct}%</div>
        <div class="lifecycle-detail__cost-bar">
          <div class="lifecycle-detail__cost-fill" style="width:${stage.costPct}%"></div>
        </div>
        <div class="lifecycle-detail__cost-note">${stage.costNote}</div>
      </div>
      <p class="lifecycle-detail__text">${stage.detail}</p>
      <div class="lifecycle-detail__roles">
        ${stage.roles.map((r) => `<span class="lifecycle-role-chip">${r}</span>`).join('')}
      </div>
    `;
  }

  stageBtns.forEach((btn) => {
    btn.addEventListener('click', () => show(btn.dataset.stage));
  });

  show(LIFECYCLE_STAGES[0].id);
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('lifecycle-demo-root');
  if (root) renderLifecycleDemo(root);
});
