#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT,
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'
import {
  BUTTON_EXPERIMENTS,
  BUTTON_EXPERIMENT_SET_ID,
  BUTTON_EXPERIMENT_SET_NAME,
} from '../src/components/button-experiment-set/types.ts'
import {
  BUTTON_EXPERIMENT_SAVES,
  BUTTON_INVENTORY_AUDIT,
} from '../src/components/button-experiment-set/saves.ts'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(scriptDirectory, '..')
const glassSourceRoot = '/Users/lekan/Dev/glass-projects-lab'
const buttonSourceRoot = '/Users/lekan/Dev/button-projects-lab'
const initialHead = '8fa174848cd9425ac7fa69d044ca46d2e0063fe9'
const expectedProtectedHashes = {
  249: '7f1aea51affa4672d0ddc7c6cb5e542b715ee7eb7ac41b215eee3195ca381714',
  1036: '98be21582d5a8dbce94c8e492a1ebbc97c96ef2aa643a35da71408941da62ce5',
  1037: '867273597ce197a07d776e20e69dabd289d6ad43b0d7e581c06f09856b5c370e',
}

function git(args, cwd = repositoryRoot) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

const saves = JSON.parse(
  readFileSync(join(repositoryRoot, 'src/data/experiment-set-one/saves.json'), 'utf8'),
)
const saveById = new Map(saves.map((save) => [save.id, save]))
const generatorAudit = JSON.parse(
  execFileSync(
    process.execPath,
    ['scripts/generate-experiment-eleven-reference-saves.mjs', '--audit'],
    { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  ),
)

function glassRow(row) {
  const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[row.presetId]
  const save = saveById.get(row.saveId)
  return {
    saveId: row.saveId,
    label: save?.label ?? null,
    presetId: row.presetId,
    sourceFamily: row.sourceFamily,
    sourcePath: definition.sourcePath,
    sourceComponent: row.sourceComponent,
    sourceKey: row.sourcePresetKey,
    renderer: row.renderer,
    nativeDimensions: [
      row.nativeWidth,
      row.nativeHeight,
      row.nativeRadius,
      row.nativeGeometry,
    ],
    visibleContentPolicy: row.contentPolicy,
    portalType: row.portalMode,
    transparentRenderSurface: row.transparentRenderSurface,
  }
}

const currentHead = git(['rev-parse', 'HEAD'])
const originMain = git(['rev-parse', 'origin/main'])
const allSaveIds = [
  ...saves.map(({ id }) => id),
  ...BUTTON_EXPERIMENT_SAVES.map(({ id }) => id),
]
const protectedSaveHashComparison = Object.fromEntries(
  Object.entries(expectedProtectedHashes).map(([id, expectedHash]) => {
    const currentHash = hash(saveById.get(Number(id)))
    return [
      id,
      {
        expectedHash,
        currentHash,
        unchanged: currentHash === expectedHash,
      },
    ]
  }),
)
const existingRepairIds = [
  1039, 1040, 1041, 1042, 1043, 1044, 1051, 1052, 1053, 1054, 1055,
  1056, 1066,
]

const report = {
  initialHead,
  finalHead: currentHead,
  originMain,
  commitCountCreatedByTask: Number(git(['rev-list', '--count', `${initialHead}..${currentHead}`])),
  targetRepositoryStatus: git(['status', '--short']) || 'clean',
  sourceRepositoryStatuses: {
    glassProjectsLab: git(['status', '--short'], glassSourceRoot) || 'clean',
    buttonProjectsLab: git(['status', '--short'], buttonSourceRoot) || 'clean',
  },
  protectedSaveHashComparison,
  existingRepairAudit: EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT
    .filter(({ saveId }) => existingRepairIds.includes(saveId))
    .map(glassRow),
  newOriginalSizeLayerCSaves: EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT
    .filter(({ saveId }) => saveId >= 1068 && saveId <= 1079)
    .map(glassRow),
  newStandardizedLayerCSaves: EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT
    .filter(({ saveId }) => saveId >= 1080 && saveId <= 1091)
    .map(glassRow),
  buttonExperimentSet: {
    id: BUTTON_EXPERIMENT_SET_ID,
    name: BUTTON_EXPERIMENT_SET_NAME,
    experiments: BUTTON_EXPERIMENTS.map(({ label }) => label),
    layerModel: ['A'],
    excludesLayers: ['B', 'C', 'D', 'E'],
  },
  buttonPresetCount: BUTTON_INVENTORY_AUDIT.length,
  buttonSaveCount: BUTTON_EXPERIMENT_SAVES.length,
  buttonSaves: BUTTON_INVENTORY_AUDIT,
  duplicateIdCount: allSaveIds.length - new Set(allSaveIds).size,
  missingSourceObjects: {
    newOriginalGlass: 12 - EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT
      .filter(({ saveId }) => saveId >= 1068 && saveId <= 1079).length,
    standardizedGlass: 12 - EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT
      .filter(({ saveId }) => saveId >= 1080 && saveId <= 1091).length,
    buttons: 59 - BUTTON_INVENTORY_AUDIT.length,
  },
  unexpectedSaveDifferences: generatorAudit.unexpectedDifferences
    .filter(({ keys }) => keys.length > 0),
  modifiedOrRemovedBaselineSaves: {
    modified: generatorAudit.modifiedExistingIds,
    removed: generatorAudit.removedExistingIds,
  },
  validation: {
    build: process.env.MISSION_BUILD_RESULT ?? 'not supplied',
    tests: process.env.MISSION_TEST_RESULT ?? 'not supplied',
    typecheck: process.env.MISSION_TYPECHECK_RESULT ?? 'not supplied',
    lint: process.env.MISSION_LINT_RESULT ?? 'not supplied',
    browser: process.env.MISSION_BROWSER_RESULT ?? 'not supplied',
    save1066LineRegression:
      process.env.MISSION_ACHROMATIC_RESULT ?? 'not supplied',
  },
}

console.log(JSON.stringify(report, null, 2))
