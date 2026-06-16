import { useCallback, useState } from 'react';

export function useFoldableSections(sectionIds: string[], defaultOpen = false) {
  const [openSections, setOpenSections] = useState<Set<string> | null>(null);

  const seed = useCallback(() => new Set(defaultOpen ? sectionIds : []), [defaultOpen, sectionIds]);

  const isOpen = useCallback(
    (id: string) => (openSections === null ? defaultOpen : openSections.has(id)),
    [defaultOpen, openSections],
  );

  const toggle = useCallback(
    (id: string) => {
      setOpenSections((prev) => {
        const base = prev ?? seed();
        const next = new Set(base);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [seed],
  );

  const ensureOpen = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setOpenSections((prev) => {
        const base = prev ?? seed();
        const next = new Set(base);
        for (const id of ids) next.add(id);
        return next;
      });
    },
    [seed],
  );

  const openAll = useCallback(() => setOpenSections(new Set(sectionIds)), [sectionIds]);

  const collapseAll = useCallback(() => setOpenSections(new Set()), []);

  return { isOpen, toggle, ensureOpen, openAll, collapseAll };
}
