/*
 * Shared multi-column board for Stage + Switcher.
 *
 * Each selected branch is a COLUMN: panel-over-background on top, the full reference image
 * stacked underneath (same width) for glance comparison. Columns sit side by side and the
 * whole board pans/zooms as one bound unit (every panel keeps the same x/y, A behind B on
 * top — they only move together). A "Reference only" toggle hides the branches and shows
 * the reference target alone. Screenshot saves the whole composited view.
 */
import {
  STAGE, loadBranches, createPanel, applyCtl, setHideText, setBg,
  toggleFullscreen, captureScreenshot, refreshReflex, REF_SRC,
} from './common.js';

const REF_W = 1440, REF_H = 961;            // reference.png drawn at column width
const COL_GAP = 64;

export async function initBoard({ big = false, mode = 'stage' } = {}) {
  const toolbar = document.getElementById('toolbar');
  const boardwrap = document.getElementById('boardwrap');
  const board = document.getElementById('board');
  const inner = document.getElementById('board-inner');
  const pan = document.getElementById('board-pan');

  const branches = await loadBranches();
  const panels = branches.map((b) => {
    const h = createPanel(b);
    h.hideText = true;
    const prev = h.onReady;
    h.onReady = (x) => { prev && prev(x); applyCtl(x); };
    return h;
  });

  // ---- state ----
  const selected = new Set(big ? [0] : [0, 1, 2]);
  let refOnly = false, showRefRow = true, hideText = true, bgRef = false;
  let zoom = big ? 0.42 : 0.3;
  let panX = 24, panY = 16;

  // ---- columns ----
  const cols = panels.map((h, i) => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `<div class="col__label">${h.branch.label} · Save ${h.branch.save}</div>`;
    const panelBox = document.createElement('div');
    panelBox.className = 'col__panel';
    panelBox.appendChild(h.iframe);
    const refBox = document.createElement('div');
    refBox.className = 'col__ref';
    refBox.innerHTML = `<div class="col__cap">reference</div><img src="${REF_SRC}" alt="reference" width="${REF_W}" height="${REF_H}">`;
    col.append(panelBox, refBox);
    col._ref = refBox;
    inner.appendChild(col);
    return col;
  });
  // reference-only column
  const refCol = document.createElement('div');
  refCol.className = 'col col--refonly';
  refCol.innerHTML = `<div class="col__label">Reference target</div><img src="${REF_SRC}" alt="reference" width="${STAGE.w}">`;
  inner.appendChild(refCol);

  function render() {
    cols.forEach((c, i) => {
      const vis = !refOnly && selected.has(i);
      if (vis !== c._vis) {
        c._vis = vis;
        c.style.display = vis ? 'flex' : 'none';
        if (vis) setTimeout(() => refreshReflex(panels[i]), 80);  // re-sample once visible
      }
      c._ref.style.display = showRefRow ? 'block' : 'none';
    });
    refCol.style.display = refOnly ? 'flex' : 'none';
    inner.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    [...toolbar.querySelectorAll('.chip')].forEach((c, i) => {
      if (i < panels.length) c.classList.toggle('is-active', !refOnly && selected.has(i));
    });
    const refChip = toolbar.querySelector('.chip--ref');
    if (refChip) refChip.classList.toggle('is-active', refOnly);
  }

  // ---- toolbar ----
  const chips = document.createElement('div');
  chips.className = 'tool-group';
  panels.forEach((h, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.innerHTML = `<span>${h.branch.label}</span><em>Save ${h.branch.save}</em>`;
    chip.onclick = () => {
      refOnly = false;
      if (selected.has(i)) { if (selected.size > 1) selected.delete(i); } else selected.add(i);
      render();
    };
    chips.appendChild(chip);
  });
  const refChip = document.createElement('button');
  refChip.className = 'chip chip--ref';
  refChip.innerHTML = `<span>Reference</span><em>only · hides others</em>`;
  refChip.onclick = () => { refOnly = !refOnly; render(); };   // hides the branches by default
  chips.appendChild(refChip);

  let freeMove = false;
  function setFreeMove(v) { freeMove = v; pan.style.display = v ? 'none' : 'block'; board.classList.toggle('is-free', v); }

  toolbar.append(chips, sep(),
    btn('⌂ Reset', () => { panX = 24; panY = 16; zoom = big ? 0.42 : 0.3; render(); syncZoom(); }),
    zoomCtl(), sep(),
    toggle('Free move panel', freeMove, setFreeMove),
    toggle('Reference row', showRefRow, (v) => { showRefRow = v; render(); }),
    toggle('Show text', !hideText, (v) => { hideText = !v; panels.forEach((p) => setHideText(p, hideText)); }),
    toggle('Reference bg', bgRef, (v) => { bgRef = v; panels.forEach((p) => setBg(p, v ? 'reference' : 'current')); }),
    sep(),
    btn('📷 Save screenshot', () => captureScreenshot(`experiment-five-${mode}.png`)),
    btn('⛶ Fullscreen', () => toggleFullscreen(document.documentElement)),
  );

  function zoomCtl() {
    const wrap = document.createElement('label');
    wrap.className = 'zoom';
    wrap.innerHTML = `Zoom <input type="range" min="0.1" max="1" step="0.01" value="${zoom}"> <span>${Math.round(zoom * 100)}%</span>`;
    const input = wrap.querySelector('input'), out = wrap.querySelector('span');
    input.oninput = () => { zoom = Number(input.value); out.textContent = `${Math.round(zoom * 100)}%`; render(); };
    wrap._sync = () => { input.value = zoom; out.textContent = `${Math.round(zoom * 100)}%`; };
    zoomCtl._el = wrap;
    return wrap;
  }
  function syncZoom() { zoomCtl._el && zoomCtl._el._sync(); }

  // ---- pan (drag anywhere on the board; everything moves together) ----
  let drag = null;
  pan.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, sy: e.clientY, px: panX, py: panY }; pan.setPointerCapture(e.pointerId); });
  pan.addEventListener('pointermove', (e) => { if (!drag) return; panX = drag.px + (e.clientX - drag.sx); panY = drag.py + (e.clientY - drag.sy); render(); });
  const endPan = (e) => { if (drag) { drag = null; try { pan.releasePointerCapture(e.pointerId); } catch {} } };
  pan.addEventListener('pointerup', endPan);
  pan.addEventListener('pointercancel', endPan);
  pan.addEventListener('wheel', (e) => {                 // ctrl/⌘+wheel = zoom, else pan
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom = Math.max(0.1, Math.min(1, zoom - e.deltaY * 0.001)); render(); syncZoom(); }
    else { panX -= e.deltaX; panY -= e.deltaY; render(); }
  }, { passive: false });

  render();
  void boardwrap; void COL_GAP;
}

function sep() { const s = document.createElement('div'); s.className = 'tool-sep'; return s; }
function btn(label, onclick) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = label; b.onclick = onclick; return b; }
function toggle(label, checked, onchange) {
  const l = document.createElement('label'); l.className = 'toggle';
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = checked;
  i.onchange = () => onchange(i.checked);
  l.append(i, document.createTextNode(' ' + label));
  return l;
}
