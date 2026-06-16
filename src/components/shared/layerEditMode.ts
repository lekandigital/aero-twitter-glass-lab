import type { MaterialFieldBase } from './MaterialSettingControl';
import { orderedSections } from './materialSettingGroups';

export type LayerEditMode = 'both' | 'layerA' | 'layerB';

export const E3_SHARED_SECTIONS = ['Palette'] as const;

export const E4_SHARED_SECTIONS = ['Palette', 'Layer A · Bezel layout'] as const;

export function stripLayerSectionPrefix(section: string): string {
  return section.replace(/^Layer [AB] · /, '');
}

export function layerFieldSuffix(fieldId: string): string | null {
  if (fieldId.startsWith('layerA')) return fieldId.slice(6);
  if (fieldId.startsWith('layerB')) return fieldId.slice(6);
  return null;
}

export function isPairedLayerField(fieldId: string, allIds: ReadonlySet<string>): boolean {
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix) return false;
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
  const hasPair = allIds.has(`layerA${suffix}`) && allIds.has(`layerB${suffix}`);

  if (mode === 'layerA' && isB && hasPair) return false;
  if (mode === 'layerB' && isA && hasPair) return false;
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
      const suffix = field.id.slice(6);
      if (allIds.has(`layerA${suffix}`)) continue;
    }

    if (field.id.startsWith('layerA')) {
      const suffix = field.id.slice(6);
      if (allIds.has(`layerB${suffix}`)) {
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
    return settings[`layerB${suffix}`];
  }
  return settings[fieldId];
}

export function resolvePairedSuffix(fieldId: string, allIds: ReadonlySet<string>): string | null {
  const suffix = layerFieldSuffix(fieldId);
  if (!suffix || !isPairedLayerField(fieldId, allIds)) return null;
  return suffix;
}
