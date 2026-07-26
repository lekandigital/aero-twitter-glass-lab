/**
 * Live geometry for every stage layer, gathered at export time.
 *
 * Every value here is read from the layer's own state — never derived from a
 * sibling layer, never recomputed from defaults. Width/height/radius come from
 * the settings object that drives that layer; X/Y come from the drag store the
 * layer persists to, falling back to the layer's own mounted element when it
 * has not been dragged yet.
 */
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import type { E6LayerCLayoutSettings } from '../experiment-set-six/layerCMaterialSettings';
import type { ExperimentElevenLayerCLayoutSettings } from './experimentElevenLayerCMaterial';
import { EXPERIMENT_SET_ONE_POSITION_KEYS, loadDragPosition } from './dragPositions';
import type { ExperimentId } from './experimentVisibility';

export type ExperimentSetOneLayerGeometry = {
  /** Section label the layer already uses in the export, e.g. 'Layer A'. */
  label: string;
  /** Field-id prefix for the `(id)` column, e.g. 'layerA'. */
  idPrefix: string;
  width: number;
  height: number;
  cornerRadius: number;
  x: number;
  y: number;
  /**
   * True when the layer already has field-driven Layout/Shape sections in the
   * export (layers A and B). Those only gain the X/Y lines; layers without
   * fields get a full section block written for them.
   */
  hasFieldSections: boolean;
};

/** Which drag key each layer persists to, per experiment. */
const POSITION_KEYS: Partial<Record<ExperimentId, { a: string; b: string; c?: string }>> = {
  four: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4 },
  five: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4 },
  six: {
    a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4,
    b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4,
    c: EXPERIMENT_SET_ONE_POSITION_KEYS.layerC6,
  },
  seven: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4 },
  eight: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4 },
  nine: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4 },
  ten: { a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA10, b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB10 },
  eleven: {
    a: EXPERIMENT_SET_ONE_POSITION_KEYS.layerA11,
    b: EXPERIMENT_SET_ONE_POSITION_KEYS.layerB11,
    c: EXPERIMENT_SET_ONE_POSITION_KEYS.layerC11,
  },
};

/**
 * The mounted element for each layer. Every selector is scoped to the stage
 * canvas — the dock renders miniature previews of these same layers for its
 * save chips, and an unscoped query matches those first.
 */
const STAGE = '.experiment-set-one-stage__canvas';
const LAYER_SELECTORS = {
  a: `${STAGE} .experiment-four-layer-a`,
  b: `${STAGE} .experiment-four-layer-b:not(.experiment-six-layer-c):not(.experiment-eleven-layer-c)`,
  c6: `${STAGE} .experiment-six-layer-c`,
  c11: `${STAGE} .experiment-eleven-layer-c`,
} as const;

/**
 * Where a layer actually sits, in the coordinate space of the draggable shell
 * that carries it. A top-level layer owns its shell, so this is its drag
 * position; a nested layer (layer B inside layer A's bezel inset) shares that
 * shell and contributes its own offset within it — which is its own value, not
 * a copy of the parent's.
 */
function readPosition(selector: string): { x: number; y: number } | null {
  if (typeof document === 'undefined') return null;
  const el = document.querySelector<HTMLElement>(selector);
  const shell = el?.closest<HTMLElement>('.experiment-set-two-draggable');
  if (!el || !shell) return null;
  const shellRect = shell.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  // The stage canvas is scaled by the camera, so rect deltas are in scaled
  // pixels; offsetWidth is the unscaled layout width, and their ratio undoes it.
  const scale = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(shell).transform);
  const within = scale > 0 ? { x: (rect.left - shellRect.left) / scale, y: (rect.top - shellRect.top) / scale } : { x: 0, y: 0 };
  return { x: Math.round(matrix.m41 + within.x), y: Math.round(matrix.m42 + within.y) };
}

function layerAB(
  prefix: 'layerA' | 'layerB',
  label: string,
  material: E4MaterialSettings,
  selector: string,
): ExperimentSetOneLayerGeometry | null {
  const position = readPosition(selector);
  if (!position) return null;
  return {
    label,
    idPrefix: prefix,
    width: material[`${prefix}Width`] as number,
    height: material[`${prefix}Height`] as number,
    cornerRadius: material[`${prefix}CornerRadius`] as number,
    x: position.x,
    y: position.y,
    hasFieldSections: true,
  };
}

/**
 * Collect geometry for the layers the active experiment actually has on stage.
 * Layers that are not mounted are omitted rather than guessed at.
 */
export function collectExperimentSetOneLayerGeometry(
  activeExperiment: ExperimentId,
  material: E4MaterialSettings,
  e6LayerC: E6LayerCLayoutSettings,
  e11LayerCLayout: ExperimentElevenLayerCLayoutSettings,
): ExperimentSetOneLayerGeometry[] {
  const keys = POSITION_KEYS[activeExperiment];
  const layers: ExperimentSetOneLayerGeometry[] = [];

  const a = layerAB('layerA', 'Layer A', material, LAYER_SELECTORS.a);
  if (a) layers.push(a);
  const b = layerAB('layerB', 'Layer B', material, LAYER_SELECTORS.b);
  if (b) layers.push(b);

  if (activeExperiment === 'six' && document.querySelector(LAYER_SELECTORS.c6)) {
    // Experiment Six exposes layer C's offsets as dock controls, so those are
    // the interface values until a drag replaces them in the position store.
    const stored = keys?.c ? loadDragPosition(keys.c) : null;
    layers.push({
      label: 'Layer C',
      idPrefix: 'layerC',
      width: e6LayerC.width,
      height: e6LayerC.height,
      cornerRadius: e6LayerC.radius,
      x: stored ? Math.round(stored.x) : e6LayerC.offsetX,
      y: stored ? Math.round(stored.y) : e6LayerC.offsetY,
      hasFieldSections: false,
    });
  }

  if (activeExperiment === 'eleven') {
    // Experiment Eleven has no offset controls for layer C; it is a draggable
    // pane portalled into layer A's bezel inset, so the live element is the
    // only place its current position exists.
    const position = readPosition(LAYER_SELECTORS.c11);
    if (position) {
      layers.push({
        label: 'Layer C',
        idPrefix: 'layerC',
        width: e11LayerCLayout.width,
        height: e11LayerCLayout.height,
        cornerRadius: e11LayerCLayout.radius,
        x: position.x,
        y: position.y,
        hasFieldSections: false,
      });
    }
  }

  return layers;
}
