# liquid-glass-web-react provenance

Vendored from the authoritative local source:

`/Users/lekan/Dev/glass-projects-lab/liquid-glass-web-react`

Upstream/source files copied without implementation changes except where
explicitly documented below:

- `src/core/types.ts` — SHA-256
  `8add985710eaf9fba222eb2ad2ffc465f6dcdceb69c4e61a948965595edc2553`
- `src/core/math.ts` — SHA-256
  `b27d0297a32e48a871b95890febb048434cafbfb199ee1f921d12940f2a313d3`
- `src/core/displacementMap.ts` — SHA-256
  `13a5482625f86504f33beea4d389b0b8413723071c2defb351c7480804f1a5e7`
- `src/core/engine.ts` — upstream SHA-256
  `57cb19a0afc4d5497b0f69a3b4257693e76f12b9e3523a5cb6c47cff408bff01`;
  adapted SHA-256
  `8416330027741fda15a72caa5fe99f37984424dc6043be5097c2226ab8d2798f`.
  The only behavioral extensions are an optional `filterApplication` host
  mode and selection of that mode from the root component's
  `data-liquid-glass-filter-application` attribute. Its default remains the
  upstream child `filter`; the Experiment Eleven adapter selects
  `backdrop-filter` so the same SVG graph samples the live Experiment Eleven
  layers instead of requiring source-demo content.
- `src/react/LiquidGlass.tsx` — SHA-256
  `dd534d17c2d8806ea42c1540ffc8da9477964a92788b5a40f6231432d19c11d6`
- `LICENSE` — SHA-256
  `949e33ed2f105f112b392ce9832799a1c6d2c1fe89784a87c919dfc6b115eacc`

`src/index.ts` retains every upstream export and adds only exports for the
lab-specific adapter. Its upstream SHA-256 is
`78b31efcc72a3eadd0bbac7182cb1676c40e631b26d16fa20a4831c3f7898d8e`;
the adapted file's SHA-256 is
`bf2cec9f7f0a2c1cda5d29ab3d52fc5275971caa128328538a9d40073176996b`.

`LiquidGlassReferencePreset.tsx` and `reference-preset.css` are scoped Aero
Twitter Glass Lab adapters. They mount the byte-identical upstream React
`LiquidGlass` component on the authoritative source coordinate box, with one
native-size transparent lens object and no chart, text, wallpaper, stage,
card, gradient, or other demonstration bed. Transparent technical source
grips retain the GripLens and raw-engine pointer behavior while reserving the
top 8 pixels for the existing Layer C drag shell; ReadingGlass and Orbit keep
their source motion rules without painting the source showcase. Switching
presets keys the renderer so those observers, animation frames, pointer
listeners, filters, and grips cannot carry into the next save. Their SHA-256
values are
`3ec7b9737eab6b0c150b0f80ed7e37138507842abf06dc41bd10fcf10f93dad2`
and
`4e31d7c393ee9a23c9e83654fb2895b39de4853f9e2e74cdfa57b26d34a3646f`.
The vendored source engine's module-level instance counter gives every mounted
SVG filter a collision-safe namespaced ID; every teardown clears its filter
host, observer, scheduled regeneration frame, and map canvas.
