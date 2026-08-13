// cpu-moore-law-chiplets.js - Lesson 11 demo (Moore's law & chiplets):
// compares yield and cost, monolithic against chiplet, using the REAL engine
// from cpu-core.js.
import { yieldPoisson, yieldMurphy, diesPerWafer, costPerGoodDie } from './cpu-core.js';

// Every string injected into the DOM has to follow the page's language, not
// the author's - otherwise the English page shows Vietnamese mid-demo.
const STRINGS = {
  vi: {
    costMono: 'Chi phí 1 die mono đạt chuẩn',
    costChiplet: (n) => `Chi phí ${n} chiplet đạt chuẩn (1 sản phẩm)`,
    saves: 'tiết kiệm',
    costsMore: 'đắt hơn',
  },
  en: {
    costMono: 'Cost of 1 good monolithic die',
    costChiplet: (n) => `Cost of ${n} good chiplets (1 product)`,
    saves: 'saves',
    costsMore: 'costs more',
  },
};
const T = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'vi'];

function initYieldCostDemo() {
  const waferDiameterInput = document.getElementById('yc-wafer-diameter-input');
  const waferCostInput = document.getElementById('yc-wafer-cost-input');
  const defectDensityInput = document.getElementById('yc-defect-density-input');
  const monoAreaInput = document.getElementById('yc-mono-area-input');
  const chipletAreaInput = document.getElementById('yc-chiplet-area-input');
  const numChipletsInput = document.getElementById('yc-num-chiplets-input');
  const output = document.getElementById('yc-output');
  const barMono = document.getElementById('yc-bar-mono');
  const barChiplet = document.getElementById('yc-bar-chiplet');
  if (!waferDiameterInput || !output) return;

  function run() {
    const waferDiameter = parseFloat(waferDiameterInput.value);
    const waferCost = parseFloat(waferCostInput.value);
    const defectDensity = parseFloat(defectDensityInput.value);
    const monoArea = parseFloat(monoAreaInput.value);
    const chipletArea = parseFloat(chipletAreaInput.value);
    const numChiplets = parseInt(numChipletsInput.value, 10);

    const nMono = diesPerWafer(waferDiameter, monoArea);
    const nChiplet = diesPerWafer(waferDiameter, chipletArea);
    const yMonoPoisson = yieldPoisson(monoArea, defectDensity);
    const yMonoMurphy = yieldMurphy(monoArea, defectDensity);
    const yChipletMurphy = yieldMurphy(chipletArea, defectDensity);

    const costMono = costPerGoodDie(waferCost, monoArea, waferDiameter, defectDensity, yieldMurphy);
    const costChiplet1 = costPerGoodDie(waferCost, chipletArea, waferDiameter, defectDensity, yieldMurphy);
    const costChipletTotal = costChiplet1 * numChiplets;
    const savingsPct = (1 - costChipletTotal / costMono) * 100;

    output.innerHTML = `
      <div>Die/wafer: mono=<strong>${nMono}</strong> · chiplet=<strong>${nChiplet}</strong></div>
      <div>Yield: mono (Poisson)=<strong>${(yMonoPoisson * 100).toFixed(2)}%</strong> · mono (Murphy)=<strong>${(yMonoMurphy * 100).toFixed(2)}%</strong> · chiplet (Murphy)=<strong>${(yChipletMurphy * 100).toFixed(2)}%</strong></div>
      <div>${T.costMono}: <strong>$${costMono.toFixed(2)}</strong></div>
      <div>${T.costChiplet(numChiplets)}: <strong>$${costChipletTotal.toFixed(2)}</strong></div>
      <div style="color:${savingsPct > 0 ? '#10b981' : '#f87171'}">Chiplet ${savingsPct > 0 ? T.saves : T.costsMore}: <strong>${Math.abs(savingsPct).toFixed(1)}%</strong></div>
    `;

    const maxCost = Math.max(costMono, costChipletTotal);
    barMono.style.width = `${(costMono / maxCost) * 100}%`;
    barChiplet.style.width = `${(costChipletTotal / maxCost) * 100}%`;
  }

  [waferDiameterInput, waferCostInput, defectDensityInput, monoAreaInput, chipletAreaInput, numChipletsInput].forEach(
    (el) => el.addEventListener('input', run)
  );
  run();
}

initYieldCostDemo();
