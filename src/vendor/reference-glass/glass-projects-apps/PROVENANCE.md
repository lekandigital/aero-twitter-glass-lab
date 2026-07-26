# Glass Projects App Objects

These six object-only renderers were audited from the clean
`glass-projects-lab` source tree at commit
`49b76e9f67870721bf6c4c02dfb792704b0a635e`.

The renderers preserve native object geometry, renderer parameters, and source
filter/shader graphs while deliberately omitting source-demo backgrounds,
icons, notification content, labels, actions, and internal drag behavior.
Optical inputs come from the live Experiment Eleven target stage:

- The three Liquid DOM objects use the authoritative WebGPU renderer build from
  the audited repository and a shared stage-region capture.
- The Lucas Romero and Vue objects use their native CSS backdrop and SVG filter
  paths against the live stage.
- The Apple object uses its native R3F/Three shader path with the captured stage
  as `uTexture` and transparent alpha outside the glass shape.

The published `@liquid-dom/core@0.1.1` and `@liquid-dom/react@0.1.1` packages
were older than the audited repository build despite having the same package
versions. The exact audited build artifacts are therefore vendored as local
file dependencies in `liquid-dom-runtime/`.

Authoritative vendored ESM entry hashes:

- `@liquid-dom/layout@0.2.0`: `cc209a3cf48007ca39cb3ab1aef46eab96fc651709e0450d5a4844852abff0e0`
- `@liquid-dom/core@0.1.1`: `e54c5f2870e21be615178351d43bb3c6ac30fe8f54e2c060f300b03ad832f788`
- `@liquid-dom/react@0.1.1`: `7a54f0cff9266bfc854e53583f8e2a83727ea172b989115beceba586198f75ef`

Per-object file hashes, combined hashes, source paths, component identities,
deployment project IDs, and native geometry are exported from `presets.ts`.

