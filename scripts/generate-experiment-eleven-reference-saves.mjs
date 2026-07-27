#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS,
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'
import {
  LAYER_C_POSITION_SOURCE_SAVE_ID,
  save248LayerCPosition,
} from '../src/components/experiment-set-one/experimentElevenLayerCPosition.ts'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(scriptDirectory, '..')
const savesPath = join(repositoryRoot, 'src/data/experiment-set-one/saves.json')
const savesGitPath = relative(repositoryRoot, savesPath)
const sourceSaveId = 249

/**
 * The generated reference saves occupy a fixed, reserved block starting here.
 *
 * Anchoring to a constant (rather than `max(existingId) + 1`) is what makes the
 * generator idempotent and recoverable: regenerating always reproduces the same
 * ids for the same registry order, so a record that was lost can be rebuilt in
 * place instead of being appended at the end of the file with a new id.
 */
const referenceSaveIdStart = 1038

const timestampBase = Date.parse('2026-07-25T12:00:00.000Z')
const generatedPresetIds = new Set(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS)

/**
 * Top-level keys the generator owns on a generated record. Everything else is
 * inherited verbatim from the Save 249 base clone.
 */
const generatedKeys = [
  'id',
  'label',
  'savedAt',
  'sourceSaveId',
  'e11LayerCReferencePreset',
  'e11LayerCLayout',
  'e11LayerCInitialPosition',
  'displayId',
]

/**
 * A standardized duplicate is a reference preset resized to the Save 248 Layer C
 * geometry. Only these carry an explicit initial position; the source-native
 * saves keep their own default placement.
 */
const STANDARDIZED_SUFFIXES = [':358x140-r54', ':save248-layer-c']

function standardizedSuffixOf(presetId) {
  return STANDARDIZED_SUFFIXES.find((suffix) => presetId.endsWith(suffix)) ?? null
}

function isStandardizedPreset(presetId) {
  const layout = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]?.nativeLayout
  return (
    standardizedSuffixOf(presetId) !== null &&
    layout?.width === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width &&
    layout?.height === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height &&
    layout?.radius === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius
  )
}
const allowedCloneDifferences = new Set(generatedKeys)

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readSavesAtRevision(revision) {
  return JSON.parse(execFileSync('git', ['show', `${revision}:${savesGitPath}`], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  }))
}

/**
 * The pre-reference baseline is the most recent revision whose saves file
 * predates the reserved generated block entirely.
 *
 * This deliberately keys off the reserved id range rather than "does any save
 * carry a generated preset id". The latter reports a revision in which the
 * generated saves were *deleted* as though it were the baseline, which hides
 * exactly the data loss this audit exists to catch.
 */
function readPreReferenceSaves() {
  for (let generations = 0; generations < 100; generations += 1) {
    const revision = generations === 0 ? 'HEAD' : `HEAD${'^'.repeat(generations)}`
    let saves
    try {
      saves = readSavesAtRevision(revision)
    } catch {
      break
    }
    if (Math.max(...saves.map((save) => save.id)) < referenceSaveIdStart) return saves
  }
  throw new Error('Could not find the pre-reference-save baseline in recent Git history')
}

function stableHash(value) {
  return value === undefined ? null : createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function differingTopLevelKeys(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  return [...keys].filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])).sort()
}

function referenceSaveLabel(displayId, definition) {
  return `Save ${displayId} · Right overlap pane (249 base + ${definition.displayLabel})`
}

/**
 * The native preset a standardized duplicate was derived from, e.g.
 * `liquid-dom:notification-center-main:358x140-r54` -> `…-main`.
 */
function nativePresetIdFor(presetId) {
  const suffix = standardizedSuffixOf(presetId)
  return suffix ? presetId.slice(0, -suffix.length) : null
}

/**
 * Build one generated record from the Save 249 base and the registry.
 *
 * `existing` only contributes its id, so a record that already exists keeps its
 * id (and therefore its pairing) while its label, layout and preset-derived
 * fields are refreshed from the registry.
 */
function buildReferenceSave(source, presetId, index, existing, positionSource, nativeIdByPreset) {
  const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
  if (!definition) throw new Error(`Unknown Experiment Eleven reference preset ${presetId}`)
  const id = existing?.id ?? referenceSaveIdStart + index
  const layout = {
    width: definition.nativeLayout.width,
    height: definition.nativeLayout.height,
    radius: definition.nativeLayout.radius,
  }
  const standardized = isStandardizedPreset(presetId)
  // Standardized duplicates open exactly where Save 248's Layer C sits. The
  // offset is derived from Save 248's own Layer B box, not restated as a literal.
  const initialPosition = standardized
    ? save248LayerCPosition(positionSource.e4.layerBWidth, layout.width)
    : null
  // A standardized duplicate is presented as the "b" variant of the save it
  // duplicates, so the list reads 1068, 1068b, 1069, 1069b, … instead of
  // parking all twelve duplicates after the natives.
  const nativeId = standardized ? nativeIdByPreset.get(nativePresetIdFor(presetId)) : null
  const displayId = nativeId == null ? String(id) : `${nativeId}b`
  return {
    ...structuredClone(source),
    id,
    label: referenceSaveLabel(displayId, definition),
    savedAt: new Date(timestampBase + index * 1000).toISOString(),
    sourceSaveId,
    e11LayerCReferencePreset: presetId,
    e11LayerCLayout: layout,
    ...(initialPosition ? { e11LayerCInitialPosition: initialPosition } : {}),
    ...(nativeId == null ? {} : { displayId }),
  }
}

export function generateReferenceSaves(saves) {
  const source = saves.find((save) => save.id === sourceSaveId)
  if (!source) throw new Error(`Source Save ${sourceSaveId} was not found`)
  const positionSource = saves.find((save) => save.id === LAYER_C_POSITION_SOURCE_SAVE_ID)
  if (!positionSource?.e4) {
    throw new Error(`Layer C position source Save ${LAYER_C_POSITION_SOURCE_SAVE_ID} was not found`)
  }

  const existingByPreset = new Map()
  for (const save of saves) {
    const presetId = save.e11LayerCReferencePreset
    if (!generatedPresetIds.has(presetId)) continue
    if (existingByPreset.has(presetId)) {
      throw new Error(`Duplicate Experiment Eleven reference preset ${presetId}`)
    }
    existingByPreset.set(presetId, save)
  }

  const added = []
  const updated = []
  const unchanged = []

  // Native preset id -> the save id that renders it, so each standardized
  // duplicate can be labelled as that save's "b" variant.
  const nativeIdByPreset = new Map(
    EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.map((presetId, index) => [
      presetId,
      existingByPreset.get(presetId)?.id ?? referenceSaveIdStart + index,
    ]),
  )

  const generated = EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.map((presetId, index) => {
    const existing = existingByPreset.get(presetId)
    const save = buildReferenceSave(source, presetId, index, existing, positionSource, nativeIdByPreset)
    if (!existing) added.push(save)
    else if (JSON.stringify(existing) !== JSON.stringify(save)) updated.push(save)
    else unchanged.push(save)
    return save
  })

  const generatedIds = new Set(generated.map((save) => save.id))
  const collisions = saves
    .filter((save) => generatedIds.has(save.id))
    .filter((save) => !generatedPresetIds.has(save.e11LayerCReferencePreset))
    .map((save) => save.id)
  if (collisions.length > 0) {
    throw new Error(
      `Saves ${collisions.join(', ')} occupy the reserved reference range ` +
      `${referenceSaveIdStart}–${referenceSaveIdStart + EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.length - 1} ` +
      'but are not generated reference saves',
    )
  }

  // Preserve every save the generator does not own, then re-insert the full
  // generated block. User-authored records are never rewritten or reordered
  // beyond the file-wide sort by id.
  const preserved = saves.filter((save) => !generatedPresetIds.has(save.e11LayerCReferencePreset))

  return {
    firstGeneratedId: generated[0]?.id ?? null,
    lastGeneratedId: generated.at(-1)?.id ?? null,
    generated,
    added,
    updated,
    unchanged,
    saves: [...preserved, ...generated].sort((left, right) => left.id - right.id),
  }
}

export function auditReferenceSaves(saves, baselineSaves = readPreReferenceSaves()) {
  const baselineMaximumId = Math.max(...baselineSaves.map((save) => save.id))
  const source = baselineSaves.find((save) => save.id === sourceSaveId)
  if (!source) {
    throw new Error(`Source Save ${sourceSaveId} is absent from the pre-reference baseline`)
  }

  const generated = saves
    .filter((save) => generatedPresetIds.has(save.e11LayerCReferencePreset))
    .sort((left, right) => left.id - right.id)
  const duplicateIdCount = saves.length - new Set(saves.map((save) => save.id)).size
  const unexpectedDifferences = generated.map((save) => ({
    id: save.id,
    keys: differingTopLevelKeys(source, save).filter((key) => !allowedCloneDifferences.has(key)),
  }))

  const baselineById = new Map(baselineSaves.map((save) => [save.id, save]))
  const modifiedExistingIds = saves
    .filter((save) => save.id <= baselineMaximumId)
    .filter((save) => JSON.stringify(save) !== JSON.stringify(baselineById.get(save.id)))
    .map((save) => save.id)
  const removedExistingIds = baselineSaves
    .filter((baselineSave) => !saves.some((save) => save.id === baselineSave.id))
    .map((save) => save.id)
  const unexpectedExtraIds = saves
    .filter((save) => save.id > baselineMaximumId)
    .filter((save) => !generatedPresetIds.has(save.e11LayerCReferencePreset))
    .map((save) => save.id)

  return {
    newSaveCount: generated.length,
    newSaveIdRange: generated.length === 0 ? null : [generated[0].id, generated.at(-1).id],
    labels: generated.map((save) => save.label),
    displayIds: generated.map((save) => save.displayId ?? String(save.id)),
    sourceSaveIds: generated.map((save) => save.sourceSaveId),
    presetIds: generated.map((save) => save.e11LayerCReferencePreset),
    nativeLayouts: generated.map((save) => save.e11LayerCLayout),
    initialPositions: generated.map((save) => save.e11LayerCInitialPosition ?? null),
    duplicateIdCount,
    unexpectedDifferences,
    modifiedExistingIds,
    removedExistingIds,
    unexpectedExtraIds,
    protectedSaves: Object.fromEntries([249, 1036, 1037].map((id) => {
      const current = saves.find((save) => save.id === id)
      const baseline = baselineSaves.find((save) => save.id === id)
      return [id, {
        present: current !== undefined,
        unchanged: current !== undefined && JSON.stringify(current) === JSON.stringify(baseline),
        currentHash: stableHash(current),
        baselineHash: stableHash(baseline),
      }]
    })),
  }
}

const mode = process.argv[2] ?? '--generate'
const currentSaves = readJson(savesPath)

if (mode === '--generate') {
  const result = generateReferenceSaves(currentSaves)
  writeFileSync(savesPath, `${JSON.stringify(result.saves, null, 2)}\n`)
  console.log(
    `Wrote ${result.generated.length} Experiment Eleven reference saves ` +
    `(${result.firstGeneratedId}–${result.lastGeneratedId}): ` +
    `${result.added.length} added, ${result.updated.length} updated in place, ` +
    `${result.unchanged.length} already current, in ${savesPath}`,
  )
} else if (mode === '--check') {
  const expected = generateReferenceSaves(currentSaves).saves
  if (JSON.stringify(currentSaves) !== JSON.stringify(expected)) {
    throw new Error('Experiment Eleven reference saves are not deterministic; run this script without --check')
  }
  console.log(`Verified ${EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.length} deterministic Experiment Eleven reference saves`)
} else if (mode === '--audit') {
  console.log(JSON.stringify(auditReferenceSaves(currentSaves), null, 2))
} else {
  throw new Error(`Unknown mode ${mode}; expected --generate, --check, or --audit`)
}
