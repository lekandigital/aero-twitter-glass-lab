#!/usr/bin/env node
/**
 * Create Experiment Six and Seven saves — branch save clones with compact panel geometry.
 * E6 includes layer C on stage; E7 is the same materials with rects-only geometry.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/data/experiment-set-one/saves.json');

const BRANCH_SAVE_IDS = [20, 21, 22, 29, 31, 32, 44, 45, 54, 55, 66, 74, 76];

const E6_COMPACT_LAYOUT = {
  layerAWidth: 316,
  layerAHeight: 97,
  layerACornerRadius: 28,
  layerABezelInsetX: 8,
  layerABezelInsetY: 6,
  layerBWidth: 300,
  layerBHeight: 85,
  layerBCornerRadius: 20,
  layerBNestedInA: true,
};

const E7_COMPACT_LAYOUT = {
  layerAWidth: 326,
  layerAHeight: 38,
  layerACornerRadius: 28,
  layerABezelInsetX: 8,
  layerABezelInsetY: 6,
  layerBWidth: 321,
  layerBHeight: 35.3,
  layerBCornerRadius: 20,
  layerBNestedInA: true,
  layerBBorderLeftStrength: 0,
  layerBBorderLeftOpacity: 0,
  layerBBorderRightStrength: 0,
  layerBBorderRightOpacity: 0,
  layerBGlassReflexLeftLight: 0,
  layerBGlassReflexLeftDark: 0,
  layerBGlassReflexLeftSpread: 0,
  layerBGlassReflexRightLight: 0,
  layerBGlassReflexRightDark: 0,
  layerBGlassReflexRightSpread: 0,
  layerBRimSideShadowStrength: 0,
  layerBRimSideShadowBlurPx: 0,
  layerBRimSideGapTop: 18,
  layerBRimSideGapBottom: 18,
  layerABorderLeftStrength: 0,
  layerABorderLeftOpacity: 0,
  layerABorderRightStrength: 0,
  layerABorderRightOpacity: 0,
  layerAGlassReflexLeftLight: 0,
  layerAGlassReflexLeftDark: 0,
  layerAGlassReflexLeftSpread: 0,
  layerAGlassReflexRightLight: 0,
  layerAGlassReflexRightDark: 0,
  layerAGlassReflexRightSpread: 0,
};

const COMPACT_BY_SCOPE = {
  six: E6_COMPACT_LAYOUT,
  seven: E7_COMPACT_LAYOUT,
};

const saves = JSON.parse(readFileSync(OUT, 'utf8'));
const withoutCompact = saves.filter((save) => save.scope !== 'six' && save.scope !== 'seven');
let nextId = Math.max(0, ...withoutCompact.map((save) => save.id)) + 1;
const clones = [];

for (const sourceId of BRANCH_SAVE_IDS) {
  const source = withoutCompact.find((save) => save.id === sourceId);
  if (!source?.e4) {
    console.warn(`Skip branch save ${sourceId} — no e4 block`);
    continue;
  }
  for (const scope of ['six', 'seven']) {
    const labelSuffix = scope === 'six' ? 'E6' : 'E7';
    clones.push({
      ...source,
      id: nextId,
      label: `Save ${sourceId} · ${labelSuffix}`,
      savedAt: new Date().toISOString(),
      e4: { ...source.e4, ...COMPACT_BY_SCOPE[scope] },
      scope,
      sourceSaveId: sourceId,
    });
    nextId += 1;
  }
}

const merged = [...withoutCompact, ...clones].sort((a, b) => a.id - b.id);
writeFileSync(OUT, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Wrote ${clones.length} compact saves (${clones.length / 2} × E6 + ${clones.length / 2} × E7) to ${OUT}`);
