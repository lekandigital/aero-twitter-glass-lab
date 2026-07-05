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
      rgba(255, 255, 255, 0.92) 0%,
      rgba(242, 251, 255, 0.84) 36%,
      rgba(232, 247, 255, 0.74) 100%
    ),
    radial-gradient(
      ellipse 105% 54% at 48% -6%,
      rgba(255, 255, 255, 0.36),
      transparent 66%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(240, 250, 255, 0.16) 56%,
      rgba(232, 248, 255, 0.26) 100%
    );
  backdrop-filter: blur(26px) saturate(0.92) brightness(1.18);
  -webkit-backdrop-filter: blur(26px) saturate(0.92) brightness(1.18);
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.82),
    inset 0 1px 3px rgba(255, 255, 255, 0.48),
    inset 1.25px 0 2px rgba(255, 255, 255, 0.48),
    inset -1.25px 0 2px rgba(255, 255, 255, 0.34),
    inset 0 -1.25px 2px rgba(235, 250, 255, 0.38),
    inset 0 0 0 1px rgba(255, 255, 255, 0.28),
    inset 0 -12px 24px rgba(0, 72, 165, 0.035),
    0 10px 24px rgba(0, 42, 95, 0.045);
}

.experiment-set-one-selected-save-stage[aria-label^="E10 "] .experiment-four-layer-b__shine,
.experiment-set-one-stage__multi-shell[data-stage-experiment="ten"] .experiment-four-layer-b__shine {
  opacity: 0.2;
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
