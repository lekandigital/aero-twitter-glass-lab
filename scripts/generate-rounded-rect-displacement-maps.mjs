#!/usr/bin/env node
/**
 * Generates rounded-rectangle displacement maps for the standardized Layer C
 * duplicates.
 *
 * Both `css-liquid-glass-switcher` and `liquid-glass-dist` drive their glass
 * through an SVG `feDisplacementMap` whose `feImage` is declared with
 * `primitiveUnits="objectBoundingBox"` and `width/height = 100%`. That means the
 * source map is *stretched* over whatever box the object occupies. The source
 * maps encode a pill (244 x 70) and a circle (20rem diameter) respectively, so
 * stretching them across a 293 x 125 rounded rectangle leaves the optical field
 * the wrong shape — a circular refracting region inside a rectangle, with the
 * remaining area optically flat. That is the defect this script removes.
 *
 * The generated map is not invented optics: the radial displacement *profile* is
 * sampled out of the authoritative source map and then re-projected along the
 * inward normal of a rounded-rectangle signed distance field. Channel semantics,
 * neutral value and displacement strength are preserved; only the shape the
 * profile is wrapped around changes.
 *
 * Channel contract (verified against both source maps):
 *   R = X displacement, G = Y displacement, ~127 = neutral, alpha opaque.
 *   Deviation from neutral grows toward the edge; outside the shape it is zero.
 *
 * Usage:
 *   node scripts/generate-rounded-rect-displacement-maps.mjs [--check]
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(scriptDirectory, '..')
const publicRoot = join(repositoryRoot, 'public/vendor/reference-glass')

/** 2x the CSS box, matching the source maps' own supersampling. */
const SUPERSAMPLE = 2

const TARGETS = [
  {
    family: 'css-liquid-glass-switcher',
    sourceMap: 'css-liquid-glass-switcher/switcher-map.webp',
    /** The source pill's minor axis is vertical, so the profile lives in G. */
    sourceShape: 'pill',
    profileChannel: 1,
    output: 'css-liquid-glass-switcher/switcher-map-293x125-r21.png',
  },
  {
    family: 'liquid-glass-dist',
    sourceMap: 'liquid-glass-dist/frosted-map.png',
    sourceShape: 'circle',
    /** The source circle's profile is symmetric; sample it from R along x. */
    profileChannel: 0,
    output: 'liquid-glass-dist/frosted-map-293x125-r21.png',
  },
]

const geometry = {
  width: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width,
  height: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height,
  radius: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius,
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto('about:blank')

const results = []

for (const target of TARGETS) {
  const sourceBytes = readFileSync(join(publicRoot, target.sourceMap))
  const sourceDataUrl = `data:${
    target.sourceMap.endsWith('.webp') ? 'image/webp' : 'image/png'
  };base64,${sourceBytes.toString('base64')}`

  const png = await page.evaluate(
    async ({ sourceDataUrl, profileChannel, sourceShape, geometry, supersample }) => {
      // ---------- 1. read the authoritative source map -------------------
      const image = new Image()
      image.src = sourceDataUrl
      await image.decode()
      const src = document.createElement('canvas')
      src.width = image.naturalWidth
      src.height = image.naturalHeight
      const sctx = src.getContext('2d', { willReadFrequently: true })
      sctx.drawImage(image, 0, 0)
      const sw = src.width
      const sh = src.height
      const sdata = sctx.getImageData(0, 0, sw, sh).data
      const sampleChannel = (x, y, channel) => sdata[(y * sw + x) * 4 + channel]

      // Neutral baseline is the map's own centre value, not an assumed 127.
      const neutral = sampleChannel(Math.floor(sw / 2), Math.floor(sh / 2), profileChannel)

      // ---------- 2. extract the displacement profile ---------------------
      // Sample from the shape's centre (t = 0) out to its edge (t = 1) along the
      // minor axis, where the source profile is fully represented.
      const PROFILE_STEPS = 256
      const profile = new Float64Array(PROFILE_STEPS)
      const cx = Math.floor(sw / 2)
      const cy = Math.floor(sh / 2)
      for (let i = 0; i < PROFILE_STEPS; i += 1) {
        const t = i / (PROFILE_STEPS - 1)
        let value
        if (sourceShape === 'circle') {
          // Walk left along the horizontal centre line: x = cx*(1 - t).
          const x = Math.min(sw - 1, Math.max(0, Math.round(cx * (1 - t))))
          value = sampleChannel(x, cy, profileChannel)
        } else {
          // Pill: walk up the vertical centre column.
          const y = Math.min(sh - 1, Math.max(0, Math.round(cy * (1 - t))))
          value = sampleChannel(cx, y, profileChannel)
        }
        // Deviation, normalised to [-1, 1] of a full-scale channel swing.
        profile[i] = (value - neutral) / 127.5
      }
      // Force an exactly neutral centre so the deepest interior never drifts.
      profile[0] = 0

      const profileAt = (t) => {
        const clamped = Math.min(1, Math.max(0, t))
        const pos = clamped * (PROFILE_STEPS - 1)
        const lo = Math.floor(pos)
        const hi = Math.min(PROFILE_STEPS - 1, lo + 1)
        const frac = pos - lo
        return profile[lo] * (1 - frac) + profile[hi] * frac
      }

      // ---------- 3. render the rounded-rectangle field -------------------
      const W = Math.round(geometry.width * supersample)
      const H = Math.round(geometry.height * supersample)
      const R = geometry.radius * supersample
      const out = document.createElement('canvas')
      out.width = W
      out.height = H
      const octx = out.getContext('2d', { willReadFrequently: true })
      const img = octx.createImageData(W, H)
      const data = img.data

      const halfW = W / 2
      const halfH = H / 2
      // Deepest interior point of the rounded rect, used to normalise depth.
      const maxDepth = Math.min(halfW, halfH)

      for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
          // Signed distance to a rounded rectangle centred on the canvas.
          const px = x + 0.5 - halfW
          const py = y + 0.5 - halfH
          const qx = Math.abs(px) - (halfW - R)
          const qy = Math.abs(py) - (halfH - R)
          const mx = Math.max(qx, 0)
          const my = Math.max(qy, 0)
          const outside = Math.hypot(mx, my)
          const inside = Math.min(Math.max(qx, qy), 0)
          const sd = outside + inside - R // negative inside

          const i = (y * W + x) * 4
          if (sd >= 0) {
            // Outside the rounded rectangle: strictly neutral, no smear.
            data[i] = 127
            data[i + 1] = 127
            data[i + 2] = 0
            data[i + 3] = 255
            continue
          }

          // Inward normal = -gradient of the SDF.
          let nx
          let ny
          if (qx > 0 || qy > 0) {
            // Corner arc region: normal points along the arc radius.
            const len = Math.hypot(mx, my) || 1
            nx = -Math.sign(px) * (mx / len)
            ny = -Math.sign(py) * (my / len)
          } else if (qx > qy) {
            nx = -Math.sign(px)
            ny = 0
          } else {
            nx = 0
            ny = -Math.sign(py)
          }

          const depth = Math.min(-sd, maxDepth)
          const t = 1 - depth / maxDepth // 1 at the edge, 0 at the deepest point
          const magnitude = profileAt(t)

          const dx = nx * magnitude
          const dy = ny * magnitude
          data[i] = Math.max(0, Math.min(255, Math.round(127 + dx * 127.5)))
          data[i + 1] = Math.max(0, Math.min(255, Math.round(127 + dy * 127.5)))
          data[i + 2] = Math.max(0, Math.min(255, Math.round(Math.abs(magnitude) * 255)))
          data[i + 3] = 255
        }
      }
      octx.putImageData(img, 0, 0)
      return out.toDataURL('image/png')
    },
    {
      sourceDataUrl,
      profileChannel: target.profileChannel,
      sourceShape: target.sourceShape,
      geometry,
      supersample: SUPERSAMPLE,
    },
  )

  const buffer = Buffer.from(png.split(',')[1], 'base64')
  const outputPath = join(publicRoot, target.output)
  let previous = null
  try {
    previous = readFileSync(outputPath)
  } catch {
    previous = null
  }
  const changed = !previous || !previous.equals(buffer)
  if (process.argv.includes('--check')) {
    if (changed) {
      await browser.close()
      throw new Error(`${target.output} is out of date; run this script without --check`)
    }
  } else if (changed) {
    writeFileSync(outputPath, buffer)
  }
  results.push({
    output: target.output,
    bytes: buffer.length,
    sha256: sha256(buffer),
    changed,
  })
}

await browser.close()

for (const r of results) {
  console.log(
    `${r.output}  ${geometry.width}x${geometry.height} r${geometry.radius}  ` +
    `${r.bytes} bytes  sha256=${r.sha256.slice(0, 16)}  ${r.changed ? 'written' : 'current'}`,
  )
}
