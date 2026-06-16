import type { MaterialFieldBase } from './MaterialSettingControl';

export function orderedSections<T extends { section: string }>(
  fields: T[],
  order: readonly string[],
): string[] {
  const present = new Set(fields.map((field) => field.section));
  return order.filter((section) => present.has(section));
}

export function sectionFieldCount<T extends { section: string }>(fields: T[], section: string) {
  return fields.filter((field) => field.section === section).length;
}

export function filterFieldsWhen<
  T extends MaterialFieldBase & { when?: (settings: Record<string, unknown>) => boolean },
>(fields: T[], settings: Record<string, unknown>): T[] {
  return fields.filter((field) => !field.when || field.when(settings));
}
