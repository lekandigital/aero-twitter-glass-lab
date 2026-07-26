import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import { E1_SETTING_FIELDS, type E1MaterialSettings } from '../experiment-one/materialSettings';
import { E2_SETTING_FIELDS, type E2MaterialSettings } from '../experiment-set-two/materialSettings';
import { E3_SETTING_FIELDS, type E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { E4_SETTING_FIELDS, type E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { downloadTextFile } from '../../utils/downloadTextFile';
import type { ExperimentSetOneLayoutSnapshot } from './savedConfigs';
import type { ExperimentSetOneLayerGeometry } from './layerGeometry';

function formatValue(value: string | number | boolean) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/** `    Label (fieldId): value unit` — the one line shape the whole file uses. */
function settingLine(label: string, id: string, value: string | number | boolean, unit?: string) {
  return `    ${label} (${id}): ${formatValue(value)}${unit ? ` ${unit}` : ''}`;
}

/** X/Y for a layer, written into whichever section holds its width and height. */
function positionLines(layer: ExperimentSetOneLayerGeometry) {
  return [
    settingLine(`${layer.label} X position`, `${layer.idPrefix}X`, layer.x, 'px'),
    settingLine(`${layer.label} Y position`, `${layer.idPrefix}Y`, layer.y, 'px'),
  ];
}

/**
 * Full Layout + Shape block for a layer that has no setting fields of its own
 * (layer C), matching the section names and ordering layers A and B already use.
 */
function formatLayerGeometrySections(layer: ExperimentSetOneLayerGeometry) {
  return [
    `  ${layer.label} · Layout`,
    settingLine(`${layer.label} width`, `${layer.idPrefix}Width`, layer.width, 'px'),
    settingLine(`${layer.label} height`, `${layer.idPrefix}Height`, layer.height, 'px'),
    ...positionLines(layer),
    '',
    `  ${layer.label} · Shape`,
    settingLine('Corner radius', `${layer.idPrefix}CornerRadius`, layer.cornerRadius, 'px'),
    '',
  ];
}

function formatExperimentSection(
  title: string,
  settings: Record<string, string | number | boolean>,
  fields: MaterialFieldBase<string>[],
  layers: ExperimentSetOneLayerGeometry[] = [],
) {
  const lines: string[] = [`[${title}]`];
  const sections = [...new Set(fields.map((field) => field.section))];

  for (const section of sections) {
    lines.push(`  ${section}`);
    for (const field of fields.filter((f) => f.section === section)) {
      const value = settings[field.id];
      const unit = field.unit ? ` ${field.unit}` : '';
      lines.push(`    ${field.label} (${field.id}): ${formatValue(value)}${unit}`);
    }
    // Layers A and B already list width/height here from their fields; their
    // positions live outside the settings object, so they are appended to the
    // same section rather than given one of their own.
    const owner = layers.find((layer) => layer.hasFieldSections && section === `${layer.label} · Layout`);
    if (owner) lines.push(...positionLines(owner));
    lines.push('');
  }

  for (const layer of layers.filter((l) => !l.hasFieldSections)) {
    lines.push(...formatLayerGeometrySections(layer));
  }

  return lines.join('\n');
}

function formatLayoutSection(layout: ExperimentSetOneLayoutSnapshot) {
  const lines = ['[Layout]'];
  if (layout.activeExperiment) lines.push(`  Active experiment: ${layout.activeExperiment}`);
  if (layout.selectedExperimentIds?.length) {
    lines.push(`  Visible experiments: ${layout.selectedExperimentIds.join(', ')}`);
  }
  if (layout.selectedSaveKeysByExperiment && Object.keys(layout.selectedSaveKeysByExperiment).length > 0) {
    lines.push('  Selected saves by experiment:');
    for (const [experiment, keys] of Object.entries(layout.selectedSaveKeysByExperiment)) {
      if (!keys?.length) continue;
      lines.push(`    ${experiment}: ${keys.join(', ')}`);
    }
  }
  if (layout.selectedSaveVisualOrder?.length) {
    lines.push(`  Save order: ${layout.selectedSaveVisualOrder.join(' > ')}`);
  }
  if (layout.selectedSavePositions && Object.keys(layout.selectedSavePositions).length > 0) {
    lines.push('  Save positions:');
    for (const [key, position] of Object.entries(layout.selectedSavePositions)) {
      lines.push(`    ${key}: ${position.x}, ${position.y}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

export function buildExperimentSetOneConfigText(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
  layout?: ExperimentSetOneLayoutSnapshot,
  layers: ExperimentSetOneLayerGeometry[] = [],
) {
  const exportedAt = new Date().toISOString();
  const header = [
    'Experiment Set 1 — Material Configuration',
    `Exported: ${exportedAt}`,
    '',
    '---',
    '',
  ].join('\n');

  const body = [
    header,
    ...(layout ? [formatLayoutSection(layout), '---', ''] : []),
    formatExperimentSection('Experiment One', e1, E1_SETTING_FIELDS as MaterialFieldBase<string>[]),
    '---',
    '',
    formatExperimentSection('Experiment Two', e2, E2_SETTING_FIELDS as MaterialFieldBase<string>[]),
    '---',
    '',
    formatExperimentSection('Experiment Three', e3, E3_SETTING_FIELDS),
    '---',
    '',
    formatExperimentSection('Experiment Four', e4, E4_SETTING_FIELDS, layers),
  ].join('\n');

  return body;
}

export function downloadExperimentSetOneConfig(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
  layout?: ExperimentSetOneLayoutSnapshot,
  layers: ExperimentSetOneLayerGeometry[] = [],
) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `experiment-set-1-config-${stamp}.txt`;
  downloadTextFile(filename, buildExperimentSetOneConfigText(e1, e2, e3, e4, layout, layers));
}
