import type { ChromiumConfigurableGlassConfig } from './config';

export function chromiumGlassEdgeSize(
  config: ChromiumConfigurableGlassConfig,
) {
  return Math.min(config.width, config.height) * (config.border * 0.5);
}

/**
 * The source builds this exact SVG in the debug container, serializes it, and
 * percent-encodes it into feImage.href. The missing closing `)` in the final
 * hsl() is present in the authoritative source and intentionally retained.
 */
export function buildChromiumGlassDisplacementSvg(
  config: ChromiumConfigurableGlassConfig,
) {
  const edgeSize = chromiumGlassEdgeSize(config);
  return `
    <svg class="displacement-image" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="black"></rect>
      <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#red)" />
      <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#blue)" style="mix-blend-mode: ${config.blend}" />
      <rect x="${edgeSize}" y="${edgeSize}" width="${config.width - edgeSize * 2}" height="${config.height - edgeSize * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha}" style="filter:blur(${config.inputBlur}px)" />
    </svg>`;
}

export function buildChromiumGlassDisplacementDataUri(
  config: ChromiumConfigurableGlassConfig,
) {
  return `data:image/svg+xml,${encodeURIComponent(
    buildChromiumGlassDisplacementSvg(config),
  )}`;
}

