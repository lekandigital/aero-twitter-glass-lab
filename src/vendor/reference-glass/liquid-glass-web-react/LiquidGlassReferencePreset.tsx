import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { LiquidGlassEngine } from "./core/engine";
import type { LiquidGlassOptions } from "./core/types";
import {
  LiquidGlass,
  type LiquidGlassHandle,
} from "./react/LiquidGlass";
import "./reference-preset.css";

export type LiquidGlassReferenceInteraction =
  | "static"
  | "hero"
  | "reading"
  | "orbit"
  | "engine";

export type LiquidGlassReferenceBed =
  | "chart"
  | "hero"
  | "text"
  | "orbit"
  | "engine";

export interface LiquidGlassReferencePresetProps {
  /** A complete option object resolved against the source DEFAULT_OPTIONS. */
  options: LiquidGlassOptions;
  interaction: LiquidGlassReferenceInteraction;
  bed?: LiquidGlassReferenceBed;
  className?: string;
  style?: CSSProperties;
  /**
   * The source lens keeps `options.width` × `options.height`; these optional
   * values only provide a larger live DOM bed for source demos such as Orbit.
   */
  contextWidth?: number;
  contextHeight?: number;
  onMapGenerated?: (url: string) => void;
  /** Target-lab anchor used to route source pointer behavior without making the body portal interactive. */
  pointerTargetRef?: RefObject<HTMLElement | null>;
}

const READING_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 12px 30px rgba(0,0,0,0.6)";
const MOTION_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 14px 40px rgba(0,0,0,0.6)";
const HERO_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 18px 50px rgba(0,0,0,0.6)";

function resolveBed(
  bed: LiquidGlassReferenceBed | undefined,
  interaction: LiquidGlassReferenceInteraction,
): LiquidGlassReferenceBed {
  if (bed) return bed;
  if (interaction === "hero") return "hero";
  if (interaction === "reading") return "text";
  if (interaction === "orbit") return "orbit";
  if (interaction === "engine") return "engine";
  return "chart";
}

function ReferenceBed({ kind }: { kind: LiquidGlassReferenceBed }) {
  if (kind === "hero") {
    return (
      <div className="e11-liquid-web-reference__hero-bleed">
        <div className="e11-liquid-web-reference__hero-inner">
          <div className="e11-liquid-web-reference__hero-chips">
            <span className="e11-liquid-web-reference__hero-chip">
              <i className="e11-liquid-web-reference__hero-dot e11-liquid-web-reference__hero-dot--chrome" />{" "}
              Chrome
            </span>
            <span className="e11-liquid-web-reference__hero-chip">
              <i className="e11-liquid-web-reference__hero-dot e11-liquid-web-reference__hero-dot--safari" />{" "}
              Safari
            </span>
            <span className="e11-liquid-web-reference__hero-chip">
              <i className="e11-liquid-web-reference__hero-dot e11-liquid-web-reference__hero-dot--firefox" />{" "}
              Firefox
            </span>
            <span className="e11-liquid-web-reference__hero-chip-note">
              no flags · no fallbacks · ~5 kB
            </span>
          </div>

          <h1>
            liquid&#8209;glass&#8209;web&#8209;react
            <span>every knob, every trick, one page.</span>
          </h1>

          <p className="e11-liquid-web-reference__hero-lede">
            A real lens over live DOM: an SVG <code>feDisplacementMap</code>{" "}
            fed a displacement map the library computes on the fly. Text
            underneath stays selectable, buttons stay clickable, video keeps
            playing. Below: all eighteen options, the imperative handle, the
            framework&#8209;free engine, and the raw map itself — pulled apart
            channel by channel.
          </p>

          <div className="e11-liquid-web-reference__hero-cta">
            <code className="e11-liquid-web-reference__hero-install">
              npm install liquid-glass-web-react
            </code>
            <span className="e11-liquid-web-reference__hero-button">
              Play with it ↓
            </span>
          </div>

          <p className="e11-liquid-web-reference__hero-hint">
            ↑ that glass circle is draggable — throw it around the page
          </p>
        </div>
      </div>
    );
  }

  if (kind === "text") {
    return (
      <div className="e11-liquid-web-reference__bed e11-liquid-web-reference__bed--text">
        <p>
          Move the pointer across this paragraph. The lens follows it, and the
          text underneath is still text — <strong>select it</strong>, copy it,
          tab to <a href="#top">this link</a> and press enter. Nothing here is a
          screenshot; the filter bends the very pixels the browser painted for
          the DOM you are reading, which is why the selection highlight
          distorts along with the glyphs.
        </p>
      </div>
    );
  }

  if (kind === "orbit") {
    return (
      <div className="e11-liquid-web-reference__bed e11-liquid-web-reference__bed--chart e11-liquid-web-reference__bed--orbit">
        <p>
          setPosition(x, y) — 60 times a second, straight past React. The map
          is computed once and never touched again; the only thing changing is
          where the filter looks.
        </p>
      </div>
    );
  }

  if (kind === "engine") {
    return (
      <div className="e11-liquid-web-reference__bed e11-liquid-web-reference__bed--grid e11-liquid-web-reference__bed--engine">
        <h3>{"new LiquidGlassEngine({ container, filtered, defsHost })"}</h3>
        <p>Plain DOM. Zero dependencies. Drag me.</p>
      </div>
    );
  }

  return (
    <div
      className="e11-liquid-web-reference__bed e11-liquid-web-reference__bed--chart"
      aria-hidden
    />
  );
}

interface SharedSurfaceProps {
  options: LiquidGlassOptions;
  bed: LiquidGlassReferenceBed;
  contextWidth: number;
  contextHeight: number;
  onMapGenerated?: (url: string) => void;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}

function StaticSurface({
  options,
  bed,
  contextWidth,
  contextHeight,
  onMapGenerated,
}: SharedSurfaceProps) {
  return (
    <LiquidGlass
      {...options}
      shadow
      onMapGenerated={onMapGenerated}
      style={{ width: contextWidth, height: contextHeight }}
    >
      <ReferenceBed kind={bed} />
    </LiquidGlass>
  );
}

function HeroSurface({
  options,
  bed,
  contextWidth,
  contextHeight,
  onMapGenerated,
  pointerTargetRef,
}: SharedSurfaceProps) {
  const lens = useRef<LiquidGlassHandle>(null);
  const position = useRef({ x: 0.74, y: 0.62 });
  const size = options.width;
  const drag = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    rect: null as DOMRect | null,
  });
  const idle = useRef({
    stopped: false,
    raf: 0,
    velocityX: 0.03,
    velocityY: 0.024,
  });
  const dragRaf = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const gripRef = useRef<HTMLDivElement>(null);

  const place = (fractionX: number, fractionY: number) => {
    const element = lens.current?.element;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const half = size / 2;

    if (rect.width > size) {
      const margin = half / rect.width;
      fractionX = Math.min(1 - margin, Math.max(margin, fractionX));
    }
    if (rect.height > size) {
      const margin = half / rect.height;
      fractionY = Math.min(1 - margin, Math.max(margin, fractionY));
    }

    lens.current?.setPosition(fractionX, fractionY);
    position.current =
      lens.current?.engine?.getPosition() ?? {
        x: fractionX,
        y: fractionY,
      };

    const grip = gripRef.current;
    if (grip) {
      grip.style.transform = `translate(${
        position.current.x * rect.width - half
      }px, ${position.current.y * rect.height - half}px)`;
    }
  };

  useLayoutEffect(() => {
    place(position.current.x, position.current.y);
    const element = lens.current?.element;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      place(position.current.x, position.current.y);
    });
    observer.observe(element);
    return () => observer.disconnect();
    // The source GripLens deliberately re-places only when its lens size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    const state = idle.current;
    if (state.stopped) return;
    let last = performance.now();

    const tick = (now: number) => {
      if (state.stopped) return;
      const element = lens.current?.element;
      const delta = Math.min(50, now - last);
      last = now;

      if (element && !drag.current.active) {
        const rect = element.getBoundingClientRect();
        const half = size / 2;
        const minX = half;
        const maxX = rect.width - half;
        const minY = half;
        const maxY = rect.height - half;

        if (maxX > minX && maxY > minY) {
          let centerX =
            position.current.x * rect.width + state.velocityX * delta;
          let centerY =
            position.current.y * rect.height + state.velocityY * delta;

          if (centerX >= maxX) {
            centerX = maxX;
            state.velocityX = -Math.abs(state.velocityX);
          } else if (centerX <= minX) {
            centerX = minX;
            state.velocityX = Math.abs(state.velocityX);
          }

          if (centerY >= maxY) {
            centerY = maxY;
            state.velocityY = -Math.abs(state.velocityY);
          } else if (centerY <= minY) {
            centerY = minY;
            state.velocityY = Math.abs(state.velocityY);
          }

          place(centerX / rect.width, centerY / rect.height);
        }
      }

      state.raf = requestAnimationFrame(tick);
    };

    state.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    const anchor = pointerTargetRef?.current;
    const element = lens.current?.element;
    if (!anchor || !element) {
      return () => cancelAnimationFrame(dragRaf.current);
    }

    const pointerTarget =
      anchor.closest<HTMLElement>(".experiment-set-two-drag-bounds") ??
      anchor;
    const dragTarget = pointerTarget;

    const isInsideGrip = (event: PointerEvent, rect: DOMRect) => {
      const centerX = rect.left + position.current.x * rect.width;
      const centerY = rect.top + position.current.y * rect.height;
      const radiusX = (size / 2) * (rect.width / contextWidth);
      const radiusY = (size / 2) * (rect.height / contextHeight);
      const x = (event.clientX - centerX) / radiusX;
      const y = (event.clientY - centerY) / radiusY;
      return x * x + y * y <= 1;
    };

    const onDown = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!isInsideGrip(event, rect)) return;

      const state = idle.current;
      state.stopped = true;
      cancelAnimationFrame(state.raf);
      drag.current = {
        active: true,
        offsetX:
          (event.clientX - rect.left) / rect.width - position.current.x,
        offsetY:
          (event.clientY - rect.top) / rect.height - position.current.y,
        // The source context is stationary. Freeze this coordinate space so
        // the required outer Layer C drag cannot cancel the grip's motion.
        rect,
      };
      gripRef.current?.classList.add(
        "e11-liquid-web-reference__hero-grip--dragging",
      );
      event.preventDefault();
    };

    const onMove = (event: PointerEvent) => {
      const state = drag.current;
      if (!state.active || !state.rect) return;
      pending.current = {
        x:
          (event.clientX - state.rect.left) / state.rect.width -
          state.offsetX,
        y:
          (event.clientY - state.rect.top) / state.rect.height -
          state.offsetY,
      };

      if (!dragRaf.current) {
        dragRaf.current = requestAnimationFrame(() => {
          dragRaf.current = 0;
          const next = pending.current;
          if (next && drag.current.active) place(next.x, next.y);
        });
      }
    };

    const onUp = () => {
      drag.current.active = false;
      drag.current.rect = null;
      gripRef.current?.classList.remove(
        "e11-liquid-web-reference__hero-grip--dragging",
      );
    };

    pointerTarget.addEventListener("pointerdown", onDown);
    dragTarget.addEventListener("pointermove", onMove);
    dragTarget.addEventListener("pointerup", onUp);
    dragTarget.addEventListener("pointercancel", onUp);

    return () => {
      pointerTarget.removeEventListener("pointerdown", onDown);
      dragTarget.removeEventListener("pointermove", onMove);
      dragTarget.removeEventListener("pointerup", onUp);
      dragTarget.removeEventListener("pointercancel", onUp);
      cancelAnimationFrame(dragRaf.current);
      dragRaf.current = 0;
      pending.current = null;
      drag.current.active = false;
      drag.current.rect = null;
    };
    // The source GripLens intentionally keeps `place` imperative.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextHeight, contextWidth, pointerTargetRef, size]);

  return (
    <div className="e11-liquid-web-reference__hero">
      <LiquidGlass
        ref={lens}
        {...options}
        x={0.74}
        y={0.62}
        shadow={HERO_SHADOW}
        onMapGenerated={onMapGenerated}
        style={{ width: contextWidth, height: contextHeight }}
      >
        <ReferenceBed kind={bed} />
      </LiquidGlass>
      <div
        ref={gripRef}
        className="e11-liquid-web-reference__hero-grip"
        style={{
          width: size,
          height: size,
          borderRadius:
            options.radius === "auto" ? "50%" : options.radius,
        }}
        data-liquid-glass-hero-grip=""
        aria-hidden
      />
    </div>
  );
}

function ReadingSurface({
  options,
  bed,
  contextWidth,
  contextHeight,
  onMapGenerated,
  pointerTargetRef,
}: SharedSurfaceProps) {
  const lens = useRef<LiquidGlassHandle>(null);
  const raf = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);

  const moveAt = (clientX: number, clientY: number) => {
    const element = lens.current?.element;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    pending.current = {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const position = pending.current;
        if (position) lens.current?.setPosition(position.x, position.y);
      });
    }
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    moveAt(event.clientX, event.clientY);
  };

  useEffect(() => {
    const anchor = pointerTargetRef?.current;
    if (!anchor) return () => cancelAnimationFrame(raf.current);
    const target =
      anchor.closest<HTMLElement>(".experiment-set-two-drag-bounds") ??
      anchor;
    const handleMove = (event: PointerEvent) => moveAt(event.clientX, event.clientY);
    target.addEventListener("pointermove", handleMove);
    return () => {
      target.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(raf.current);
    };
  }, [pointerTargetRef]);

  return (
    <LiquidGlass
      ref={lens}
      {...options}
      shadow={READING_SHADOW}
      onMapGenerated={onMapGenerated}
      onPointerMove={onMove}
      style={{
        width: contextWidth,
        height: contextHeight,
        cursor: "crosshair",
      }}
    >
      <ReferenceBed kind={bed} />
    </LiquidGlass>
  );
}

function OrbitSurface({
  options,
  bed,
  contextWidth,
  contextHeight,
  onMapGenerated,
}: SharedSurfaceProps) {
  const lens = useRef<LiquidGlassHandle>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const x = 0.5 + 0.33 * Math.sin(t * 0.9);
      const y = 0.5 + 0.3 * Math.sin(t * 1.4 + Math.PI / 3);
      lens.current?.setPosition(x, y);

      const strength =
        0.05 + 0.045 * (0.5 + 0.5 * Math.sin(t * 1.8));
      lens.current?.engine?.setOptions({
        strength,
        chromaticAberration:
          0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.1)),
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <LiquidGlass
      ref={lens}
      {...options}
      shadow={MOTION_SHADOW}
      onMapGenerated={onMapGenerated}
      style={{ width: contextWidth, height: contextHeight }}
    >
      <ReferenceBed kind={bed} />
    </LiquidGlass>
  );
}

function EngineSurface({
  options,
  bed,
  contextWidth,
  contextHeight,
  onMapGenerated,
  pointerTargetRef,
}: SharedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredRef = useRef<HTMLDivElement>(null);
  const defsRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const filtered = filteredRef.current;
    const defsHost = defsRef.current;
    if (!container || !filtered || !defsHost) return;

    const engine = new LiquidGlassEngine(
      { container, filtered, defsHost, shadow: shadowRef.current },
      options,
    );
    engine.onMap = (url) => onMapGenerated?.(url);
    engine.setPosition(0.35, 0.5);

    const anchor = pointerTargetRef?.current;
    const pointerTarget =
      anchor?.closest<HTMLElement>('.experiment-set-two-drag-bounds') ??
      anchor ??
      container;
    const dragTarget = pointerTarget;
    const usesExternalDragTarget = pointerTarget !== container;
    let dragging = false;
    let dragRect: DOMRect | null = null;
    const move = (event: PointerEvent) => {
      // The source panel itself is stationary while its raw engine drag is in
      // progress. In the lab the external Layer C shell moves concurrently,
      // so freeze the pointer coordinate space at pointerdown; otherwise each
      // shell transform cancels the engine's relative motion on the next
      // pointermove and the source interaction appears inert.
      const rect = dragRect ?? container.getBoundingClientRect();
      engine.setPosition(
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
      );
    };
    const onDown = (event: PointerEvent) => {
      const containerRect = container.getBoundingClientRect();
      if (
        event.clientX < containerRect.left ||
        event.clientX > containerRect.right ||
        event.clientY < containerRect.top ||
        event.clientY > containerRect.bottom
      ) {
        return;
      }
      dragging = true;
      dragRect = containerRect;
      if (!usesExternalDragTarget) {
        event.stopPropagation();
        container.setPointerCapture(event.pointerId);
      }
      move(event);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      if (!usesExternalDragTarget) event.stopPropagation();
      move(event);
    };
    const onUp = (event: PointerEvent) => {
      if (dragging && !usesExternalDragTarget) event.stopPropagation();
      dragging = false;
      dragRect = null;
    };

    pointerTarget.addEventListener("pointerdown", onDown);
    dragTarget.addEventListener("pointermove", onMove);
    dragTarget.addEventListener("pointerup", onUp);
    dragTarget.addEventListener("pointercancel", onUp);

    return () => {
      pointerTarget.removeEventListener("pointerdown", onDown);
      dragTarget.removeEventListener("pointermove", onMove);
      dragTarget.removeEventListener("pointerup", onUp);
      dragTarget.removeEventListener("pointercancel", onUp);
      dragging = false;
      dragRect = null;
      engine.onMap = null;
      engine.destroy();
    };
  }, [onMapGenerated, options, pointerTargetRef]);

  return (
    <div
      ref={containerRef}
      className="e11-liquid-web-reference__engine"
      style={{ width: contextWidth, height: contextHeight }}
    >
      <div ref={filteredRef} className="e11-liquid-web-reference__filtered">
        <ReferenceBed kind={bed} />
      </div>
      <div
        ref={defsRef}
        className="e11-liquid-web-reference__defs"
        aria-hidden
      />
      <div
        ref={shadowRef}
        className="e11-liquid-web-reference__shadow"
        aria-hidden
      />
    </div>
  );
}

export function LiquidGlassReferencePreset({
  options,
  interaction,
  bed: requestedBed,
  className,
  style,
  contextWidth = options.width,
  contextHeight = options.height,
  onMapGenerated,
  pointerTargetRef,
}: LiquidGlassReferencePresetProps) {
  const bed = resolveBed(requestedBed, interaction);
  const shared = {
    options,
    bed,
    contextWidth,
    contextHeight,
    onMapGenerated,
    pointerTargetRef,
  };

  return (
    <div
      className={[
        "e11-liquid-web-reference",
        `e11-liquid-web-reference--${interaction}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: contextWidth,
        height: contextHeight,
        ...style,
      }}
      data-liquid-glass-reference=""
      data-liquid-glass-interaction={interaction}
      data-liquid-glass-width={options.width}
      data-liquid-glass-height={options.height}
      data-liquid-glass-radius={options.radius}
      data-liquid-glass-strength={options.strength}
      data-liquid-glass-chromatic-aberration={options.chromaticAberration}
      data-liquid-glass-depth={options.depth}
      data-liquid-glass-curvature={options.curvature}
    >
      {interaction === "hero" ? (
        <HeroSurface {...shared} />
      ) : interaction === "reading" ? (
        <ReadingSurface {...shared} />
      ) : interaction === "orbit" ? (
        <OrbitSurface {...shared} />
      ) : interaction === "engine" ? (
        <EngineSurface {...shared} />
      ) : (
        <StaticSurface {...shared} />
      )}
    </div>
  );
}
