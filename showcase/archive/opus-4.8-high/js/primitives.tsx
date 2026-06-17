import { useRef, type ReactNode } from 'react';
import { e2InspectAttrs } from './materialSettings';
import { useHoldDrag } from '../shared/useHoldDrag';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';

type SheetContentProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
};

function SheetContent({ eyebrow, title, subtitle, body }: SheetContentProps) {
  return (
    <>
      <p className="experiment-one-panel__eyebrow">{eyebrow}</p>
      <h2 className="experiment-one-panel__title">{title}</h2>
      <p className="experiment-one-panel__subtitle">{subtitle}</p>
      <p className="experiment-one-panel__body">{body}</p>
      <p className="experiment-one-panel__drag-hint">Hold and drag · click to inspect</p>
    </>
  );
}

/** Super-transparent bezel-less sheet */
export function ExperimentTwoTransparentSheet() {
  return (
    <div
      className="experiment-two-sheet experiment-two-sheet--transparent"
      role="region"
      aria-label="Experiment Two transparent sheet"
      {...e2InspectAttrs('trans-sheet')}
    >
      <span className="experiment-two-sheet__shine" aria-hidden="true" {...e2InspectAttrs('trans-shine')} />
      <div className="experiment-two-sheet__content">
        <SheetContent
          eyebrow="No bezel"
          title="Transparent sheet"
          subtitle="Experiment Two · layer A"
          body="Border, shine, and depth — ultra see-through, no rim or inner lip."
        />
      </div>
    </div>
  );
}

/** Frosted bezel-less sheet — drag on top of the transparent sheet */
export function ExperimentTwoFrostSheet() {
  return (
    <div
      className="experiment-two-sheet experiment-two-sheet--frost"
      role="region"
      aria-label="Experiment Two frost sheet"
      {...e2InspectAttrs('frost-sheet')}
    >
      <GlassFrostSurface />
      <span className="experiment-two-sheet__shine" aria-hidden="true" {...e2InspectAttrs('frost-shine')} />
      <div className="experiment-two-sheet__content">
        <SheetContent
          eyebrow="No bezel"
          title="Frost sheet"
          subtitle="Experiment Two · layer B"
          body="Heavier frost and fill — place this on top of the transparent sheet yourself."
        />
      </div>
    </div>
  );
}

type DraggableShellProps = {
  children: ReactNode;
  className?: string;
  dragHandleSelector?: string;
  dragExcludeSelector?: string;
  initialPosition?: { x: number; y: number } | 'center';
  bounds?: 'parent' | 'viewport';
  persistKey?: string;
  layoutResetVersion?: number;
  ariaLabel: string;
};

export function ExperimentSetTwoDraggableShell({
  children,
  className = '',
  dragHandleSelector,
  dragExcludeSelector,
  initialPosition = 'center',
  bounds = 'parent',
  persistKey,
  layoutResetVersion = 0,
  ariaLabel,
}: DraggableShellProps) {
  const boundsRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const { position, dragging, onPointerDown, onPointerMove, endDrag } = useHoldDrag({
    shellRef,
    boundsRef,
    dragHandleSelector,
    dragExcludeSelector,
    initialPosition,
    bounds,
    persistKey,
    layoutResetVersion,
  });

  const isFixed = bounds === 'viewport';

  return (
    <div
      ref={boundsRef}
      className={isFixed ? 'experiment-set-two-drag-bounds--viewport' : 'experiment-set-two-drag-bounds'}
      aria-hidden={isFixed}
    >
      <div
        ref={shellRef}
        className={`experiment-set-two-draggable${dragging ? ' experiment-set-two-draggable--active' : ''} ${className}`.trim()}
        style={
          position
            ? isFixed
              ? { left: position.x, top: position.y }
              : { transform: `translate(${position.x}px, ${position.y}px)` }
            : { visibility: 'hidden' }
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="application"
        aria-label={ariaLabel}
        aria-roledescription="draggable"
      >
        {children}
      </div>
    </div>
  );
}

export function ExperimentTwoDraggableSheet({
  children,
  initialPosition = 'center',
  raised = false,
  ariaLabel,
  persistKey,
  layoutResetVersion = 0,
}: {
  children: ReactNode;
  initialPosition?: { x: number; y: number } | 'center';
  raised?: boolean;
  ariaLabel: string;
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  return (
    <div className={`experiment-set-one-stage__slot${raised ? ' experiment-set-one-stage__slot--raised' : ''}`}>
      <ExperimentSetTwoDraggableShell
        initialPosition={initialPosition}
        ariaLabel={ariaLabel}
        persistKey={persistKey}
        layoutResetVersion={layoutResetVersion}
      >
        {children}
      </ExperimentSetTwoDraggableShell>
    </div>
  );
}
