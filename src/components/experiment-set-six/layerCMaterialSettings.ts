import type { CSSProperties } from 'react';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import type { MaterialFieldBase } from '../shared/MaterialSettingControl';

export type E6LayerCInspectTarget = 'layer-c';

export type E6LayerCLayoutSettings = {
  /** Panel width in px. */
  width: number;
  /** Panel height in px. */
  height: number;
  /** Corner radius in px. */
  radius: number;
  /** Default X within nested B inset (drag persist overrides). */
  offsetX: number;
  /** Default Y within nested B inset (drag persist overrides). */
  offsetY: number;
};

export function experimentSixLayerCMaxWidth(s: E4MaterialSettings): number {
  return s.layerBWidth as number;
}

export function experimentSixLayerCMaxHeight(s: E4MaterialSettings): number {
  return s.layerBHeight as number;
}

export function buildE6LayerCLayoutDefaults(s: E4MaterialSettings): E6LayerCLayoutSettings {
  const width = Math.min(72, experimentSixLayerCMaxWidth(s));
  const height = Math.min(72, experimentSixLayerCMaxHeight(s));
  return experimentSixLayerCLayoutCentered(s, width, height);
}

export function experimentSixLayerCLayoutCentered(
  s: E4MaterialSettings,
  width: number,
  height: number,
): E6LayerCLayoutSettings {
  const layerBWidth = s.layerBWidth as number;
  const layerBHeight = s.layerBHeight as number;
  const w = Math.min(width, experimentSixLayerCMaxWidth(s));
  const h = Math.min(height, experimentSixLayerCMaxHeight(s));
  return {
    width: w,
    height: h,
    radius: Math.max(0, Math.round(Math.min(w, h) / 2)),
    offsetX: Math.max(0, Math.round((layerBWidth - w) / 2)),
    offsetY: Math.max(0, Math.round((layerBHeight - h) / 2)),
  };
}

export function clampE6LayerCLayout(
  layout: E6LayerCLayoutSettings,
  s: E4MaterialSettings,
): E6LayerCLayoutSettings {
  const width = Math.min(Math.max(16, layout.width), experimentSixLayerCMaxWidth(s));
  const height = Math.min(Math.max(16, layout.height), experimentSixLayerCMaxHeight(s));
  const radiusMax = Math.max(0, Math.floor(Math.min(width, height) / 2));
  const radius = Math.min(Math.max(0, layout.radius), radiusMax);
  const maxX = Math.max(0, (s.layerBWidth as number) - width);
  const maxY = Math.max(0, (s.layerBHeight as number) - height);
  return {
    width,
    height,
    radius,
    offsetX: Math.min(Math.max(0, layout.offsetX), maxX),
    offsetY: Math.min(Math.max(0, layout.offsetY), maxY),
  };
}

/** Layout-only; branch save materials come from page CSS vars on e6. */
export function experimentSixLayerCPanelStyle(
  layout: E6LayerCLayoutSettings,
  s: E4MaterialSettings,
): CSSProperties {
  const { width, height, radius } = clampE6LayerCLayout(layout, s);
  return {
    width,
    height,
    minWidth: width,
    minHeight: height,
    borderRadius: `${radius}px`,
    ['--e4-layerB-width' as string]: `${width}px`,
    ['--e4-layerB-height' as string]: `${height}px`,
    ['--e4-layerB-radius' as string]: `${radius}px`,
  };
}

export function experimentSixLayerCDefaultOffset(
  layout: E6LayerCLayoutSettings,
  s: E4MaterialSettings,
): { x: number; y: number } {
  const clamped = clampE6LayerCLayout(layout, s);
  return { x: clamped.offsetX, y: clamped.offsetY };
}

export const E6_LAYER_C_INSPECT_CATALOG: Record<E6LayerCInspectTarget, { label: string }> = {
  'layer-c': { label: 'Layer C · panel' },
};

export function isE6LayerCInspectTarget(value: string): value is E6LayerCInspectTarget {
  return value in E6_LAYER_C_INSPECT_CATALOG;
}

export function e6LayerCInspectAttrs(
  target: E6LayerCInspectTarget,
  label?: string,
  experiment?: 'six' | 'eight' | 'eleven',
) {
  return {
    'data-e6-inspect': target,
    'data-e6-inspect-label': label ?? E6_LAYER_C_INSPECT_CATALOG[target].label,
    'data-e6-inspect-experiment': experiment,
  };
}

export type E6LayerCLayoutField = MaterialFieldBase<keyof E6LayerCLayoutSettings>;

export const E6_LAYER_C_LAYOUT_SECTION = 'Layer C · Layout';

/** Layer B rect fields replaced by panel layout when editing layer C. */
export const E6_LAYER_B_RECT_LAYOUT_SHAPE_IDS = [
  'layerBWidth',
  'layerBHeight',
  'layerBCornerRadius',
] as const;

export const E6_LAYER_C_LAYOUT_FIELDS: E6LayerCLayoutField[] = [
  {
    id: 'width',
    label: 'Width',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 16,
    max: 400,
    step: 1,
    unit: 'px',
    hint: 'Panel width — replaces layer B width in Layer C edit mode.',
  },
  {
    id: 'height',
    label: 'Height',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 16,
    max: 400,
    step: 1,
    unit: 'px',
    hint: 'Panel height — replaces layer B height in Layer C edit mode.',
  },
  {
    id: 'radius',
    label: 'Radius',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 0,
    max: 200,
    step: 1,
    unit: 'px',
    hint: 'Corner radius for the Layer C panel.',
  },
  {
    id: 'offsetX',
    label: 'Inset X',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 0,
    max: 400,
    step: 1,
    unit: 'px',
    hint: 'Default horizontal position inside layer B. Drag on stage overrides until layout reset.',
  },
  {
    id: 'offsetY',
    label: 'Inset Y',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 0,
    max: 400,
    step: 1,
    unit: 'px',
    hint: 'Default vertical position inside layer B. Drag on stage overrides until layout reset.',
  },
];

export function transformE6FieldsForLayerC<T extends { id: string; section?: string }>(
  fields: T[],
  layoutFields: E6LayerCLayoutField[],
): Array<T | E6LayerCLayoutField> {
  const rectIds = new Set<string>(E6_LAYER_B_RECT_LAYOUT_SHAPE_IDS);
  const filtered = fields.filter((field) => !rectIds.has(field.id));
  const layoutIndex = filtered.findIndex((field) => field.section === 'Layer B · Layout');
  const merged: Array<T | E6LayerCLayoutField> =
    layoutIndex === -1
      ? [...filtered, ...layoutFields]
      : [
          ...filtered.slice(0, layoutIndex),
          ...layoutFields,
          ...filtered.slice(layoutIndex).filter((field) => field.section !== 'Layer B · Shape'),
        ];
  return renameLayerBSectionsToLayerC(
    merged as Array<(T & { section: string }) | E6LayerCLayoutField>,
  ) as Array<T | E6LayerCLayoutField>;
}

export function renameLayerBSectionsToLayerC<T extends { section: string }>(fields: T[]): T[] {
  return fields.map((field) =>
    field.section.startsWith('Layer B · ')
      ? { ...field, section: field.section.replace(/^Layer B · /, 'Layer C · ') as T['section'] }
      : field,
  );
}

export function e6SectionOrderForLayerC(baseOrder: readonly string[]): string[] {
  const out: string[] = [];
  for (const section of baseOrder) {
    if (section.startsWith('Layer A · ')) continue;
    if (section === 'Layer B · Layout') {
      out.push(E6_LAYER_C_LAYOUT_SECTION);
      continue;
    }
    if (section === 'Layer B · Shape') continue;
    if (section.startsWith('Layer B · ')) {
      out.push(section.replace(/^Layer B · /, 'Layer C · '));
      continue;
    }
    out.push(section);
  }
  return out;
}

export function e6LayerCLayoutHighlight(): Set<keyof E6LayerCLayoutSettings> {
  return new Set(['width', 'height', 'radius', 'offsetX', 'offsetY']);
}

export function normalizeE6LayerCLayout(
  raw: Partial<E6LayerCLayoutSettings> & { diameter?: number },
  s: E4MaterialSettings,
): E6LayerCLayoutSettings {
  const diameter = typeof raw.diameter === 'number' ? raw.diameter : undefined;
  const width = typeof raw.width === 'number' ? raw.width : diameter;
  const height = typeof raw.height === 'number' ? raw.height : diameter;
  const radius = typeof raw.radius === 'number'
    ? raw.radius
    : diameter !== undefined
      ? Math.max(0, Math.round(diameter / 2))
      : undefined;
  return clampE6LayerCLayout(
    {
      width: width ?? Math.min(72, experimentSixLayerCMaxWidth(s)),
      height: height ?? Math.min(72, experimentSixLayerCMaxHeight(s)),
      radius: radius ?? 0,
      offsetX: typeof raw.offsetX === 'number' ? raw.offsetX : 0,
      offsetY: typeof raw.offsetY === 'number' ? raw.offsetY : 0,
    },
    s,
  );
}
