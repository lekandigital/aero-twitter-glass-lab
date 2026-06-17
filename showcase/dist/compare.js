/*
 * Compare (A/B swipe): two branches pinned at the same X/Y over the same background. The
 * top panel (B) is clipped at a draggable vertical divider, so left-of-divider shows A and
 * right-of-divider shows B at the identical position — a before/after wipe. Because both
 * iframes carry the same bg image aligned, the seam is invisible in the background.
 */
import { STAGE, loadBranches, createPanel, applyCtl, setHideText, setBg, fitScale, toggleFullscreen } from './common.js';

const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const dividerEl = document.getElementById('divider');

let panels = [];
let A = 0, B = 1;
let divX = STAGE.w / 2;        // divider in logical px

function scale() { return Number(stage.dataset.scale || 1); }

function rescale() {
  const pad = document.fullscreenElement ? 0 : 24;
  const z = Math.max(0.2, fitScale(stagewrap.clientWidth - pad, stagewrap.clientHeight - pad));
  stage.style.transform = `scale(${z})`;
  stage.style.width = `${STAGE.w}px`;
  stage.style.height = `${STAGE.h}px`;
  stage.dataset.scale = z;
}

function render() {
  panels.forEach((p, i) => {
    const isA = i === A, isB = i === B;
    p.iframe.style.display = isA || isB ? 'block' : 'none';
    p.iframe.style.zIndex = isB ? 2 : 1;
    // B (top) shows only to the RIGHT of the divider; A shows underneath on the left.
    p.iframe.style.clipPath = isB ? `inset(0 0 0 ${divX}px)` : 'none';
  });
  dividerEl.style.left = `${divX}px`;
}

function buildSelects(branches) {
  const selA = document.getElementById('selA'), selB = document.getElementById('selB');
  branches.forEach((b, i) => {
    selA.add(new Option(`${b.label} · ${b.save}`, i));
    selB.add(new Option(`${b.label} · ${b.save}`, i));
  });
  selA.value = A; selB.value = B;
  selA.onchange = () => { A = Number(selA.value); render(); };
  selB.onchange = () => { B = Number(selB.value); render(); };
}

function initDividerDrag() {
  let dragging = false;
  const start = (e) => { dragging = true; dividerEl.setPointerCapture(e.pointerId); };
  const move = (e) => {
    if (!dragging) return;
    const rect = stage.getBoundingClientRect();
    divX = Math.max(0, Math.min(STAGE.w, (e.clientX - rect.left) / scale()));
    render();
  };
  const end = (e) => { dragging = false; try { dividerEl.releasePointerCapture(e.pointerId); } catch {} };
  dividerEl.addEventListener('pointerdown', start);
  dividerEl.addEventListener('pointermove', move);
  dividerEl.addEventListener('pointerup', end);
  dividerEl.addEventListener('pointercancel', end);
}

(async function main() {
  const branches = await loadBranches();
  buildSelects(branches);
  panels = branches.map((b) => {
    const h = createPanel(b);
    h.hideText = true;
    const prev = h.onReady;
    h.onReady = (x) => { prev && prev(x); applyCtl(x); };
    stage.appendChild(h.iframe);
    return h;
  });
  rescale();
  render();
  initDividerDrag();

  document.getElementById('center').onclick = () => { divX = STAGE.w / 2; render(); };
  document.getElementById('bg').onchange = (e) => panels.forEach((p) => setBg(p, e.target.checked ? 'reference' : 'current'));
  document.getElementById('text').onchange = (e) => panels.forEach((p) => setHideText(p, !e.target.checked));
  document.getElementById('fs').onclick = () => toggleFullscreen(stagewrap);
  window.addEventListener('resize', rescale);
  document.addEventListener('fullscreenchange', () => setTimeout(rescale, 60));
})();
