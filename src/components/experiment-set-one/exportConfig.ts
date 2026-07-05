import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import { E1_SETTING_FIELDS, type E1MaterialSettings } from '../experiment-one/materialSettings';
import { E2_SETTING_FIELDS, type E2MaterialSettings } from '../experiment-set-two/materialSettings';
import { E3_SETTING_FIELDS, type E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { E4_SETTING_FIELDS, type E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { downloadTextFile } from '../../utils/downloadTextFile';
import type { ExperimentSetOneLayoutSnapshot } from './savedConfigs';

function formatValue(value: string | number | boolean) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function formatExperimentSection(
  title: string,
  settings: Record<string, string | number | boolean>,
  fields: MaterialFieldBase<string>[],
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
    lines.push('');
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
    formatExperimentSection('Experiment Four', e4, E4_SETTING_FIELDS),
  ].join('\n');

  return body;
}

export function downloadExperimentSetOneConfig(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
  layout?: ExperimentSetOneLayoutSnapshot,
) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `experiment-set-1-config-${stamp}.txt`;
  downloadTextFile(filename, buildExperimentSetOneConfigText(e1, e2, e3, e4, layout));
}
