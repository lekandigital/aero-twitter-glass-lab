import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import { E1_SETTING_FIELDS, type E1MaterialSettings } from '../experiment-one/materialSettings';
import { E2_SETTING_FIELDS, type E2MaterialSettings } from '../experiment-set-two/materialSettings';
import { E3_SETTING_FIELDS, type E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { E4_SETTING_FIELDS, type E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { downloadTextFile } from '../../utils/downloadTextFile';

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

export function buildExperimentSetOneConfigText(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
) {
  const exportedAt = new Date().toISOString();
  const header = [
    'Experiment Set 1 — Material Configuration',
    `Exported: ${exportedAt}`,
    '',
    '---',
    '',
  ].join('\n');

  return [
    header,
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
}

export function downloadExperimentSetOneConfig(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `experiment-set-1-config-${stamp}.txt`;
  downloadTextFile(filename, buildExperimentSetOneConfigText(e1, e2, e3, e4));
}
