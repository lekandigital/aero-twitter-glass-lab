import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';
import { clearDragPosition, loadDragPosition, saveDragPosition, type DragPoint } from '../../utils/dragPositionStorage';

export type { DragPoint };

const DRAG_THRESHOLD_PX = 6;

type HoldDragState = {
  pending: boolean;
  active: boolean;
  dragged: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  pointerId: number;
};

type UseHoldDragOptions = {
  shellRef: RefObject<HTMLDivElement | null>;
  boundsRef: RefObject<HTMLElement | null>;
  dragHandleSelector?: string;
  dragExcludeSelector?: string;
  initialPosition?: DragPoint | 'center';
  bounds?: 'parent' | 'viewport';
  persistKey?: string;
  layoutResetVersion?: number;
};

function emptyDragState(): HoldDragState {
  return {
    pending: false,
    active: false,
    dragged: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: -1,
  };
}

/** Suppresses the next click after a hold-drag (e.g. inspect pickers). */
let suppressNextClick = false;

export function consumeClickAfterHoldDrag() {
  if (!suppressNextClick) return false;
  suppressNextClick = false;
  return true;
}

export function useHoldDrag({
  shellRef,
  boundsRef,
  dragHandleSelector,
  dragExcludeSelector,
  initialPosition = 'center',
  bounds = 'parent',
  persistKey,
  layoutResetVersion = 0,
}: UseHoldDragOptions) {
  const dragRef = useRef<HoldDragState>(emptyDragState());
  const initialPositionRef = useRef(initialPosition);
  const [position, setPosition] = useState<DragPoint | null>(null);
  const [dragging, setDragging] = useState(false);
  const initialized = useRef(false);
  const wasDraggingRef = useRef(false);
  const layoutResetRef = useRef(layoutResetVersion);

  if (!initialized.current) {
    initialPositionRef.current = initialPosition;
  }

  const getBounds = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return { maxX: 0, maxY: 0 };

    if (bounds === 'viewport') {
      return {
        maxX: Math.max(0, window.innerWidth - shell.offsetWidth),
        maxY: Math.max(0, window.innerHeight - shell.offsetHeight),
      };
    }

    const container = boundsRef.current;
    if (!container) return { maxX: 0, maxY: 0 };
    return {
      maxX: Math.max(0, container.clientWidth - shell.offsetWidth),
      maxY: Math.max(0, container.clientHeight - shell.offsetHeight),
    };
  }, [bounds, boundsRef, shellRef]);

  const clampPosition = useCallback(
    (x: number, y: number): DragPoint => {
      const { maxX, maxY } = getBounds();
      return {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY),
      };
    },
    [getBounds],
  );

  const placeInitial = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const stored = persistKey ? loadDragPosition(persistKey) : null;
    if (stored) {
      setPosition(clampPosition(stored.x, stored.y));
      initialized.current = true;
      return;
    }

    const init = initialPositionRef.current;
    if (typeof init === 'object') {
      setPosition(clampPosition(init.x, init.y));
      initialized.current = true;
      return;
    }

    const { maxX, maxY } = getBounds();
    setPosition({
      x: Math.max(0, maxX / 2),
      y: Math.max(0, maxY / 2),
    });
    initialized.current = true;
  }, [clampPosition, getBounds, persistKey, shellRef]);

  useEffect(() => {
    if (!initialized.current) placeInitial();
  }, [placeInitial]);

  useEffect(() => {
    if (layoutResetRef.current === layoutResetVersion) return;
    layoutResetRef.current = layoutResetVersion;
    if (layoutResetVersion === 0) return;

    if (persistKey) clearDragPosition(persistKey);
    initialized.current = false;
    placeInitial();
  }, [layoutResetVersion, persistKey, placeInitial]);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : prev));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampPosition]);

  useEffect(() => {
    if (wasDraggingRef.current && !dragging && persistKey && position) {
      saveDragPosition(persistKey, position);
    }
    wasDraggingRef.current = dragging;
  }, [dragging, persistKey, position]);

  const isDragTarget = useCallback(
    (target: HTMLElement) => {
      if (dragExcludeSelector && target.closest(dragExcludeSelector)) return false;
      if (dragHandleSelector && !target.closest(dragHandleSelector)) return false;
      return true;
    },
    [dragExcludeSelector, dragHandleSelector],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!isDragTarget(event.target as HTMLElement)) return;

    dragRef.current = {
      pending: true,
      active: false,
      dragged: false,
      startX: event.clientX,
      startY: event.clientY,
      originX: position?.x ?? 0,
      originY: position?.y ?? 0,
      pointerId: event.pointerId,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state.pending && !state.active) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (state.pending && !state.active) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;

      state.pending = false;
      state.active = true;
      state.dragged = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (state.active) {
      setPosition(
        clampPosition(state.originX + dx, state.originY + dy),
      );
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state.pending && !state.active) return;

    if (state.dragged) {
      suppressNextClick = true;
    }

    if (state.active) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = emptyDragState();
    setDragging(false);
  };

  return {
    position,
    dragging,
    onPointerDown,
    onPointerMove,
    endDrag,
    ready: initialized.current || position !== null,
  };
}
