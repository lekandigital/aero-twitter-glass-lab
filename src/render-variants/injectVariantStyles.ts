import type { RenderVariantSlug } from './manifest';
import { scopeVariantCss } from './scopeVariantCss';

// Main-branch experiment-set-four.css, scoped to the default (no-variant) state so
// it styles the default pipeline only and never leaks into an active variant. It is
// pulled in here as ?inline instead of via the global import in main.tsx.
import defaultFour from '../styles/experiment-set-four.css?inline';

import opusHigh4 from './opus-4.8-high/styles/experiment-set-four.css?inline';
import opusHighGlass from './opus-4.8-high/styles/glass-frost-surface.css?inline';
import opusHigh2 from './opus-4.8-high/styles/experiment-set-two.css?inline';
import opusMaxMistake4 from './opus-4.8-max-mistake/styles/experiment-set-four.css?inline';
import opusMaxMistakeGlass from './opus-4.8-max-mistake/styles/glass-frost-surface.css?inline';
import opusMaxMistake2 from './opus-4.8-max-mistake/styles/experiment-set-two.css?inline';
import opusMax4 from './opus-4.8-max/styles/experiment-set-four.css?inline';
import opusMaxGlass from './opus-4.8-max/styles/glass-frost-surface.css?inline';
import opusMax2 from './opus-4.8-max/styles/experiment-set-two.css?inline';
import chatgpt4 from './chatgpt-5.5/styles/experiment-set-four.css?inline';
import chatgptGlass from './chatgpt-5.5/styles/glass-frost-surface.css?inline';
import chatgpt2 from './chatgpt-5.5/styles/experiment-set-two.css?inline';
import mix4 from './mix-opus-composer/styles/experiment-set-four.css?inline';
import mixGlass from './mix-opus-composer/styles/glass-frost-surface.css?inline';
import mix2 from './mix-opus-composer/styles/experiment-set-two.css?inline';
import opusMaxTwo4 from './opus-4.8-max-two/styles/experiment-set-four.css?inline';
import opusMaxTwoGlass from './opus-4.8-max-two/styles/glass-frost-surface.css?inline';
import opusMaxTwo2 from './opus-4.8-max-two/styles/experiment-set-two.css?inline';
import composer4 from './composer-2-max/styles/experiment-set-four.css?inline';
import composerGlass from './composer-2-max/styles/glass-frost-surface.css?inline';
import composer2 from './composer-2-max/styles/experiment-set-two.css?inline';

const chatgpt55ThreeWhitePane = `
.experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-b,
.experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-b {
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.86) 0%,
      rgba(236, 249, 255, 0.74) 36%,
      rgba(218, 242, 255, 0.62) 100%
    ),
    radial-gradient(
      ellipse 105% 54% at 48% -6%,
      rgba(255, 255, 255, 0.32),
      transparent 66%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(232, 248, 255, 0.12) 56%,
      rgba(216, 242, 255, 0.2) 100%
    );
  backdrop-filter: blur(34px) saturate(0.86) brightness(1.2);
  -webkit-backdrop-filter: blur(34px) saturate(0.86) brightness(1.2);
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.78),
    inset 0 1px 3px rgba(255, 255, 255, 0.44),
    inset 1.25px 0 2px rgba(255, 255, 255, 0.46),
    inset -1.25px 0 2px rgba(255, 255, 255, 0.3),
    inset 0 -1.25px 2px rgba(218, 245, 255, 0.34),
    inset 0 0 0 1px rgba(255, 255, 255, 0.24),
    inset 0 -12px 24px rgba(0, 72, 165, 0.028),
    0 10px 24px rgba(0, 42, 95, 0.04);
}

.experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-b__shine,
.experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-b__shine {
  opacity: 0.18;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a {
  background:
    radial-gradient(
      ellipse 108% 44% at 18% -8%,
      rgba(255, 255, 255, 0.2),
      rgba(225, 246, 255, 0.11) 42%,
      transparent 72%
    ),
    linear-gradient(
      180deg,
      rgba(249, 253, 255, 0.18) 0%,
      rgba(235, 248, 255, 0.14) 46%,
      rgba(214, 240, 255, 0.11) 100%
    ),
    linear-gradient(
      90deg,
      rgba(214, 244, 255, 0.12) 0%,
      rgba(246, 252, 255, 0.07) 13%,
      rgba(246, 252, 255, 0.04) 82%,
      rgba(174, 214, 236, 0.08) 100%
    );
  backdrop-filter: blur(14px) saturate(0.88) brightness(1.14);
  -webkit-backdrop-filter: blur(14px) saturate(0.88) brightness(1.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 0 0 1px rgba(222, 244, 255, 0.26),
    inset 1px 0 3px rgba(221, 246, 255, 0.2),
    inset -1px 0 3px rgba(156, 199, 226, 0.12),
    inset 0 -18px 30px rgba(88, 153, 196, 0.055),
    0 12px 26px rgba(0, 42, 95, 0.035);
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::before,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::before,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::before,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::before,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::before,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::before {
  opacity: 0.34;
  box-shadow:
    inset 0 0 0 1px rgba(215, 241, 255, 0.34),
    inset 0 10px 22px -18px rgba(255, 255, 255, 0.5),
    inset 12px 0 24px -20px rgba(218, 247, 255, 0.4),
    inset -12px 0 24px -20px rgba(126, 184, 220, 0.16),
    inset 0 -16px 24px -22px rgba(98, 159, 200, 0.2);
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::after,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::after,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a::after,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::after,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::after,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a::after {
  opacity: 0.035;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 18%),
    linear-gradient(90deg, rgba(222, 247, 255, 0.18), transparent 18%, transparent 82%, rgba(170, 214, 238, 0.14));
  backdrop-filter: blur(0.7px) saturate(0.9);
  -webkit-backdrop-filter: blur(0.7px) saturate(0.9);
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-matte,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-matte,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-matte,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-matte,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-matte,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-matte {
  opacity: 0.34;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-gloss,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-gloss,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a .glass-frost-gloss,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-gloss,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-gloss,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a .glass-frost-gloss {
  opacity: 0.025;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim {
  background:
    radial-gradient(ellipse 54px 48px at 0% 0%, rgba(255, 255, 255, 0.34), rgba(218, 247, 255, 0.24) 44%, transparent 78%),
    radial-gradient(ellipse 44px 38px at 100% 0%, rgba(235, 250, 255, 0.18), rgba(184, 224, 246, 0.1) 48%, transparent 80%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(225, 247, 255, 0.16) 12%, rgba(205, 236, 252, 0.07) 28%, transparent 48%),
    linear-gradient(0deg, rgba(134, 194, 225, 0.06) 0%, transparent 18%);
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge {
  background: linear-gradient(
    90deg,
    rgba(215, 243, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.36) 16%,
    rgba(218, 247, 255, 0.3) 52%,
    rgba(174, 214, 238, 0.18) 100%
  );
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--top,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--top,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--top,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--top,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--top,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--top {
  opacity: 0.24;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--bottom,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--bottom,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-edge--bottom,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--bottom,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--bottom,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-edge--bottom {
  opacity: 0.1;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side {
  background:
    linear-gradient(180deg, transparent 0%, rgba(225, 248, 255, 0.32) 16%, rgba(199, 235, 252, 0.22) 54%, rgba(168, 213, 238, 0.08) 86%, transparent 100%),
    linear-gradient(90deg, rgba(231, 250, 255, 0.24), rgba(204, 235, 252, 0.05));
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--left,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--left,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--left,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--left,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--left,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--left {
  opacity: 0.24;
  box-shadow: none;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--right,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--right,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__bezel-rim-side--right,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--right,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--right,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__bezel-rim-side--right {
  opacity: 0.14;
  box-shadow: none;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__radial-corners,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__radial-corners,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__radial-corners,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__radial-corners,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__radial-corners,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__radial-corners {
  opacity: 0.32;
  mix-blend-mode: screen;
}

.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__pwzzovO-glass,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__pwzzovO-glass,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-a__pwzzovO-glass,
.experiment-set-one-page[data-selected-save-ten="226"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__pwzzovO-glass,
.experiment-set-one-page[data-selected-save-ten="227"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__pwzzovO-glass,
.experiment-set-one-page[data-selected-save-ten="229"] .experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-a__pwzzovO-glass {
  opacity: calc(var(--pwzzovO-corner-opacity, 0) * 0.25);
  filter: blur(0.35px) saturate(0.9);
}
`;

const VARIANT_CSS: Record<RenderVariantSlug, string[]> = {
  'opus-4.8-high': [opusHigh4, opusHighGlass, opusHigh2],
  'opus-4.8-max-mistake': [opusMaxMistake4, opusMaxMistakeGlass, opusMaxMistake2],
  'opus-4.8-max': [opusMax4, opusMaxGlass, opusMax2],
  'chatgpt-5.5': [chatgpt4, chatgptGlass, chatgpt2],
  'chatgpt-5.5-two': [chatgpt4, chatgptGlass, chatgpt2],
  'chatgpt-5.5-three': [chatgpt4, chatgptGlass, chatgpt2, chatgpt55ThreeWhitePane],
  'mix-opus-composer': [mix4, mixGlass, mix2],
  'opus-4.8-max-two': [opusMaxTwo4, opusMaxTwoGlass, opusMaxTwo2],
  'composer-2-max': [composer4, composerGlass, composer2],
  // Renders 230's raw material as-is (matches how 228 shows it — no white-pane override)
  'center-overlap-pane': [chatgpt4, chatgptGlass, chatgpt2],
};

let injected = false;

/**
 * Inject every variant's scoped CSS once, up front. Each rule is prefixed with
 * `.experiment-set-one-page[data-render-variant="<slug>"]`, so all sheets can
 * coexist in the document and only the active variant's rules match. Because the
 * CSS is present before the first paint, switching variants never pops in styles.
 */
function injectScoped(slug: string, css: string) {
  const style = document.createElement('style');
  style.dataset.renderVariantStyles = slug || 'default';
  style.textContent = scopeVariantCss(css, slug);
  document.head.appendChild(style);
}

export function injectAllVariantStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  // Default (no variant) — scoped to data-render-variant="" so it never leaks into a variant.
  injectScoped('', defaultFour);
  for (const slug of Object.keys(VARIANT_CSS) as RenderVariantSlug[]) {
    injectScoped(slug, VARIANT_CSS[slug].join('\n'));
  }
}
