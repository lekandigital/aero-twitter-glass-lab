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
gallery-stage adapter. The source's empty `<Scroll html />` portal is omitted:
it renders no content, while drei creates its React root during render and
therefore creates a duplicate root under React StrictMode. The R3F scene,
camera, FBO, meshes, material, pointer damping, visual scroll behavior, text,
and image composition remain the source implementation.

The React Bits implementation retains `LICENSE.md`. The Draco decoder is
Apache-2.0; its upstream README and license text are stored beside the decoder
binaries. The font retains its SIL Open Font License beside the WOFF file.
