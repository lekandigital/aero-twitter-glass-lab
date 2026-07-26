import { useId } from 'react';
import type { ReferenceButtonPreset } from '../types';
import {
  EXACT_CONTAINER_SVG_SOURCE,
  EXACT_FILTERED_SVG_SOURCE,
  type ExactContainerSvgVariant,
} from './exactSvgSource';

export type ButtonRendererProps = {
  preset: ReferenceButtonPreset;
};

function option(preset: ReferenceButtonPreset, key: string): string {
  return String(preset.options[key] ?? '');
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function prefixSourceIds(source: string, prefix: string, sourceIds: readonly string[]) {
  return sourceIds.reduce(
    (markup, sourceId) => markup.replaceAll(sourceId, `${prefix}-${sourceId}`),
    source,
  );
}

export function ContainerSvgButton({ preset }: ButtonRendererProps) {
  const requestedVariant = option(preset, 'variant');
  const variant: ExactContainerSvgVariant =
    requestedVariant === 'light' || requestedVariant === 'blue' ? requestedVariant : 'dark';
  const source = EXACT_CONTAINER_SVG_SOURCE[variant];
  const idPrefix = `button-exp-container-${safeId(preset.id)}-${safeId(useId())}`;
  const markup = prefixSourceIds(
    `<defs>${source.filterMarkup}</defs>${source.markup}`,
    idPrefix,
    source.sourceIds,
  );
  const filterId = `${idPrefix}-${source.filterId}`;

  return (
    <button
      className={`button-src-container-svg button-src-container-svg--${variant}`}
      type="button"
      aria-label={preset.label}
      data-exact-source-filter={source.filterId}
      style={{ filter: `url(#${filterId})` }}
    >
      <svg
        className="button-src-container-svg__art"
        viewBox={source.viewBox}
        width={source.width}
        height={source.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </button>
  );
}

export function FilteredSvgButton({ preset }: ButtonRendererProps) {
  const source = EXACT_FILTERED_SVG_SOURCE;
  const idPrefix = `button-exp-filter9-${safeId(preset.id)}-${safeId(useId())}`;
  const markup = prefixSourceIds(
    `<defs>${source.definitionsMarkup}</defs>${source.markup}`,
    idPrefix,
    source.sourceIds,
  );

  return (
    <button
      className="button-src-filter9"
      type="button"
      aria-label={preset.label}
      data-exact-source-filter={source.filterId}
    >
      <svg
        className="button-src-filter9__art"
        viewBox={source.viewBox}
        width={source.width}
        height={source.height}
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </button>
  );
}

export function AquaCssButton({ preset }: ButtonRendererProps) {
  const variant = option(preset, 'variant');
  return (
    <button className={`button-src-aqua button-src-aqua--${variant}`} type="button">
      Aqua button
    </button>
  );
}

export function BeforeAfterCssButton({ preset }: ButtonRendererProps) {
  const variant = option(preset, 'variant');
  return (
    <button className={`button-src-before-after button-src-before-after--${variant}`} type="button">
      Button
    </button>
  );
}

export function DockGradientButton() {
  return (
    <button className="button-src-dock" type="button">
      Get Dock for Free
    </button>
  );
}

export function GlassGenerateButton() {
  return (
    <div className="button-src-generate-wrap">
      <button type="button" className="button-src-generate">
        <span>Generate</span>
      </button>
      <div className="button-src-generate-shadow" aria-hidden="true" />
    </div>
  );
}

export function TurboButton({ preset }: ButtonRendererProps) {
  return (
    <button className="button-src-turbo" type="button" aria-label={preset.label} />
  );
}

export function GlassLikeButton() {
  return (
    <div className="button-src-glassy" role="button" aria-label="glassy">
      glassy
    </div>
  );
}

export function GlassHtmlButton({ preset }: ButtonRendererProps) {
  const variant = option(preset, 'variant');
  const artVariants =
    variant === 'spectrum'
      ? ['spectrum-icon', 'spectrum-text']
      : variant === 'ink'
        ? ['ink-icon', 'ink-text']
        : [variant];
  return (
    <button
      className={`button-src-glass-html button-src-glass-html--${variant}`}
      type="button"
      aria-label="Generate"
      data-exact-source-css="glass-button-html/styles.css"
    >
      {artVariants.map((artVariant) => (
        <span
          key={artVariant}
          className={`button-src-glass-html__art button-src-glass-html__art--${artVariant}`}
          aria-hidden="true"
        />
      ))}
    </button>
  );
}
