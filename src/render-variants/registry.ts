/**
 * Eager, synchronous registry of every branch render pipeline.
 *
 * Each variant's exact branch JS lives under ./<slug>/ and is statically imported
 * here so switching variants is a synchronous map lookup — no dynamic import(),
 * no load race, no half-rendered default→variant swap, no unhandled rejection.
 */
import type { RenderVariantSlug } from './manifest';
import type { RenderVariantModule } from './types';

import * as opus48High from './opus-4.8-high';
import * as opus48MaxMistake from './opus-4.8-max-mistake';
import * as opus48Max from './opus-4.8-max';
import * as chatgpt55 from './chatgpt-5.5';
import * as mixOpusComposer from './mix-opus-composer';
import * as opus48MaxTwo from './opus-4.8-max-two';
import * as composer2Max from './composer-2-max';

export const VARIANT_MODULES: Record<RenderVariantSlug, RenderVariantModule> = {
  'opus-4.8-high': opus48High as unknown as RenderVariantModule,
  'opus-4.8-max-mistake': opus48MaxMistake as unknown as RenderVariantModule,
  'opus-4.8-max': opus48Max as unknown as RenderVariantModule,
  'chatgpt-5.5': chatgpt55 as unknown as RenderVariantModule,
  'chatgpt-5.5-two': chatgpt55 as unknown as RenderVariantModule,
  'mix-opus-composer': mixOpusComposer as unknown as RenderVariantModule,
  'opus-4.8-max-two': opus48MaxTwo as unknown as RenderVariantModule,
  'composer-2-max': composer2Max as unknown as RenderVariantModule,
};

export function getRenderVariantModule(slug: RenderVariantSlug): RenderVariantModule {
  return VARIANT_MODULES[slug];
}
