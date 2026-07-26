import glassButtonHtmlSource from '../../vendor/reference-buttons/glass-button-html/styles.source.css?raw';
import glassGenerateSource from '../../vendor/reference-buttons/glass-button/style.source.css?raw';

function exactRule(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}\\s*\\{`).exec(source);
  if (!match) {
    throw new Error(`Missing exact source CSS rule: ${selector}`);
  }
  const openingBrace = source.indexOf('{', match.index);
  let depth = 1;
  for (let index = openingBrace + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) {
      return source.slice(openingBrace + 1, index).trim();
    }
  }
  throw new Error(`Unclosed exact source CSS rule: ${selector}`);
}

function withoutPlacement(declarations: string): string {
  return declarations
    .split('\n')
    .filter(
      (line) =>
        !/^\s*(?:position|left|top|width|height)\s*:/.test(line),
    )
    .join('\n');
}

const glassBase = exactRule(glassButtonHtmlSource, '.glass');
const glassRing = exactRule(glassButtonHtmlSource, '.glass::before');
const glassFocus = exactRule(glassButtonHtmlSource, '.glass:focus-visible');
const glassActive = exactRule(glassButtonHtmlSource, '.glass:active');
const artBase = exactRule(glassButtonHtmlSource, '.art');
const glassVariants = ['hero', 'soft', 'spectrum', 'ink'] as const;
const artVariants = [
  'hero',
  'soft',
  'spectrum-icon',
  'spectrum-text',
  'ink-icon',
  'ink-text',
] as const;

/**
 * These declarations are extracted at build time from a byte-identical copy
 * of the authoritative source CSS. Only artboard placement is removed: each
 * selected source button becomes the root object instead of remaining at its
 * 1920×1080 showcase coordinate.
 */
const exactGlassButtonHtmlCss = `
.button-experiment-set .button-src-glass-html {
  ${glassBase}
  position: relative;
  inset: auto;
  width: 100%;
  height: 100%;
  --px: 1px;
}
.button-experiment-set .button-src-glass-html::before {
  ${glassRing}
}
.button-experiment-set .button-src-glass-html:focus-visible {
  ${glassFocus}
}
.button-experiment-set .button-src-glass-html:active {
  ${glassActive}
}
.button-experiment-set .button-src-glass-html__art {
  ${artBase}
}
${glassVariants
  .map(
    (variant) => `
.button-experiment-set .button-src-glass-html--${variant} {
  ${withoutPlacement(
    exactRule(glassButtonHtmlSource, `.glass--${variant}`),
  )}
  position: relative;
  inset: auto;
  width: 100%;
  height: 100%;
}`,
  )
  .join('\n')}
${artVariants
  .map(
    (variant) => `
.button-experiment-set .button-src-glass-html__art--${variant} {
  ${exactRule(glassButtonHtmlSource, `.art--${variant}`)}
}`,
  )
  .join('\n')}
@media (prefers-reduced-motion: reduce) {
  .button-experiment-set .button-src-glass-html:active {
    transform: none;
  }
}
`;

const exactGlassGenerateCss = `
@property --angle-1 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -75deg;
}
@property --angle-2 {
  syntax: "<angle>";
  inherits: false;
  initial-value: -45deg;
}
.button-experiment-set .button-src-generate-wrap {
  ${exactRule(glassGenerateSource, '.button-wrap')}
  --global--size: 76.8px;
  --anim--hover-time: 400ms;
  --anim--hover-ease: cubic-bezier(0.25, 1, 0.5, 1);
  width: auto;
  height: auto;
  font-size: var(--global--size);
  line-height: normal;
}
.button-experiment-set .button-src-generate-shadow {
  ${exactRule(glassGenerateSource, '.button-shadow')}
  inset: auto;
  border-radius: 0;
  box-shadow: none;
}
.button-experiment-set .button-src-generate-shadow::after {
  ${exactRule(glassGenerateSource, '.button-shadow::after')}
}
.button-experiment-set .button-src-generate {
  ${exactRule(glassGenerateSource, 'button')}
  width: auto;
  height: auto;
  overflow: visible;
}
.button-experiment-set .button-src-generate:hover {
  ${exactRule(glassGenerateSource, 'button:hover')}
}
.button-experiment-set .button-src-generate span {
  ${exactRule(glassGenerateSource, 'button span')}
  height: auto;
  place-items: normal;
}
.button-experiment-set .button-src-generate:hover span {
  ${exactRule(glassGenerateSource, 'button:hover span')}
}
.button-experiment-set .button-src-generate span::after {
  ${exactRule(glassGenerateSource, 'button span::after')}
}
.button-experiment-set .button-src-generate:hover span::after {
  ${exactRule(glassGenerateSource, 'button:hover span::after')}
}
.button-experiment-set .button-src-generate:active span::after {
  ${exactRule(glassGenerateSource, 'button:active span::after')}
}
.button-experiment-set .button-src-generate::after {
  ${exactRule(glassGenerateSource, 'button::after')}
}
.button-experiment-set .button-src-generate:hover::after {
  ${exactRule(glassGenerateSource, 'button:hover::after')}
}
.button-experiment-set .button-src-generate:active::after {
  ${exactRule(glassGenerateSource, 'button:active::after')}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:hover) .button-src-generate-shadow {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:hover) .button-shadow',
  )}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:hover) .button-src-generate-shadow::after {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:hover) .button-shadow::after',
  )}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:active) {
  ${exactRule(glassGenerateSource, '.button-wrap:has(button:active)')}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:active) .button-src-generate {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:active) button',
  )}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:active) .button-src-generate-shadow {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:active) .button-shadow',
  )}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:active) .button-src-generate-shadow::after {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:active) .button-shadow::after',
  )}
}
.button-experiment-set .button-src-generate-wrap:has(.button-src-generate:active) span {
  ${exactRule(
    glassGenerateSource,
    '.button-wrap:has(button:active) span',
  )}
}
@media (hover: none) and (pointer: coarse) {
  .button-experiment-set .button-src-generate span::after,
  .button-experiment-set .button-src-generate:active span::after {
    --angle-2: -45deg;
  }
  .button-experiment-set .button-src-generate::after,
  .button-experiment-set .button-src-generate:hover::after,
  .button-experiment-set .button-src-generate:active::after {
    --angle-1: -75deg;
  }
}
`;

export function ExactButtonSourceStyles() {
  return (
    <style
      data-exact-button-source-styles="glass-button-html glass-button"
      data-source-css-sha256="36e1c892622983b8425823a149512511d644728b8a2a97f074d22f34d7de3a78 a68d018262050908394c98f2299dd3ad7dbe20da169b23d6830b49418b185b82"
    >
      {exactGlassButtonHtmlCss + exactGlassGenerateCss}
    </style>
  );
}
