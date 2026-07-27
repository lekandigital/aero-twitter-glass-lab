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
  BUTTON_SAVE_ID_END,
  BUTTON_SAVE_ID_START,
} from '../src/components/button-experiment-set/saves.ts'
import { REFERENCE_BUTTON_PRESETS } from '../src/components/button-experiment-set/registry.ts'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'
import { APP_ROUTES } from '../src/components/layout/appRoutes.ts'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(scriptDirectory, '..')
const glassSourceRoot = '/Users/lekan/Dev/glass-projects-lab'
const buttonSourceRoot = '/Users/lekan/Dev/button-projects-lab'
/**
 * The remote commit this corrective task started from. The previous mission
 * baseline (8fa1748) is history now: its work is already published, so counting
 * commits from it would report already-pushed commits as newly created here.
 */
const remoteBaselineHead = 'b197e1cbf0d8b0553d7529db685e2fc9e85ccfff'
const sessionStartHead = process.env.MISSION_SESSION_START_HEAD ?? remoteBaselineHead
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

const standardizedSaves = saves.filter((save) => save.id >= 1080 && save.id <= 1091)
const standardizedLayouts = standardizedSaves.map((save) => save.e11LayerCLayout)
const standardizedPresetIds = standardizedSaves.map((save) => save.e11LayerCReferencePreset)
const referenceBlockIds = saves
  .filter((save) => save.id >= 1038 && save.id <= 1091)
  .map((save) => save.id)
const missingReferenceIds = Array.from({ length: 54 }, (_, index) => 1038 + index)
  .filter((id) => !referenceBlockIds.includes(id))
const buttonRouteLabels = APP_ROUTES.map(({ label }) => label)

const report = {
  remoteBaselineHead,
  sessionStartHead,
  finalHead: currentHead,
  originMain,
  commitsCreatedByThisTask: Number(
    git(['rev-list', '--count', `${sessionStartHead}..${currentHead}`]),
  ),
  workingTreeStatus: git(['status', '--short', '--untracked-files=all']) || 'clean',
  targetRepositoryStatus: git(['status', '--short']) || 'clean',

  standardizedGeometry: {
    source:
      'EXPERIMENT_ELEVEN_LAYER_C_LAYOUT (src/components/experiment-set-one/experimentElevenLayerCLayout.ts)',
    width: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width,
    height: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height,
    radius: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius,
    saveIds: standardizedSaves.map(({ id }) => id),
    labels: standardizedSaves.map(({ label }) => label),
    layouts: standardizedLayouts,
    allLayoutsMatchSource: standardizedLayouts.every(
      (layout) =>
        layout.width === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width &&
        layout.height === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height &&
        layout.radius === EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius,
    ),
    noLabelClaimsLegacyGeometry: standardizedSaves.every(
      (save) => !save.label.includes('358') && !save.label.includes('r54'),
    ),
    legacyPresetIdStatus: {
      suffix: ':358x140-r54',
      retained: standardizedPresetIds.every((id) => id.endsWith(':358x140-r54')),
      note:
        'Historical internal identifier retained for save, export and local-state ' +
        'compatibility; it no longer describes the rendered geometry.',
    },
  },
  pairMapping: Array.from({ length: 12 }, (_, index) => {
    const native = saveById.get(1068 + index)
    const standardized = saveById.get(1080 + index)
    return {
      nativeSaveId: native?.id ?? null,
      standardizedSaveId: standardized?.id ?? null,
      nativePresetId: native?.e11LayerCReferencePreset ?? null,
      standardizedPresetId: standardized?.e11LayerCReferencePreset ?? null,
      nativeLayout: native?.e11LayerCLayout ?? null,
      standardizedLayout: standardized?.e11LayerCLayout ?? null,
      paired:
        standardized?.e11LayerCReferencePreset ===
        `${native?.e11LayerCReferencePreset}:358x140-r54`,
    }
  }),
  measuredInitialPosition: {
    x: process.env.MISSION_MEASURED_X ?? 'not supplied',
    y: process.env.MISSION_MEASURED_Y ?? 'not supplied',
    coordinateParent:
      '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
    derivation:
      'round((bezelInsetWidth - layerCWidth) / 2), round((bezelInsetHeight - layerCHeight) / 2)',
  },
  buttonRoute: {
    path: '/button-source-experiments',
    presentInCentralRouteList: APP_ROUTES.some(
      ({ path }) => path === '/button-source-experiments',
    ),
    navigationVisibleFromStandalonePages:
      process.env.MISSION_BUTTON_NAV_RESULT ?? 'not supplied',
    requiredVisibleLabels: ['Experiment Set 1', 'Button Source Experiments'].filter(
      (label) => buttonRouteLabels.includes(label),
    ),
  },
  referenceSaveBlock: {
    expectedRange: [1038, 1091],
    presentCount: referenceBlockIds.length,
    missingSaveIds: missingReferenceIds,
  },
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
  buttonPresetCount: REFERENCE_BUTTON_PRESETS.length,
  buttonSaveCount: BUTTON_EXPERIMENT_SAVES.length,
  buttonSaveRange: [BUTTON_SAVE_ID_START, BUTTON_SAVE_ID_END],
  buttonSaveRangeActual: [
    BUTTON_EXPERIMENT_SAVES[0]?.id ?? null,
    BUTTON_EXPERIMENT_SAVES.at(-1)?.id ?? null,
  ],
  buttonExperimentCount: BUTTON_EXPERIMENTS.length,
  buttonLayerAOnly: BUTTON_EXPERIMENT_SAVES.every(
    (save) =>
      Boolean(save.layerA) &&
      !('layerB' in save) &&
      !('layerC' in save) &&
      !('layerD' in save) &&
      !('layerE' in save),
  ),
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
