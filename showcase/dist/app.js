/*
 * Experiment Five showcase — two modes:
 *   FOCUS: one branch, big and centred, switch via the rail; optional reference beside it;
 *          free-move (native drag → live-correct lighting); zoom; screenshot.
 *   GRID:  every branch (+ reference) as a tidy tile overview; click a tile → opens Focus.
 *
 * All panels are real builds in same-origin iframes, positioned NATIVELY at the snap point
 * (seeded at build time) so the edge-reflex lighting is correct. Each panel lives in a fixed
 * .card that we only ever transform (never reparent — that would reload the iframe).
 */
import {
  STAGE, loadBranches, createPanel, refreshReflex, setBg, setHideText,
  captureScreenshot, toggleFullscreen, REF_SRC,
} from './common.js';

const VIEW_W = STAGE.w, VIEW_H = STAGE.h;
const LABEL_H = 110, GAP = 28;

const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const railEl = document.getElementById('rail');
const ctlEl = document.getElementById('ctl');
const work = document.querySelector('.work');

let items = [];            // { el, view, handle?, kind:'panel'|'ref', label, save? }
let mode = 'focus';
let focusIndex = 0;
let freeMove = false, hideText = true, bgRef = false, zoom = 1;

function goFullscreen() { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); } catch {} }

const refItemIndex = () => items.length - 1;
const focused = () => items[focusIndex];

// ---------- build cards + rail ----------
function makeCard(kind, label, inner) {
  const el = document.createElement('div');
  el.className = `card card--${kind}`;
  const lab = document.createElement('div');
  lab.className = 'card__label';
  lab.textContent = label;
  const view = document.createElement('div');
  view.className = 'card__view';
  view.appendChild(inner);
  el.append(lab, view);
  el.classList.add('is-hidden');   // hidden via visibility (keeps layout so the panel's
  stage.appendChild(el);           // drag bounds measure correctly and snap isn't clamped to 0,0)
  return { el, view };
}

function build(branches) {
  items = branches.map((b, i) => {
    const h = createPanel(b);
    h.hideText = true;
    const { el, view } = makeCard('panel', `${b.label} · Save ${b.save}`, h.iframe);
    el.addEventListener('click', () => { if (mode === 'grid') focusItem(i, true); });   // grid tile -> fullscreen focus
    return { el, view, handle: h, kind: 'panel', label: b.label, save: b.save };
  });
  const img = document.createElement('img');
  img.src = REF_SRC; img.alt = 'Reference target'; img.className = 'ref-img';
  const { el, view } = makeCard('ref', 'Reference target', img);
  el.addEventListener('click', () => { if (mode === 'grid') focusItem(refItemIndex(), true); });
  items.push({ el, view, kind: 'ref', label: 'Reference' });

  buildRail();
}

function buildRail() {
  railEl.innerHTML = '';
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.className = 'railitem' + (it.kind === 'ref' ? ' railitem--ref' : '');
    b.innerHTML = it.kind === 'ref'
      ? `<span>Reference</span><em>target</em>`
      : `<span>${it.label}</span><em>Save ${it.save}</em>`;
    b.addEventListener('click', () => focusItem(i));
    railEl.appendChild(b);
  });
}

// ---------- layout ----------
function place(card, x, y, scale, withLabel) {
  card.el.classList.toggle('card--labelled', withLabel);
  card.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

function layout() {
  const W = stagewrap.clientWidth, H = stagewrap.clientHeight;
  if (mode === 'grid') {
    stagewrap.classList.add('is-grid');
    const cols = Math.max(2, Math.min(items.length, Math.floor((W - GAP) / (320 + GAP))));
    const tileW = (W - (cols + 1) * GAP) / cols;
    const scale = tileW / VIEW_W;
    const cardH = (VIEW_H + LABEL_H) * scale;
    items.forEach((it, i) => {
      it.el.classList.remove('is-hidden');
      it.el.style.pointerEvents = 'auto';
      const col = i % cols, row = Math.floor(i / cols);
      place(it, GAP + col * (tileW + GAP), GAP + row * (cardH + GAP), scale, true);
      if (it.handle) setTimeout(() => refreshReflex(it.handle), 90);
    });
    const rows = Math.ceil(items.length / cols);
    stage.style.height = `${GAP + rows * (cardH + GAP)}px`;
  } else {
    stagewrap.classList.remove('is-grid');
    stage.style.height = '100%';
    const f = focused();
    items.forEach((it) => { it.el.classList.add('is-hidden'); it.el.style.pointerEvents = 'none'; });
    const scale = Math.min(W * 0.94 / VIEW_W, H * 0.94 / VIEW_H) * zoom;
    f.el.classList.remove('is-hidden');
    f.el.style.pointerEvents = freeMove && f.kind === 'panel' ? 'auto' : 'none';
    place(f, (W - VIEW_W * scale) / 2, (H - VIEW_H * scale) / 2, scale, false);
    if (f.handle) setTimeout(() => refreshReflex(f.handle), 90);
  }
  updateRail();
}

function updateRail() {
  [...railEl.children].forEach((c, i) => c.classList.toggle('is-active', mode === 'focus' && i === focusIndex));
}

// ---------- modes ----------
function setMode(m) {
  mode = m;
  document.getElementById('mFocus').classList.toggle('is-active', m === 'focus');
  document.getElementById('mGrid').classList.toggle('is-active', m === 'grid');
  work.classList.toggle('is-grid', m === 'grid');
  buildCtl();
  layout();
}
function focusItem(i, fullscreen) { focusIndex = i; setMode('focus'); if (fullscreen) goFullscreen(); }

// ---------- context controls ----------
function buildCtl() {
  ctlEl.innerHTML = '';
  if (mode !== 'focus') return;
  const isPanel = focused().kind === 'panel';
  ctlEl.append(
    toggle('Free move', freeMove, (v) => { freeMove = v; layout(); }, !isPanel),
    toggle('Reference background', bgRef, (v) => { bgRef = v; items.forEach((it) => it.handle && setBg(it.handle, v ? 'reference' : 'current')); }, !isPanel),
    toggle('Text', !hideText, (v) => { hideText = !v; items.forEach((it) => it.handle && setHideText(it.handle, hideText)); }, !isPanel),
    zoomCtl(),
  );
}
function zoomCtl() {
  const w = document.createElement('label');
  w.className = 'zoom';
  w.innerHTML = `Zoom <input type="range" min="0.4" max="1.6" step="0.01" value="${zoom}">`;
  w.querySelector('input').oninput = (e) => { zoom = Number(e.target.value); layout(); };
  return w;
}
function toggle(label, checked, onchange, disabled) {
  const l = document.createElement('label');
  l.className = 'toggle' + (disabled ? ' is-disabled' : '');
  const i = document.createElement('input');
  i.type = 'checkbox'; i.checked = checked; i.disabled = !!disabled;
  i.onchange = () => onchange(i.checked);
  l.append(i, document.createTextNode(' ' + label));
  return l;
}

// ---------- boot ----------
(async function main() {
  const branches = await loadBranches();
  build(branches);
  document.getElementById('mFocus').onclick = () => setMode('focus');
  document.getElementById('mGrid').onclick = () => setMode('grid');
  document.getElementById('shot').onclick = () => captureScreenshot(`experiment-five-${mode}.png`);
  document.getElementById('full').onclick = () => toggleFullscreen(document.documentElement);
  window.addEventListener('resize', layout);
  window.addEventListener('keydown', (e) => {
    if (mode !== 'focus') return;
    if (e.key === 'ArrowRight') focusItem((focusIndex + 1) % items.length);
    if (e.key === 'ArrowLeft') focusItem((focusIndex - 1 + items.length) % items.length);
    if (e.key === 'g') setMode('grid');
  });
  setMode('focus');
})();
