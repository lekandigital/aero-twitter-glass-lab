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

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(scriptDirectory, '..')
const savesPath = join(repositoryRoot, 'src/data/experiment-set-one/saves.json')
const savesGitPath = relative(repositoryRoot, savesPath)
const sourceSaveId = 249
const timestampBase = Date.parse('2026-07-25T12:00:00.000Z')
const generatedPresetIds = new Set(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS)
const allowedCloneDifferences = new Set([
  'id',
  'label',
  'savedAt',
  'sourceSaveId',
  'e11LayerCReferencePreset',
  'e11LayerCLayout',
])

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readPreReferenceSaves() {
  for (let generations = 0; generations < 100; generations += 1) {
    const revision = generations === 0 ? 'HEAD' : `HEAD${'^'.repeat(generations)}`
    let saves
    try {
      saves = JSON.parse(execFileSync('git', ['show', `${revision}:${savesGitPath}`], {
        cwd: repositoryRoot,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      }))
    } catch {
      break
    }
    if (saves.every((save) => !generatedPresetIds.has(save.e11LayerCReferencePreset))) {
      return saves
    }
  }
  throw new Error('Could not find the pre-reference-save baseline in recent Git history')
}

function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function differingTopLevelKeys(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  return [...keys].filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])).sort()
}

export function generateReferenceSaves(saves) {
  const source = saves.find((save) => save.id === sourceSaveId)
  if (!source) throw new Error(`Source Save ${sourceSaveId} was not found`)

  const existingReferenceSaves = saves.filter((save) =>
    generatedPresetIds.has(save.e11LayerCReferencePreset),
  )
  const existingByPreset = new Map()
  for (const save of existingReferenceSaves) {
    const presetId = save.e11LayerCReferencePreset
    if (existingByPreset.has(presetId)) {
      throw new Error(`Duplicate Experiment Eleven reference preset ${presetId}`)
    }
    existingByPreset.set(presetId, save)
  }

  const currentMaximumSaveId = Math.max(...saves.map((save) => save.id))
  let nextNewId = currentMaximumSaveId + 1
  const added = []

  const generated = EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.map((presetId, index) => {
    const existing = existingByPreset.get(presetId)
    if (existing) return existing

    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
    const id = nextNewId
    nextNewId += 1
    const save = {
      ...structuredClone(source),
      id,
      label: `Save ${id} · Right overlap pane (249 base + ${definition.displayLabel})`,
      savedAt: new Date(timestampBase + index * 1000).toISOString(),
      sourceSaveId,
      e11LayerCReferencePreset: presetId,
      e11LayerCLayout: {
        width: definition.nativeLayout.width,
        height: definition.nativeLayout.height,
        radius: definition.nativeLayout.radius,
      },
    }
    added.push(save)
    return save
  })

  const firstNewId = added[0]?.id ?? null
  const lastNewId = added.at(-1)?.id ?? null
  return {
    currentMaximumSaveId,
    firstNewId,
    lastNewId,
    generated,
    added,
    saves: [...saves, ...added].sort((left, right) => left.id - right.id),
  }
}

export function auditReferenceSaves(saves, baselineSaves = readPreReferenceSaves()) {
  const baselineMaximumId = Math.max(...baselineSaves.map((save) => save.id))
  const source = baselineSaves.find((save) => save.id === sourceSaveId)
  if (!source) {
    throw new Error(`Source Save ${sourceSaveId} is absent from the pre-reference baseline`)
  }

  const generated = saves
    .filter((save) => save.id > baselineMaximumId)
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

  return {
    newSaveCount: generated.length,
    newSaveIdRange: generated.length === 0 ? null : [generated[0].id, generated.at(-1).id],
    labels: generated.map((save) => save.label),
    sourceSaveIds: generated.map((save) => save.sourceSaveId),
    presetIds: generated.map((save) => save.e11LayerCReferencePreset),
    nativeLayouts: generated.map((save) => save.e11LayerCLayout),
    duplicateIdCount,
    unexpectedDifferences,
    modifiedExistingIds,
    removedExistingIds,
    protectedSaves: Object.fromEntries([249, 1036, 1037].map((id) => {
      const current = saves.find((save) => save.id === id)
      const baseline = baselineSaves.find((save) => save.id === id)
      return [id, {
        unchanged: JSON.stringify(current) === JSON.stringify(baseline),
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
    `Added ${result.added.length} Experiment Eleven reference saves` +
    (result.added.length
      ? ` (${result.firstNewId}–${result.lastNewId})`
      : '') +
    ` without rewriting ${result.generated.length - result.added.length} existing records ` +
    `in ${savesPath}`,
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
