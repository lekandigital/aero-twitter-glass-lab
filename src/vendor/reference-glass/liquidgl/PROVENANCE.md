# liquidGL Demo 1 renderer provenance

Authoritative source:

- `glass-projects-lab/liquidGL-main 2/scripts/liquidGL.js`
- `glass-projects-lab/liquidGL-main 2/demos/demo-1.html`
- `glass-projects-lab/liquidGL-main 2/assets/naughtyduk-logo.svg`
- `glass-projects-lab/liquidGL-main 2/assets/download-icon.svg`

The renderer was copied from source SHA-256
`74563a1da7db33a62481853cfbd1d1edfaacb9fd26a7267847eead34470df4a4`.
Its shader, snapshot, refraction, bevel, frost, magnification, shadow,
specular, reveal, and tilt paths are unchanged.

The target copy adds only an explicit `destroy()` lifecycle. The standalone
source owns its renderer until page navigation; Experiment Eleven switches
renderers without navigating, so the added lifecycle cancels its animation
frames, disconnects its observers, removes listeners and DOM mirrors, releases
the WebGL context, and removes the singleton canvas.

The two SVG assets are unmodified:

- `download-icon.svg`: SHA-256
  `7eb373b82463ea6b30e8fb9b66868c4cf201996beabed8ea1836e85efaab9d6c`
- `naughtyduk-logo.svg`: SHA-256
  `796b0868571e984093562f307305b140821d04de4f1f9a2b36b39edc70ced72c`

See `LICENSE` for the upstream MIT terms.
