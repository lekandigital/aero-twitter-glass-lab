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
