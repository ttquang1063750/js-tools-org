// Bài 2 — Thu Thập & Làm Sạch Dữ Liệu
// Bộ dữ liệu đồ chơi (60 "tài liệu" giả lập) chia 5 nhóm nguồn khác nhau. Điểm chất lượng
// (qualityScore) do một "bộ phân loại chất lượng" giả lập chấm — MỤC ĐÍCH SƯ PHẠM: nhóm
// "Ngôn ngữ ít tài nguyên" bị chấm điểm thấp hơn thực tế vì bộ phân loại học chủ yếu từ dữ
// liệu tiếng Anh/ngôn ngữ phổ biến — đúng cạm bẫy "bias amplification" nói ở mục 2.4.
const CATEGORIES = [
  {
    id: 'news',
    label: 'Tin tức chính thống',
    scores: [82, 78, 85, 74, 88, 79, 81, 76, 83, 90, 77, 84],
    dupGroups: { 0: 'g-news-syndicated', 1: 'g-news-syndicated' },
  },
  {
    id: 'academic',
    label: 'Học thuật / Paper',
    scores: [88, 91, 85, 89, 93, 87, 90, 86, 92, 84, 89, 91],
    dupGroups: {},
  },
  {
    id: 'forum',
    label: 'Diễn đàn / Blog',
    scores: [55, 62, 58, 65, 49, 60, 57, 63, 52, 66, 59, 61],
    dupGroups: { 5: 'g-forum-repost', 6: 'g-forum-repost' },
  },
  {
    id: 'social',
    label: 'Mạng xã hội',
    scores: [40, 45, 38, 50, 42, 47, 35, 48, 44, 41, 46, 39],
    dupGroups: { 2: 'g-social-viral', 3: 'g-social-viral', 4: 'g-social-viral' },
  },
  {
    id: 'lowres',
    label: 'Ngôn ngữ ít tài nguyên',
    scores: [48, 52, 45, 55, 50, 47, 53, 44, 58, 49, 51, 46],
    dupGroups: {},
  },
];

// Dựng danh sách "tài liệu" phẳng từ cấu trúc nhóm ở trên.
export const DOCUMENTS = CATEGORIES.flatMap((cat) =>
  cat.scores.map((score, i) => ({
    category: cat.id,
    categoryLabel: cat.label,
    quality: score,
    dupGroup: cat.dupGroups[i] || null,
  }))
);

function applyDedup(docs) {
  const seenGroups = new Set();
  return docs.filter((d) => {
    if (!d.dupGroup) return true;
    if (seenGroups.has(d.dupGroup)) return false;
    seenGroups.add(d.dupGroup);
    return true;
  });
}

export function computeFilterResult(threshold, dedupEnabled) {
  const afterDedup = dedupEnabled ? applyDedup(DOCUMENTS) : DOCUMENTS;
  const kept = afterDedup.filter((d) => d.quality >= threshold);

  const perCategory = CATEGORIES.map((cat) => {
    const totalInCat = cat.scores.length;
    const keptInCat = kept.filter((d) => d.category === cat.id).length;
    return {
      id: cat.id,
      label: cat.label,
      total: totalInCat,
      kept: keptInCat,
      keptPct: Math.round((keptInCat / totalInCat) * 100),
    };
  });

  return {
    totalBefore: DOCUMENTS.length,
    totalAfterDedup: afterDedup.length,
    totalKept: kept.length,
    excludedPct: Math.round((1 - kept.length / DOCUMENTS.length) * 100),
    perCategory,
  };
}

export function renderFilterDemo(root) {
  const slider = root.querySelector('.filter-lab-slider');
  const dedupCheckbox = root.querySelector('.filter-lab-dedup');
  const thresholdLabel = root.querySelector('.filter-lab-threshold-label');
  const statsPanel = root.querySelector('.filter-lab-stats');
  const barsPanel = root.querySelector('.filter-lab-bars');

  function render() {
    const threshold = Number(slider.value);
    const dedupEnabled = dedupCheckbox.checked;
    const result = computeFilterResult(threshold, dedupEnabled);

    thresholdLabel.textContent = `Ngưỡng chất lượng: ${threshold}/100`;

    statsPanel.innerHTML = `
      <div class="filter-lab-stat">
        <span class="filter-lab-stat__value">${result.totalKept}/${result.totalBefore}</span>
        <span class="filter-lab-stat__label">Tài liệu giữ lại</span>
      </div>
      <div class="filter-lab-stat">
        <span class="filter-lab-stat__value">${result.excludedPct}%</span>
        <span class="filter-lab-stat__label">Bị loại (lọc chất lượng + dedup)</span>
      </div>
      <div class="filter-lab-stat">
        <span class="filter-lab-stat__value">${dedupEnabled ? DOCUMENTS.length - result.totalAfterDedup : 0}</span>
        <span class="filter-lab-stat__label">Bản trùng lặp đã loại (dedup)</span>
      </div>
    `;

    barsPanel.innerHTML = result.perCategory
      .map(
        (cat) => `
      <div class="filter-lab-bar-row">
        <span class="filter-lab-bar-row__label">${cat.label}</span>
        <div class="filter-lab-bar-row__track">
          <div class="filter-lab-bar-row__fill" style="width:${cat.keptPct}%"></div>
        </div>
        <span class="filter-lab-bar-row__pct">${cat.kept}/${cat.total} (${cat.keptPct}%)</span>
      </div>
    `
      )
      .join('');
  }

  slider.addEventListener('input', render);
  dedupCheckbox.addEventListener('change', render);
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('filter-lab-root');
  if (root) renderFilterDemo(root);
});
