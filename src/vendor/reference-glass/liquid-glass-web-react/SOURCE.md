# liquid-glass-web-react provenance

Vendored from the authoritative local source:

`/Users/lekan/Dev/glass-projects-lab/liquid-glass-web-react`

Upstream/source files copied without implementation changes:

- `src/core/types.ts` — SHA-256
  `8add985710eaf9fba222eb2ad2ffc465f6dcdceb69c4e61a948965595edc2553`
- `src/core/math.ts` — SHA-256
  `b27d0297a32e48a871b95890febb048434cafbfb199ee1f921d12940f2a313d3`
- `src/core/displacementMap.ts` — SHA-256
  `13a5482625f86504f33beea4d389b0b8413723071c2defb351c7480804f1a5e7`
- `src/core/engine.ts` — SHA-256
  `57cb19a0afc4d5497b0f69a3b4257693e76f12b9e3523a5cb6c47cff408bff01`
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
Twitter Glass Lab adapters. They retain the source showcase's chart, text,
Orbit, and raw-engine interaction behavior without importing its page-wide
styles. The vendored source engine's module-level instance counter gives every
mounted SVG filter a collision-safe namespaced ID; every teardown clears its
filter host, observer, scheduled regeneration frame, and map canvas.
