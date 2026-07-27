export type DragPoint = { x: number; y: number };

const STORAGE_PREFIX = 'drag-position:';

function storageKey(id: string) {
  return `${STORAGE_PREFIX}${id}`;
}

export function loadDragPosition(id: string): DragPoint | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DragPoint;
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveDragPosition(id: string, position: DragPoint) {
  localStorage.setItem(storageKey(id), JSON.stringify(position));
}

export function clearDragPosition(id: string) {
  localStorage.removeItem(storageKey(id));
}

/**
 * Clears `id` together with every key it namespaces (`id:...`).
 *
 * Layer C stores one position per mounted reference object, so resetting layout
 * positions has to sweep the whole namespace rather than the bare key.
 */
export function clearDragPositionNamespace(id: string) {
  clearDragPosition(id);
  const prefix = storageKey(`${id}:`);
  try {
    const matches: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(prefix)) matches.push(key);
    }
    for (const key of matches) localStorage.removeItem(key);
  } catch {
    // Storage unavailable — nothing to sweep.
  }
}
