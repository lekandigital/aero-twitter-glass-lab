import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

function sha256(relativePath) {
  return createHash('sha256')
    .update(readFileSync(new URL(`../${relativePath}`, import.meta.url)))
    .digest('hex')
}

test('vendored source snapshots and licenses stay byte-identical to the audited copies', () => {
  assert.deepEqual(
    {
      aquaHtml: sha256(
        'src/vendor/reference-buttons/aqua-button/index.source.html',
      ),
      aquaCss: sha256(
        'src/vendor/reference-buttons/aqua-button/style.source.scss',
      ),
      aquaLicense: sha256(
        'src/vendor/reference-buttons/aqua-button/LICENSE.txt',
      ),
      beforeAfterHtml: sha256(
        'src/vendor/reference-buttons/buttons-before-after/index.source.html',
      ),
      beforeAfterCss: sha256(
        'src/vendor/reference-buttons/buttons-before-after/style.source.scss',
      ),
      beforeAfterLicense: sha256(
        'src/vendor/reference-buttons/buttons-before-after/LICENSE.txt',
      ),
      dockHtml: sha256(
        'src/vendor/reference-buttons/dock-gradient/index.source.html',
      ),
      dockCss: sha256(
        'src/vendor/reference-buttons/dock-gradient/style.source.css',
      ),
      dockLicense: sha256(
        'src/vendor/reference-buttons/dock-gradient/LICENSE.txt',
      ),
      glassButtonHtml: sha256(
        'src/vendor/reference-buttons/glass-button-html/styles.source.css',
      ),
      glassGenerate: sha256(
        'src/vendor/reference-buttons/glass-button/style.source.css',
      ),
      glassGenerateLicense: sha256(
        'src/vendor/reference-buttons/glass-button/LICENSE.txt',
      ),
      glassLike: sha256(
        'src/vendor/reference-buttons/glass-like-css/style.source.css',
      ),
      glassLikeLicense: sha256(
        'src/vendor/reference-buttons/glass-like-css/LICENSE.txt',
      ),
    },
    {
      aquaHtml:
        'e1277b62c41e35baf35c8c9c3848d2ec4071adf2666acbdb890b7ed4aa0c10c8',
      aquaCss:
        '2b8f718e51695fe79232a34c0125ae1be2c289722d9abd44256181fbd14bea20',
      aquaLicense:
        '37fa9607512134df50aff0944ae4c3926c4567109a36fbcbbd652eaa88ac3a2d',
      beforeAfterHtml:
        '575e1cfd37672087824d8f28a38989ddcee01a05db6404290e65a2781ab8afdd',
      beforeAfterCss:
        '104783d8b374d8a972b65c0a175ea998ef53296e4cd8713f0be76315ba031444',
      beforeAfterLicense:
        '4da2de2f1ada5c37e79612ed543285d3031a6243358dc23bea453a0189540f3d',
      dockHtml:
        '03b658465765a9a88cbdf00fb1870c51c96bcf596031c1e8e68abd6df6a9ea42',
      dockCss:
        'cd108fd1dbc8d7de3f010a29fa60c18da1a3456d06054292807cdf1bc36efb57',
      dockLicense:
        '6412b0e2739b099f5450c96db9f6cb96b26f9ada8bf7fdfb043751f09ce21a31',
      glassButtonHtml:
        '36e1c892622983b8425823a149512511d644728b8a2a97f074d22f34d7de3a78',
      glassGenerate:
        'a68d018262050908394c98f2299dd3ad7dbe20da169b23d6830b49418b185b82',
      glassGenerateLicense:
        'b2f74aebd9c483713f731c7146df7386e927a334ae4d56188617f4d4152df652',
      glassLike:
        '0dd6527cc5bd101a132a572c515c688b2747c85abfebbfc66575bb66cee12335',
      glassLikeLicense:
        '85aeda981860d16ec432e5c0d8c19548c7a16722a06875af4605d0b3d4bb0695',
    },
  )
})

test('Glass Button HTML uses the source masks instead of replacement icon/text art', () => {
  const renderer = readFileSync(
    new URL(
      '../src/components/button-experiment-set/renderers/sourceCss.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const exactStyles = readFileSync(
    new URL(
      '../src/components/button-experiment-set/ExactButtonSourceStyles.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(renderer, /data-exact-source-css="glass-button-html\/styles\.css"/)
  assert.match(renderer, /'spectrum-icon', 'spectrum-text'/)
  assert.match(renderer, /'ink-icon', 'ink-text'/)
  assert.doesNotMatch(renderer, /<Sparkles/)
  assert.match(exactStyles, /styles\.source\.css\?raw/)
  assert.match(exactStyles, /exactRule\(glassButtonHtmlSource/)
  assert.match(exactStyles, /exactRule\(glassGenerateSource/)
})

test('the combined mission audit is internally complete and collision-free', () => {
  const report = JSON.parse(
    execFileSync(
      process.execPath,
      ['scripts/audit-object-and-button-mission.mjs'],
      {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      },
    ),
  )
  // The corrective task starts from the pushed remote commit and must not
  // create commits of its own.
  assert.equal(report.remoteBaselineHead, report.finalHead)
  assert.equal(report.originMain, report.finalHead)
  assert.equal(report.commitsCreatedByThisTask, 0)
  assert.equal(report.newOriginalSizeLayerCSaves.length, 12)
  assert.equal(report.newStandardizedLayerCSaves.length, 12)

  // Standardized duplicates render at the Save 248 Layer C geometry.
  assert.deepEqual(
    [
      report.standardizedGeometry.width,
      report.standardizedGeometry.height,
      report.standardizedGeometry.radius,
    ],
    [293, 125, 21],
  )
  assert.equal(report.standardizedGeometry.allLayoutsMatchSource, true)
  assert.equal(report.standardizedGeometry.noLabelClaimsLegacyGeometry, true)
  assert.equal(report.standardizedGeometry.legacyPresetIdStatus.retained, true)
  assert.deepEqual(
    report.standardizedGeometry.saveIds,
    Array.from({ length: 12 }, (_, index) => 1080 + index),
  )

  // 1068–1079 pair with 1080–1091 in order.
  assert.equal(report.pairMapping.length, 12)
  assert.ok(report.pairMapping.every(({ paired }) => paired))
  assert.deepEqual(
    report.pairMapping.map(({ nativeSaveId, standardizedSaveId }) => [
      nativeSaveId,
      standardizedSaveId,
    ]),
    Array.from({ length: 12 }, (_, index) => [1068 + index, 1080 + index]),
  )

  // The whole reserved reference block is present.
  assert.deepEqual(report.referenceSaveBlock.expectedRange, [1038, 1091])
  assert.equal(report.referenceSaveBlock.presentCount, 54)
  assert.deepEqual(report.referenceSaveBlock.missingSaveIds, [])

  // The button experiments live inside Experiment Set 1, not on their own route.
  assert.equal(report.buttonPlacementExperiments.standaloneRouteRemoved, true)
  assert.deepEqual(report.buttonPlacementExperiments.labels, [
    'Button Left Bottom',
    'Button Left Top',
    'Button Middle Right',
    'Button Middle Left',
    'Search Bar',
    'Gear Icon',
  ])

  assert.equal(report.buttonPresetCount, 59)
  assert.equal(report.buttonSaveCount, 59)
  assert.equal(report.buttonSaves.length, 59)
  assert.deepEqual(report.buttonSaveRange, [1, 59])
  assert.deepEqual(report.buttonSaveRangeActual, [1, 59])
  assert.equal(report.buttonExperimentCount, 6)
  assert.equal(report.buttonLayerAOnly, true)

  // Button saves live in their own numbering space, not the Experiment Set One store.
  assert.equal(report.buttonSavesInsideExperimentSetOneJson, 0)

  // Standardized saves open at Save 248's own Layer C offset.
  assert.equal(report.layerCPositionSource.saveId, 248)
  assert.deepEqual(
    [report.layerCPositionSource.measuredX, report.layerCPositionSource.measuredY],
    [15, 0],
  )
  assert.equal(report.standardizedInitialPositions.length, 12)
  assert.ok(
    report.standardizedInitialPositions.every(
      ({ position }) => position && position.x === 15 && position.y === 0,
    ),
  )
  assert.deepEqual(report.buttonExperimentSet.layerModel, ['A'])
  assert.deepEqual(report.buttonExperimentSet.excludesLayers, ['B', 'C', 'D', 'E'])
  assert.equal(report.duplicateIdCount, 0)
  assert.deepEqual(report.missingSourceObjects, {
    newOriginalGlass: 0,
    standardizedGlass: 0,
    buttons: 0,
  })
  assert.deepEqual(report.unexpectedSaveDifferences, [])
  assert.deepEqual(report.modifiedOrRemovedBaselineSaves, {
    modified: [],
    removed: [],
  })
  assert.ok(
    Object.values(report.protectedSaveHashComparison).every(
      ({ unchanged }) => unchanged,
    ),
  )
  assert.deepEqual(report.sourceRepositoryStatuses, {
    glassProjectsLab: 'clean',
    buttonProjectsLab: 'clean',
  })
})
