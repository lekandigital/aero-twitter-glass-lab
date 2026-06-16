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
