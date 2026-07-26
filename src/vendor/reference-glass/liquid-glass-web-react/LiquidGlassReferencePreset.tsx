import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
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

/**
 * Kept as a compatibility type for the family renderer. Demonstration beds
 * are intentionally not rendered: Experiment Eleven mounts only the lens.
 */
export type LiquidGlassReferenceBed =
  | "chart"
  | "hero"
  | "text"
  | "orbit"
  | "engine";

export interface LiquidGlassReferencePresetProps {
  presetId: string;
  sourcePresetKey: string;
  sourceComponent: string;
  /** A complete option object resolved against the source DEFAULT_OPTIONS. */
  options: LiquidGlassOptions;
  interaction: LiquidGlassReferenceInteraction;
  bed?: LiquidGlassReferenceBed;
  className?: string;
  style?: CSSProperties;
  /** Transparent technical motion area; never paints a source demo scene. */
  contextWidth?: number;
  contextHeight?: number;
  objectOffsetX?: number;
  objectOffsetY?: number;
  /** Freeze source-demo positional timelines while keeping the exact surface. */
  disableAutonomousMotion?: boolean;
  onMapGenerated?: (url: string) => void;
  /** Target-lab anchor used to route source pointer behavior. */
  pointerTargetRef?: RefObject<HTMLElement | null>;
}

const DEFAULT_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.35)";
const READING_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 12px 30px rgba(0,0,0,0.6)";
const MOTION_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 14px 40px rgba(0,0,0,0.6)";
const HERO_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 18px 50px rgba(0,0,0,0.6)";
const SOURCE_GRIP_LAYER_C_INSET = 8;

function sourceShadow(interaction: LiquidGlassReferenceInteraction): string {
  if (interaction === "hero") return HERO_SHADOW;
  if (interaction === "reading") return READING_SHADOW;
  if (interaction === "orbit" || interaction === "engine") return MOTION_SHADOW;
  return DEFAULT_SHADOW;
}

export function LiquidGlassReferencePreset({
  presetId,
  sourcePresetKey,
  sourceComponent,
  options,
  interaction,
  className,
  style,
  contextWidth = options.width,
  contextHeight = options.height,
  objectOffsetX = 0,
  objectOffsetY = 0,
  disableAutonomousMotion = false,
  onMapGenerated,
  pointerTargetRef,
}: LiquidGlassReferencePresetProps) {
  const object = useRef<LiquidGlassHandle>(null);
  const sourceGrip = useRef<HTMLDivElement>(null);
  const position = useRef({ x: objectOffsetX, y: objectOffsetY });
  const animationFrame = useRef(0);
  const drag = useRef({
    active: false,
    rect: null as DOMRect | null,
    offsetX: 0,
    offsetY: 0,
  });

  const placeTopLeft = (x: number, y: number) => {
    position.current = { x, y };
    object.current?.setPosition(
      (x + options.width / 2) / contextWidth,
      (y + options.height / 2) / contextHeight,
    );
    if (sourceGrip.current) {
      sourceGrip.current.style.transform =
        `translate(${x}px, ${y + SOURCE_GRIP_LAYER_C_INSET}px)`;
    }
  };

  const placeFraction = (x: number, y: number, keepInside = false) => {
    const halfWidth = options.width / 2;
    const halfHeight = options.height / 2;
    if (keepInside) {
      x = Math.min(
        1 - halfWidth / contextWidth,
        Math.max(halfWidth / contextWidth, x),
      );
      y = Math.min(
        1 - halfHeight / contextHeight,
        Math.max(halfHeight / contextHeight, y),
      );
    } else {
      x = Math.min(1, Math.max(0, x));
      y = Math.min(1, Math.max(0, y));
    }
    placeTopLeft(
      x * contextWidth - halfWidth,
      y * contextHeight - halfHeight,
    );
  };

  useLayoutEffect(() => {
    position.current = { x: objectOffsetX, y: objectOffsetY };
    object.current?.setPosition(
      (objectOffsetX + options.width / 2) / contextWidth,
      (objectOffsetY + options.height / 2) / contextHeight,
    );
    if (sourceGrip.current) {
      sourceGrip.current.style.transform =
        `translate(${objectOffsetX}px, ${
          objectOffsetY + SOURCE_GRIP_LAYER_C_INSET
        }px)`;
    }
  }, [
    contextHeight,
    contextWidth,
    objectOffsetX,
    objectOffsetY,
    options.height,
    options.width,
  ]);

  useEffect(() => {
    if (disableAutonomousMotion) return undefined;

    if (interaction === "hero") {
      let last = performance.now();
      let x = (objectOffsetX + options.width / 2) / contextWidth;
      let y = (objectOffsetY + options.height / 2) / contextHeight;
      let velocityX = 0.03;
      let velocityY = 0.024;
      const tick = (now: number) => {
        const delta = Math.min(50, now - last);
        last = now;
        if (!drag.current.active) {
          const halfWidth = options.width / 2;
          const halfHeight = options.height / 2;
          let centerX = x * contextWidth + velocityX * delta;
          let centerY = y * contextHeight + velocityY * delta;
          if (centerX >= contextWidth - halfWidth) {
            centerX = contextWidth - halfWidth;
            velocityX = -Math.abs(velocityX);
          } else if (centerX <= halfWidth) {
            centerX = halfWidth;
            velocityX = Math.abs(velocityX);
          }
          if (centerY >= contextHeight - halfHeight) {
            centerY = contextHeight - halfHeight;
            velocityY = -Math.abs(velocityY);
          } else if (centerY <= halfHeight) {
            centerY = halfHeight;
            velocityY = Math.abs(velocityY);
          }
          x = centerX / contextWidth;
          y = centerY / contextHeight;
          placeFraction(x, y, true);
        }
        animationFrame.current = requestAnimationFrame(tick);
      };
      animationFrame.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationFrame.current);
    }

    if (interaction === "orbit") {
      const start = performance.now();
      const tick = (now: number) => {
        const time = (now - start) / 1000;
        placeFraction(
          0.5 + 0.33 * Math.sin(time * 0.9),
          0.5 + 0.3 * Math.sin(time * 1.4 + Math.PI / 3),
        );
        object.current?.engine?.setOptions({
          strength:
            0.05 + 0.045 * (0.5 + 0.5 * Math.sin(time * 1.8)),
          chromaticAberration:
            0.25 + 0.5 * (0.5 + 0.5 * Math.sin(time * 1.1)),
        });
        animationFrame.current = requestAnimationFrame(tick);
      };
      animationFrame.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationFrame.current);
    }

    return undefined;
    // Source animation uses imperative DOM/filter updates and does not render React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disableAutonomousMotion,
    interaction,
    contextHeight,
    contextWidth,
    options.height,
    options.width,
  ]);

  useEffect(() => {
    if (disableAutonomousMotion) return undefined;
    if (
      interaction !== "hero" &&
      interaction !== "reading" &&
      interaction !== "engine"
    ) {
      return undefined;
    }
    // The source objects live in a page-level portal while Layer C's drag shell
    // remains in the Experiment Eleven tree. Capture at the window so source
    // grip/reading/engine behavior and the target drag shell both receive the
    // same pointer sequence without adding a second visible hit surface.
    const eventTarget = window;

    const sourceRect = () => {
      const element = object.current?.element;
      if (!element) return null;
      return element.getBoundingClientRect();
    };

    const pointInObject = (event: PointerEvent) => {
      const rect = sourceRect();
      if (!rect) return false;
      const scaleX = rect.width / contextWidth;
      const scaleY = rect.height / contextHeight;
      const left = rect.left + position.current.x * scaleX;
      const sourceGripInset =
        interaction === "hero" || interaction === "engine"
          ? SOURCE_GRIP_LAYER_C_INSET
          : 0;
      const top =
        rect.top + (position.current.y + sourceGripInset) * scaleY;
      return Boolean(
        event.clientX >= left &&
          event.clientX <= left + options.width * scaleX &&
          event.clientY >= top &&
          event.clientY <=
            top + (options.height - sourceGripInset) * scaleY,
      );
    };

    const moveFromPointer = (event: PointerEvent) => {
      const rect = drag.current.rect ?? sourceRect();
      if (!rect) return;
      placeFraction(
        (event.clientX - rect.left) / rect.width - drag.current.offsetX,
        (event.clientY - rect.top) / rect.height - drag.current.offsetY,
        interaction === "hero",
      );
    };

    const onDown = (event: PointerEvent) => {
      const hit = pointInObject(event);
      if (!hit) return;
      const rect = sourceRect();
      if (!rect) return;
      drag.current.active = true;
      drag.current.rect = rect as DOMRect;
      const centerX = position.current.x + options.width / 2;
      const centerY = position.current.y + options.height / 2;
      drag.current.offsetX =
        (event.clientX - rect.left) / rect.width - centerX / contextWidth;
      drag.current.offsetY =
        (event.clientY - rect.top) / rect.height - centerY / contextHeight;
      if (interaction === "engine") {
        drag.current.offsetX = 0;
        drag.current.offsetY = 0;
        moveFromPointer(event);
      }
      event.preventDefault();
    };
    const onMove = (event: PointerEvent) => {
      if (interaction === "reading" || drag.current.active) {
        moveFromPointer(event);
      }
    };
    const onMoveEvent: EventListener = (event) =>
      onMove(event as PointerEvent);
    const onUp = () => {
      drag.current.active = false;
      drag.current.rect = null;
    };

    const objectElement = object.current?.element;
    objectElement?.setAttribute(
      "data-source-pointer-listener-attached",
      "true",
    );
    if (interaction !== "reading") {
      eventTarget.addEventListener("pointerdown", onDown, true);
    }
    eventTarget.addEventListener("pointermove", onMoveEvent, true);
    eventTarget.addEventListener("pointerup", onUp, true);
    eventTarget.addEventListener("pointercancel", onUp, true);
    const dragState = drag.current;
    return () => {
      if (interaction !== "reading") {
        eventTarget.removeEventListener("pointerdown", onDown, true);
      }
      eventTarget.removeEventListener("pointermove", onMoveEvent, true);
      eventTarget.removeEventListener("pointerup", onUp, true);
      eventTarget.removeEventListener("pointercancel", onUp, true);
      objectElement?.removeAttribute("data-source-pointer-listener-attached");
      dragState.active = false;
      dragState.rect = null;
    };
    // Pointer routing intentionally uses the portal's stable source coordinate space.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contextHeight,
    contextWidth,
    disableAutonomousMotion,
    interaction,
    options.height,
    options.width,
    pointerTargetRef,
  ]);

  return (
    <LiquidGlass
      ref={object}
      {...options}
      x={(objectOffsetX + options.width / 2) / contextWidth}
      y={(objectOffsetY + options.height / 2) / contextHeight}
      shadow={sourceShadow(interaction)}
      onMapGenerated={onMapGenerated}
      className={[
        "e11-liquid-web-reference",
        `e11-liquid-web-reference--${interaction}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: contextWidth, height: contextHeight, ...style }}
      data-liquid-glass-reference=""
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-reference-preset={presetId}
      data-source-family="liquid-glass-web-react"
      data-source-preset-key={sourcePresetKey}
      data-source-key={sourcePresetKey}
      data-source-component={sourceComponent}
      data-source-wrapper-component={sourceComponent}
      data-source-library-component="react/LiquidGlass"
      data-renderer-family="liquid-glass-web-react"
      data-content-policy="object-only"
      data-transparent-render-surface="true"
      data-source-demo-background="absent"
      data-liquid-glass-interaction={interaction}
      data-liquid-glass-width={options.width}
      data-liquid-glass-height={options.height}
      data-liquid-glass-radius={options.radius}
      data-liquid-glass-strength={options.strength}
      data-liquid-glass-chromatic-aberration={options.chromaticAberration}
      data-liquid-glass-depth={options.depth}
      data-liquid-glass-curvature={options.curvature}
      data-source-context-width={contextWidth}
      data-source-context-height={contextHeight}
      data-source-pointer-routing={
        disableAutonomousMotion ||
        interaction === "static" ||
        interaction === "orbit"
          ? "none"
          : "window-capture"
      }
      data-autonomous-motion={
        disableAutonomousMotion ? "disabled" : "source"
      }
      data-source-component-implementation="react/LiquidGlass"
      data-liquid-glass-filter-application="backdrop-filter"
    >
      <div
        className="e11-liquid-web-reference__transparent-source"
        data-transparent-render-surface="true"
        data-source-demo-background="absent"
        aria-hidden
      >
        {((interaction === "hero" && !disableAutonomousMotion) ||
          interaction === "engine") && (
          <div
            ref={sourceGrip}
            className="e11-liquid-web-reference__source-grip"
            data-source-interaction-grip={interaction}
            data-transparent-render-surface="true"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onPointerCancel={(event) => event.stopPropagation()}
            style={{
              width: options.width,
              height: options.height - SOURCE_GRIP_LAYER_C_INSET,
              borderRadius:
                options.radius === "auto"
                  ? Math.min(options.width, options.height) / 2
                  : options.radius,
              transform: `translate(${objectOffsetX}px, ${
                objectOffsetY + SOURCE_GRIP_LAYER_C_INSET
              }px)`,
            }}
          />
        )}
      </div>
    </LiquidGlass>
  );
}
