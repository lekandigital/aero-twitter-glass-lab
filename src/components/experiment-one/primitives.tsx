import {
  useRef,
  type ReactNode,
} from 'react';
import { e1InspectAttrs } from './materialSettings';
import { useHoldDrag } from '../shared/useHoldDrag';

/** Main centerpiece glass panel — layered material study */
export function ExperimentOneGlassPanel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`experiment-one-panel ${className}`.trim()}
      role="region"
      aria-label="Glass surface material study"
      {...e1InspectAttrs('panel')}
    >
      <span className="experiment-one-panel__rim" aria-hidden="true" {...e1InspectAttrs('panel-rim')} />
      <span className="experiment-one-panel__bevel" aria-hidden="true" {...e1InspectAttrs('panel-bevel')} />
      <span className="experiment-one-panel__shine" aria-hidden="true" {...e1InspectAttrs('panel-shine')} />
      <span className="experiment-one-panel__refraction" aria-hidden="true" {...e1InspectAttrs('panel-refraction')} />
      <span className="experiment-one-panel__sparkle experiment-one-panel__sparkle--a" aria-hidden="true" {...e1InspectAttrs('panel-sparkle')} />
      <span className="experiment-one-panel__sparkle experiment-one-panel__sparkle--b" aria-hidden="true" {...e1InspectAttrs('panel-sparkle')} />
      <span className="experiment-one-panel__sparkle experiment-one-panel__sparkle--c" aria-hidden="true" {...e1InspectAttrs('panel-sparkle')} />
      <div className="experiment-one-panel__content">{children}</div>
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

/** Draggable shell — panel or settings dock */
export function ExperimentOneDraggableShell({
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
      className={isFixed ? 'experiment-one-drag-bounds--viewport' : 'experiment-one-drag-bounds'}
      aria-hidden={isFixed}
    >
      <div
        ref={shellRef}
        className={`experiment-one-draggable${dragging ? ' experiment-one-draggable--active' : ''} ${className}`.trim()}
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

/** Drag wrapper for the main glass panel */
export function ExperimentOneDraggablePanel({
  children,
  initialPosition = 'center',
  persistKey,
  layoutResetVersion = 0,
}: {
  children: ReactNode;
  initialPosition?: { x: number; y: number } | 'center';
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  return (
    <div className="experiment-set-one-stage__slot">
      <ExperimentOneDraggableShell
        ariaLabel="Experiment One — draggable glass panel"
        initialPosition={initialPosition}
        persistKey={persistKey}
        layoutResetVersion={layoutResetVersion}
      >
        {children}
      </ExperimentOneDraggableShell>
    </div>
  );
}

/** Subtle SVG refraction filter (tuannm93 glass-refraction inspired) */
export function ExperimentOneRefractionFilterDefs() {
  return (
    <svg className="experiment-one-svg-filters" aria-hidden="true">
      <defs>
        <filter id="e1-glass-refract" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
