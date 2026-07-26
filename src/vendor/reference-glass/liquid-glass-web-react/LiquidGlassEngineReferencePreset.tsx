import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { LiquidGlassEngine } from "./core/engine";
import type { LiquidGlassOptions } from "./core/types";
import "./reference-preset.css";

export interface LiquidGlassEngineReferencePresetProps {
  presetId: string;
  sourcePresetKey: string;
  options: LiquidGlassOptions;
  contextWidth: number;
  contextHeight: number;
  objectOffsetX: number;
  objectOffsetY: number;
  className?: string;
  style?: CSSProperties;
  onMapGenerated?: (url: string) => void;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}

const ENGINE_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.24), 0 14px 40px rgba(0,0,0,0.6)";
const SOURCE_GRIP_LAYER_C_INSET = 8;

/**
 * Object-only adapter for the showcase's `sections/Engine.tsx`.
 *
 * This deliberately constructs `LiquidGlassEngine` against the same four
 * plain-DOM hosts as the authoritative source. The excluded `.engineBed` is
 * demo content, so the filtered host is transparent and applies the exact
 * generated SVG graph as a backdrop filter over Experiment Eleven instead.
 */
export function LiquidGlassEngineReferencePreset({
  presetId,
  sourcePresetKey,
  options,
  contextWidth,
  contextHeight,
  objectOffsetX,
  objectOffsetY,
  className,
  style,
  onMapGenerated,
}: LiquidGlassEngineReferencePresetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredRef = useRef<HTMLDivElement>(null);
  const defsRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const initialOptionsRef = useRef(options);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const filtered = filteredRef.current;
    const defsHost = defsRef.current;
    const grip = gripRef.current;
    if (!container || !filtered || !defsHost || !grip) return undefined;

    const engine = new LiquidGlassEngine(
      {
        container,
        filtered,
        defsHost,
        shadow: shadowRef.current,
        filterApplication: "backdrop-filter",
      },
      initialOptionsRef.current,
    );
    engine.onMap = (url) => onMapGenerated?.(url);
    engine.setPosition(
      (objectOffsetX + options.width / 2) / contextWidth,
      (objectOffsetY + options.height / 2) / contextHeight,
    );

    let dragging = false;
    const move = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      const y = Math.min(
        1,
        Math.max(0, (event.clientY - rect.top) / rect.height),
      );
      engine.setPosition(x, y);
      grip.style.transform = `translate(${
        x * contextWidth - options.width / 2
      }px, ${
        y * contextHeight - options.height / 2 + SOURCE_GRIP_LAYER_C_INSET
      }px)`;
    };
    const onDown = (event: PointerEvent) => {
      dragging = true;
      grip.setPointerCapture(event.pointerId);
      move(event);
    };
    const onMove = (event: PointerEvent) => {
      if (dragging) move(event);
    };
    const onUp = () => {
      dragging = false;
    };

    grip.addEventListener("pointerdown", onDown);
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onUp);
    grip.dataset.sourcePointerListenerAttached = "true";
    container.dataset.sourcePointerListenerAttached = "true";

    return () => {
      grip.removeEventListener("pointerdown", onDown);
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      grip.removeEventListener("pointercancel", onUp);
      delete grip.dataset.sourcePointerListenerAttached;
      delete container.dataset.sourcePointerListenerAttached;
      engine.destroy();
    };
  }, [
    contextHeight,
    contextWidth,
    objectOffsetX,
    objectOffsetY,
    onMapGenerated,
    options.height,
    options.width,
  ]);

  const radius =
    options.radius === "auto"
      ? Math.min(options.width, options.height) / 2
      : options.radius;

  return (
    <div
      ref={containerRef}
      className={[
        "e11-liquid-web-reference",
        "e11-liquid-web-reference--engine",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: contextWidth, height: contextHeight, ...style }}
      data-liquid-glass-engine=""
      data-liquid-glass-reference=""
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-reference-preset={presetId}
      data-source-family="liquid-glass-web-react"
      data-source-preset-key={sourcePresetKey}
      data-source-key={sourcePresetKey}
      data-source-component="LiquidGlassEngine"
      data-source-component-implementation="core/LiquidGlassEngine"
      data-renderer-family="liquid-glass-web-react"
      data-content-policy="object-only"
      data-transparent-render-surface="true"
      data-source-demo-background="absent"
      data-liquid-glass-interaction="engine"
      data-liquid-glass-width={options.width}
      data-liquid-glass-height={options.height}
      data-liquid-glass-radius={options.radius}
      data-liquid-glass-strength={options.strength}
      data-liquid-glass-chromatic-aberration={options.chromaticAberration}
      data-liquid-glass-depth={options.depth}
      data-liquid-glass-curvature={options.curvature}
      data-source-context-width={contextWidth}
      data-source-context-height={contextHeight}
      data-source-pointer-routing="raw-engine-grip"
      data-autonomous-motion="none"
      data-liquid-glass-filter-application="backdrop-filter"
    >
      <div
        ref={filteredRef}
        className="e11-liquid-web-reference__transparent-source"
        data-transparent-render-surface="true"
        data-source-demo-background="absent"
        style={{ willChange: "backdrop-filter" }}
        aria-hidden
      />
      <div
        ref={defsRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden
      />
      <div
        ref={shadowRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          willChange: "transform",
          boxShadow: ENGINE_SHADOW,
        }}
      />
      <div
        ref={gripRef}
        className="e11-liquid-web-reference__source-grip"
        data-source-interaction-grip="engine"
        data-transparent-render-surface="true"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onPointerCancel={(event) => event.stopPropagation()}
        style={{
          width: options.width,
          height: options.height - SOURCE_GRIP_LAYER_C_INSET,
          borderRadius: radius,
          transform: `translate(${objectOffsetX}px, ${
            objectOffsetY + SOURCE_GRIP_LAYER_C_INSET
          }px)`,
        }}
      />
    </div>
  );
}
