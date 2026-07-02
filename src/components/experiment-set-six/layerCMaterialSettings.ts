import type { CSSProperties } from 'react';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import type { MaterialFieldBase } from '../shared/MaterialSettingControl';

export type E6LayerCInspectTarget = 'layer-c';

export type E6LayerCLayoutSettings = {
  /** Circle diameter in px (width = height). */
  diameter: number;
  /** Default X within nested B inset (drag persist overrides). */
  offsetX: number;
  /** Default Y within nested B inset (drag persist overrides). */
  offsetY: number;
};

export function experimentSixLayerCMaxDiameter(s: E4MaterialSettings): number {
  return Math.min(s.layerBWidth as number, s.layerBHeight as number);
}

export function experimentSixLayerCDefaultDiameter(s: E4MaterialSettings): number {
  return Math.min(72, experimentSixLayerCMaxDiameter(s));
}

export function buildE6LayerCLayoutDefaults(s: E4MaterialSettings): E6LayerCLayoutSettings {
  const diameter = experimentSixLayerCDefaultDiameter(s);
  return experimentSixLayerCLayoutCentered(s, diameter);
}

export function experimentSixLayerCLayoutCentered(
  s: E4MaterialSettings,
  diameter: number,
): E6LayerCLayoutSettings {
  const layerBWidth = s.layerBWidth as number;
  const layerBHeight = s.layerBHeight as number;
  const d = Math.min(diameter, experimentSixLayerCMaxDiameter(s));
  return {
    diameter: d,
    offsetX: Math.max(0, Math.round((layerBWidth - d) / 2)),
    offsetY: Math.max(0, Math.round((layerBHeight - d) / 2)),
  };
}

export function clampE6LayerCLayout(
  layout: E6LayerCLayoutSettings,
  s: E4MaterialSettings,
): E6LayerCLayoutSettings {
  const maxD = experimentSixLayerCMaxDiameter(s);
  const diameter = Math.min(Math.max(16, layout.diameter), maxD);
  const maxX = Math.max(0, (s.layerBWidth as number) - diameter);
  const maxY = Math.max(0, (s.layerBHeight as number) - diameter);
  return {
    diameter,
    offsetX: Math.min(Math.max(0, layout.offsetX), maxX),
    offsetY: Math.min(Math.max(0, layout.offsetY), maxY),
  };
}

/** Layout-only; branch save materials come from page CSS vars on e6. */
export function experimentSixLayerCCircleStyle(
  layout: E6LayerCLayoutSettings,
  s: E4MaterialSettings,
): CSSProperties {
  const { diameter } = clampE6LayerCLayout(layout, s);
  const radius = diameter / 2;
  return {
    width: diameter,
    height: diameter,
    minHeight: diameter,
    borderRadius: '50%',
    ['--e4-layerB-width' as string]: `${diameter}px`,
    ['--e4-layerB-height' as string]: `${diameter}px`,
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
  'layer-c': { label: 'Layer C · circle' },
};

export function isE6LayerCInspectTarget(value: string): value is E6LayerCInspectTarget {
  return value in E6_LAYER_C_INSPECT_CATALOG;
}

export function e6LayerCInspectAttrs(target: E6LayerCInspectTarget, label?: string) {
  return {
    'data-e6-inspect': target,
    'data-e6-inspect-label': label ?? E6_LAYER_C_INSPECT_CATALOG[target].label,
  };
}

export type E6LayerCLayoutField = MaterialFieldBase<keyof E6LayerCLayoutSettings>;

export const E6_LAYER_C_LAYOUT_SECTION = 'Layer C · Layout';

/** Layer B rect fields replaced by circle layout when editing layer C. */
export const E6_LAYER_B_RECT_LAYOUT_SHAPE_IDS = [
  'layerBWidth',
  'layerBHeight',
  'layerBCornerRadius',
] as const;

export const E6_LAYER_C_LAYOUT_FIELDS: E6LayerCLayoutField[] = [
  {
    id: 'diameter',
    label: 'Diameter',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 16,
    max: 400,
    step: 1,
    hint: 'Circle size — replaces layer B width and height.',
  },
  {
    id: 'offsetX',
    label: 'Inset X',
    dataType: 'number',
    section: E6_LAYER_C_LAYOUT_SECTION,
    min: 0,
    max: 400,
    step: 1,
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
  return new Set(['diameter', 'offsetX', 'offsetY']);
}
