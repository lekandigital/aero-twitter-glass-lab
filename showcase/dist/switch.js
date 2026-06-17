/*
 * Switcher view: panels pinned at their set X/Y, shown one at a time as big as the screen
 * allows (same size/position relative to the bg, just scaled up). Text hidden by default,
 * fullscreen supported. Auto-rescales on resize / fullscreen.
 */
import { STAGE, loadBranches, createPanel, applyCtl, setHideText, setBg, fitScale, toggleFullscreen } from './common.js';

const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const chipsEl = document.getElementById('chips');

let panels = [];
let active = 0;

function showActive() {
  panels.forEach((p, i) => { p.iframe.style.display = i === active ? 'block' : 'none'; });
  [...chipsEl.children].forEach((c, i) => c.classList.toggle('is-active', i === active));
}

function rescale() {
  // Fill as much of the viewport as possible while preserving the 1440x1572 aspect.
  const pad = document.fullscreenElement ? 0 : 24;
  const z = Math.max(0.2, fitScale(stagewrap.clientWidth - pad, stagewrap.clientHeight - pad));
  stage.style.transform = `scale(${z})`;
  stage.style.width = `${STAGE.w}px`;
  stage.style.height = `${STAGE.h}px`;
  stage.dataset.scale = z;
}

function buildChips(branches) {
  branches.forEach((b, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<span>${b.label}</span><em>${b.save}</em>`;
    chip.addEventListener('click', () => { active = i; showActive(); });
    chipsEl.appendChild(chip);
  });
}

(async function main() {
  const branches = await loadBranches();
  buildChips(branches);
  panels = branches.map((b) => {
    const h = createPanel(b);
    h.hideText = true;                  // text hidden by default
    const prev = h.onReady;
    h.onReady = (x) => { prev && prev(x); applyCtl(x); };
    stage.appendChild(h.iframe);
    return h;
  });
  showActive();
  rescale();

  document.getElementById('prev').onclick = () => { active = (active - 1 + panels.length) % panels.length; showActive(); };
  document.getElementById('next').onclick = () => { active = (active + 1) % panels.length; showActive(); };
  document.getElementById('bg').onchange = (e) => panels.forEach((p) => setBg(p, e.target.checked ? 'reference' : 'current'));
  document.getElementById('text').onchange = (e) => panels.forEach((p) => setHideText(p, !e.target.checked));
  document.getElementById('fs').onclick = () => toggleFullscreen(stagewrap);
  window.addEventListener('resize', rescale);
  document.addEventListener('fullscreenchange', () => setTimeout(rescale, 60));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') document.getElementById('next').click();
    if (e.key === 'ArrowLeft') document.getElementById('prev').click();
  });
})();
