/*
 * Stage view: all branches mounted stacked at one shared X/Y; show one at a time and
 * flip between them (same position) to compare. Drag to move (free-move), Snap to reset,
 * toggle current/reference bg, hide/show text, zoom, fullscreen.
 */
import {
  STAGE, SNAP, loadBranches, createPanel, applyCtl, setPos, snapPos, setHideText, setBg,
  fitScale, toggleFullscreen,
} from './common.js';

const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const dragcatch = document.getElementById('dragcatch');
const chipsEl = document.getElementById('chips');

let panels = [];          // handles
let active = 0;           // visible branch index
let shared = { x: SNAP.x, y: SNAP.y };
let zoom = 0.6;
let freeMove = false;

function applyShared() { panels.forEach((p) => setPos(p, shared.x, shared.y)); }

function showActive() {
  panels.forEach((p, i) => { p.iframe.style.display = i === active ? 'block' : 'none'; });
  [...chipsEl.children].forEach((c, i) => c.classList.toggle('is-active', i === active));
}

function applyZoom() {
  stage.style.transform = `scale(${zoom})`;
  stagewrap.style.width = `${STAGE.w * zoom}px`;
  stagewrap.style.height = `${STAGE.h * zoom}px`;
  document.getElementById('zoomval').textContent = `${Math.round(zoom * 100)}%`;
  document.getElementById('zoom').value = zoom;
}

function buildChips(branches) {
  branches.forEach((b, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<span>${b.label}</span><em>Save ${b.save}</em>`;
    chip.addEventListener('click', () => { active = i; showActive(); });
    chipsEl.appendChild(chip);
  });
}

// ---- drag (free-move) updates the shared position; delta is divided by zoom ----
function initDrag() {
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
  dragcatch.addEventListener('pointerdown', (e) => {
    if (!freeMove) return;
    dragging = true; sx = e.clientX; sy = e.clientY; ox = shared.x; oy = shared.y;
    dragcatch.setPointerCapture(e.pointerId);
  });
  dragcatch.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    shared.x = ox + (e.clientX - sx) / zoom;
    shared.y = oy + (e.clientY - sy) / zoom;
    applyShared();
  });
  const end = (e) => { if (dragging) { dragging = false; try { dragcatch.releasePointerCapture(e.pointerId); } catch {} } };
  dragcatch.addEventListener('pointerup', end);
  dragcatch.addEventListener('pointercancel', end);
}

function bindControls() {
  document.getElementById('prev').onclick = () => { active = (active - 1 + panels.length) % panels.length; showActive(); };
  document.getElementById('next').onclick = () => { active = (active + 1) % panels.length; showActive(); };
  document.getElementById('snap').onclick = () => { shared = { ...SNAP }; applyShared(); };
  document.getElementById('move').onchange = (e) => {
    freeMove = e.target.checked;
    dragcatch.hidden = !freeMove;
    stage.classList.toggle('is-move', freeMove);
  };
  document.getElementById('bg').onchange = (e) => panels.forEach((p) => setBg(p, e.target.checked ? 'reference' : 'current'));
  document.getElementById('text').onchange = (e) => panels.forEach((p) => setHideText(p, !e.target.checked));
  document.getElementById('zoom').oninput = (e) => { zoom = Number(e.target.value); applyZoom(); };
  document.getElementById('fs').onclick = () => toggleFullscreen(document.documentElement);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') document.getElementById('next').click();
    if (e.key === 'ArrowLeft') document.getElementById('prev').click();
  });
}

(async function main() {
  const branches = await loadBranches();
  buildChips(branches);
  panels = branches.map((b) => {
    const h = createPanel(b);
    h.hideText = true;                 // text hidden by default
    const prev = h.onReady;
    h.onReady = (x) => { prev && prev(x); applyCtl(x); };
    stage.appendChild(h.iframe);
    return h;
  });
  // fit zoom to the available area
  zoom = Math.max(0.3, fitScale(window.innerWidth - 40, window.innerHeight - 160));
  applyZoom();
  showActive();
  applyShared();
  initDrag();
  bindControls();
  window.addEventListener('resize', () => {
    if (Number(document.getElementById('zoom').value) === zoom) {
      zoom = Math.max(0.3, fitScale(window.innerWidth - 40, window.innerHeight - 160));
      applyZoom();
    }
  });
})();
