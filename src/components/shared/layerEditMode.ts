import type { MaterialFieldBase } from './MaterialSettingControl';
import { orderedSections } from './materialSettingGroups';

export type LayerEditMode = 'both' | 'layerA' | 'layerB' | 'layerC';

export const E3_SHARED_SECTIONS = ['Palette'] as const;

export const E4_SHARED_SECTIONS = ['Palette', 'Layer A · Bezel layout'] as const;

export function stripLayerSectionPrefix(section: string): string {
  return section.replace(/^Layer [ABC] · /, '');
}

/** Stable foldable-section key across Both / Layer A / Layer B display names. */
export function canonicalSectionKey(section: string): string {
  return stripLayerSectionPrefix(section);
}

export function foldableSectionId(experimentKey: string, section: string): string {
  return `${experimentKey}-${canonicalSectionKey(section)}`;
}

export function foldableSectionDomId(experimentKey: string, section: string): string {
  return `${experimentKey}-${section}`;
}

export function layerFieldSuffix(fieldId: string): string | null {
  if (fieldId.startsWith('layerA')) return fieldId.slice(6);
  if (fieldId.startsWith('layerB')) return fieldId.slice(6);
  return null;
}

const LAYER_SIZE_SUFFIXES = new Set(['Width', 'Height']);

export function isIndependentLayerSizeField(fieldId: string): boolean {
  const suffix = layerFieldSuffix(fieldId);
  return suffix !== null && LAYER_SIZE_SUFFIXES.has(suffix);
}

export const LAYER_A_LAYOUT_FIELD_IDS = ['layerAWidth', 'layerAHeight'] as const;
export const LAYER_B_LAYOUT_FIELD_IDS = ['layerBWidth', 'layerBHeight'] as const;

export function layoutFieldIdsForMode(mode: LayerEditMode): readonly string[] {
  if (mode === 'layerA') return LAYER_A_LAYOUT_FIELD_IDS;
  if (mode === 'layerB' || mode === 'layerC') return LAYER_B_LAYOUT_FIELD_IDS;
  return [...LAYER_A_LAYOUT_FIELD_IDS, ...LAYER_B_LAYOUT_FIELD_IDS];
}

/** Keep width/height visible for the active layer edit mode while inspecting sub-targets. */
export function augmentFieldsWithLayerLayout<T extends { id: string }>(
  visible: T[],
  all: T[],
  mode: LayerEditMode,
): T[] {
  const ids = new Set(visible.map((field) => field.id));
  const out = [...visible];
  for (const id of layoutFieldIdsForMode(mode)) {
    if (ids.has(id)) continue;
    const field = all.find((candidate) => candidate.id === id);
    if (field) out.push(field);
  }
  return out;
}

export function isPairedLayerField(fieldId: string, allIds: ReadonlySet<string>): boolean {
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix || LAYER_SIZE_SUFFIXES.has(suffix)) return false;
  return allIds.has(`layerA${suffix}`) && allIds.has(`layerB${suffix}`);
}

export function pairedLayerFieldIds(suffix: string): { layerA: string; layerB: string } {
  return { layerA: `layerA${suffix}`, layerB: `layerB${suffix}` };
}

export function shouldShowFieldInLayerMode(
  fieldId: string,
  mode: LayerEditMode,
  allIds: ReadonlySet<string>,
): boolean {
  if (mode === 'both') return true;
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix) return true;

  const isA = fieldId.startsWith('layerA');
  const isB = fieldId.startsWith('layerB');
  const paired = isPairedLayerField(fieldId, allIds);

  if (mode === 'layerA' && isB && paired) return false;
  if (mode === 'layerA' && isB && isIndependentLayerSizeField(fieldId)) return false;
  if ((mode === 'layerB' || mode === 'layerC') && isA && paired) return false;
  if ((mode === 'layerB' || mode === 'layerC') && isA && isIndependentLayerSizeField(fieldId)) return false;
  if (mode === 'layerC' && isA && !isB) return false;
  return true;
}

function displaySectionForBothMode(section: string): string {
  return stripLayerSectionPrefix(section);
}

export function transformFieldsForLayerMode<T extends MaterialFieldBase>(
  fields: T[],
  mode: LayerEditMode,
): T[] {
  const allIds = new Set(fields.map((field) => field.id));

  if (mode !== 'both') {
    return fields.filter((field) => shouldShowFieldInLayerMode(field.id, mode, allIds));
  }

  const output: T[] = [];

  for (const field of fields) {
    if (field.id.startsWith('layerB')) {
      if (isPairedLayerField(field.id, allIds)) continue;
    }

    if (field.id.startsWith('layerA')) {
      if (isPairedLayerField(field.id, allIds)) {
        output.push({
          ...field,
          section: displaySectionForBothMode(field.section),
        });
        continue;
      }
    }

    output.push({
      ...field,
      section: displaySectionForBothMode(field.section),
    });
  }

  return output;
}

export function mergeSectionOrderForBothMode(order: readonly string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const section of order) {
    const display = stripLayerSectionPrefix(section);
    if (seen.has(display)) continue;
    seen.add(display);
    merged.push(display);
  }
  return merged;
}

export function sectionsForLayerMode<T extends MaterialFieldBase>(
  fields: T[],
  baseOrder: readonly string[],
  mode: LayerEditMode,
): string[] {
  const displayFields = transformFieldsForLayerMode(fields, mode);
  const order = mode === 'both' ? mergeSectionOrderForBothMode(baseOrder) : baseOrder;
  return orderedSections(displayFields, order);
}

export function layerPairValuesDiffer(
  settings: Record<string, unknown>,
  fieldId: string,
  allIds: ReadonlySet<string>,
): boolean {
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix || !isPairedLayerField(fieldId, allIds)) return false;
  const { layerA, layerB } = pairedLayerFieldIds(suffix);
  return settings[layerA] !== settings[layerB];
}

export function resolveFieldValueForLayerMode(
  settings: Record<string, unknown>,
  fieldId: string,
  mode: LayerEditMode,
): unknown {
  if (mode === 'layerB' && fieldId.startsWith('layerA')) {
    const suffix = fieldId.slice(6);
    if (isIndependentLayerSizeField(fieldId)) return settings[fieldId];
    return settings[`layerB${suffix}`];
  }
  if (mode === 'layerC' && fieldId.startsWith('layerA')) {
    const suffix = fieldId.slice(6);
    if (isIndependentLayerSizeField(fieldId)) return settings[fieldId];
    return settings[`layerB${suffix}`];
  }
  return settings[fieldId];
}

export function resolvePairedSuffix(fieldId: string, allIds: ReadonlySet<string>): string | null {
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix || !isPairedLayerField(fieldId, allIds)) return null;
  return suffix;
}
