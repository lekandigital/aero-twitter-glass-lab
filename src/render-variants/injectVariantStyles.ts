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

const VARIANT_CSS: Record<RenderVariantSlug, string[]> = {
  'opus-4.8-high': [opusHigh4, opusHighGlass, opusHigh2],
  'opus-4.8-max-mistake': [opusMaxMistake4, opusMaxMistakeGlass, opusMaxMistake2],
  'opus-4.8-max': [opusMax4, opusMaxGlass, opusMax2],
  'chatgpt-5.5': [chatgpt4, chatgptGlass, chatgpt2],
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
