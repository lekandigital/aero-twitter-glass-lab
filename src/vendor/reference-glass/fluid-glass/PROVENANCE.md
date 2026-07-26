# FluidGlass provenance

Authoritative local repository:
`/Users/lekan/Dev/glass-projects-lab`

- implementation:
  `react-bits-main/src/ts-default/Components/FluidGlass/FluidGlass.tsx`
- showcase copy:
  `react-bits-fluid-glass-showcase/src/vendor/FluidGlass.tsx`
- presets:
  `react-bits-fluid-glass-showcase/src/lib/config.ts`
- assets:
  `react-bits-fluid-glass-showcase/public/assets`
- local Draco decoder:
  `react-bits-fluid-glass-showcase/public/draco`
- source default text font:
  `unicode-font-resolver@v1.0.1/packages/data/font-files/latin/sans-serif.normal.400.woff`

Intentional changes are limited to type-only imports, vendored runtime paths,
the local Draco decoder path, pinning the source-resolved Noto Sans Regular
font to its byte-identical vendored file, cursor cleanup, and a scoped native
gallery-stage adapter. Experiment Eleven also enables the adapter's
`transparentObjectOnly` integration mode: the source GLB, private FBO scene,
MeshTransmissionMaterial, camera, and movement remain unchanged, but the
source's full-viewport FBO display plane is not mounted and the visible
framebuffer clears to alpha zero. The private FBO keeps the source clear colour
because it is material input, not a visible backdrop. The source's empty
`<Scroll html />` portal is omitted:
it renders no content, while drei creates its React root during render and
therefore creates a duplicate root under React StrictMode. The R3F scene,
camera, FBO, meshes, material, pointer damping, visual scroll behavior, text,
and image composition inside the private transmission buffer remain the source
implementation.

The React Bits implementation retains `LICENSE.md`. The Draco decoder is
Apache-2.0; its upstream README and license text are stored beside the decoder
binaries. The font retains its SIL Open Font License beside the WOFF file.
