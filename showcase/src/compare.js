/*
 * Compare (A/B swipe): two branches, each pinned NATIVELY at the snap position over the
 * same background (so the edge-reflex lighting is correct), with the top one clipped at a
 * draggable divider — a before/after wipe at the identical position. The full reference is
 * shown beneath for glance comparison. Screenshot saves the composited view.
 */
import { STAGE, loadBranches, createPanel, applyCtl, setHideText, setBg, fitScale, toggleFullscreen, captureScreenshot, refreshReflex } from './common.js';

const REF_H = 961;
const SCENE_H = STAGE.h + 40 + REF_H;

const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const stagewrap = document.getElementById('stagewrap');
const dividerEl = document.getElementById('divider');

let panels = [];
let A = 0, B = 1;
let divX = STAGE.w / 2;
let sceneScale = 1;

function rescale() {
  const pad = document.fullscreenElement ? 8 : 24;
  sceneScale = Math.max(0.12, fitScale(stagewrap.clientWidth - pad, stagewrap.clientHeight - pad, STAGE.w, SCENE_H));
  scene.style.transform = `scale(${sceneScale})`;
}

function render() {
  panels.forEach((p, i) => {
    const isA = i === A, isB = i === B;
    const was = p.iframe.style.display;
    p.iframe.style.display = isA || isB ? 'block' : 'none';
    p.iframe.style.zIndex = isB ? 2 : 1;
    p.iframe.style.clipPath = isB ? `inset(0 0 0 ${divX}px)` : 'none';
    if ((isA || isB) && was === 'none') setTimeout(() => refreshReflex(p), 80);  // re-sample once visible
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
  dividerEl.addEventListener('pointerdown', (e) => { dragging = true; dividerEl.setPointerCapture(e.pointerId); });
  dividerEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = stage.getBoundingClientRect();
    divX = Math.max(0, Math.min(STAGE.w, (e.clientX - rect.left) / sceneScale));
    render();
  });
  const end = (e) => { dragging = false; try { dividerEl.releasePointerCapture(e.pointerId); } catch {} };
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
  document.getElementById('shot').onclick = () => captureScreenshot('experiment-five-compare.png');
  document.getElementById('fs').onclick = () => toggleFullscreen(stagewrap);
  window.addEventListener('resize', rescale);
  document.addEventListener('fullscreenchange', () => setTimeout(rescale, 60));
})();
