# Button Source Experiments provenance

This module is an isolated, one-layer integration. It does not alter or import
the Experiment Eleven reference registry or its save records.

## Source snapshots

- `button-projects-lab` commit:
  `2316e9f28e922b79ea6dbc5951eb180a26209172`
- `glass-projects-lab` commit:
  `49b76e9f67870721bf6c4c02dfb792704b0a635e`
- Group G is the canonical inline HTML supplied in the mission.

The `provenanceHash` stored on each registry row is SHA-256 over the sorted
minimum relevant source files. The normalized byte stream is:

```text
relative-path UTF-8 + NUL + exact file bytes + NUL
```

Group G hashes the exact supplied inline HTML bytes.

## Deployment-to-source mapping

| Group | Deployment / supplied source | Authoritative local source |
|---|---|---|
| A | GitHub `container-svg-html-css` | `button-projects-lab/container-svg-html-css` |
| B | GitHub `default-clickable-button.html` | `button-projects-lab/default-clickable-button.html` |
| C | `button-projects-lab.vercel.app/aqua-button/dist` | `button-projects-lab/aqua-button/src` |
| D | `button-projects-lab.vercel.app/buttonsbefore-after/dist` | `button-projects-lab/buttonsbefore-after/src` |
| E | `button-projects-lab.vercel.app/dock-button-gradient-transition/dist` | `button-projects-lab/dock-button-gradient-transition/src` |
| F | `button-projects-lab.vercel.app/glass-button/dist` | `button-projects-lab/glass-button/src` |
| G | Mission inline HTML | `Mission Part IV / Group G` |
| H | `glass-projects-lab-glass-like-css.vercel.app` | `glass-projects-lab/glass-like-css/src` |
| I | `button-projects-lab.vercel.app/glass-button-html` | `button-projects-lab/glass-button-html` |
| J | `glass-projects-lab.vercel.app/glass-button/dist` | `glass-projects-lab/glass-button/src` |
| K | `glass-projects-lab-showcase.vercel.app` | `glass-projects-lab/liquid-dom-master/demo/showcase/src` |
| L | `glass-projects-lab-custom-demo.vercel.app` | `glass-projects-lab/liquid-glass-showcase/src/sections/ToggleDemo.tsx` |
| M | `glass-projects-lab-wge-next.vercel.app` | `glass-projects-lab/web-glass-effect/apps/next-demo` |
| N | `glass-projects-lab-web-glass.vercel.app` | `glass-projects-lab/web-glass-effectshowcase` |
| O | `glass-projects-lab.vercel.app/pure-css-ios-26-liquid-glass-effect/dist` | `glass-projects-lab/pure-css-ios-26-liquid-glass-effect/src` |
| P | `glass-projects-lab.vercel.app/liquid-glass-js-main` | `glass-projects-lab/liquid-glass-js-main` |

## Completeness

Persistent object counts are:

```text
A3 B1 C2 D2 E1 F1 G1 H1 I4 J1 K36 L1 M1 N2 O1 P1 = 59
```

The 59 presets map one-to-one to Saves 1092–1150 and are shared by all six
placement experiments. Hover, active, and focus are interaction states rather
than extra saves. Group N is the sole explicit exception and therefore has one
default save and one persistently hovered save.

Group K's 36 objects comprise 7 showcase tabs, 8 Control Center buttons, 3 iOS
notification buttons, 2 Menu buttons, 11 Music Sidebar buttons, 2 semantically
separate Notification Center icon buttons, and 3 Video Controls buttons. The
R3F hover panel and non-semantic menu rows are not buttons.

The source does not render all 36 through Liquid DOM. Twenty-eight are native
HTML/CSS buttons: the 7 tabs, 8 controls embedded in the Control Center cards,
2 demo toggles, and 11 sidebar items. The remaining 8 are source
`Glass`/`GlassContainer` nodes: 2 iOS actions, the Menu dots button, 2
Notification Center buttons, and 3 Video Controls. Group K preserves that
split and uses one typed config map as the authority for ID order, native
geometry, family optics, and spring interaction values.

## Exact-selection traps

- Group L's `.toggleWrap` is authored as a five-choice segmented control. The
  integration isolates its first `Hubs` option as the requested toggle. Its
  checked visual is the source option plus the exact 86×46 selection lens. Its
  unchecked visual is the same source option and bar with that lens absent,
  matching how `Hubs` appears when the source lens occupies an omitted peer.
  `aria-pressed` and lens presence toggle together; this is the only local
  binary adaptation, while the lens properties and eased press response remain
  source-exact.
- Group M contains two matching 52×52 surfaces. The singular request maps to
  the first/top ArrowUp control; the bottom ArrowDown surface is not a second
  preset.
- Group P contains four matching runtime class roots. The singular request
  maps to the first canonical 80×80 Play circle. Record, Next, and the nested
  60×60 check object are intentionally not additional presets.

## Local adaptation

All styles are scoped under the button experiment route. Filter IDs are
derived from stable preset IDs to avoid collisions. Source demo backgrounds,
cards, videos, app screens, and artboards are omitted. Oversized source objects
remain native inside the renderer and are proportionally scaled only by the
placement viewport. The WGE and liquid-web renderers reuse the local
source-adapted SVG/displacement engines already vendored in this repository.
Group K's 8 Liquid DOM objects execute the authoritative local
`@liquid-dom/react` WebGPU runtime. Each instance captures its own placement
stage while excluding Layer A, expands that optical input by the source
family's required bezel/shadow inset, and leaves the GPU-rendered shadow
visible; there is no CSS glass or shadow substitute. Isolation exposes the iOS
action labels that the source's unopened notification initially occludes. The
Menu button retains its exact hover/press response but does not mount the
omitted 320×360 menu. The video Play button toggles the exact source Play/Pause
SVG; the two seek buttons retain their source response while their omitted
video target receives no seek.
Group N renders the showcase's `GlassSurface` contract directly through
`LiquidFilter`, including its fixed DPR 1, CONVEX surface, saturation 4,
scale ratio 1, and zero canvas padding. Its persisted hover save changes only
blur and refractive index; it does not add an opacity-based hover substitute.
Group O uses the source's embedded 200×200 PNG displacement map (stored as the
byte-identical local `frosted-map.png`) and exact object-bounding-box filter
graph.
The liquid-glass-js target owns and tears down its WebGL resources on unmount.
Group P executes the exact audited `container.js` and `button.js` source at
runtime. Source-text lifecycle adaptations record the otherwise private scroll
listener, guard deferred size/image callbacks after unmount, and discard an
orphaned capture when no live instance remains. One placement-only
adaptation reads untransformed layout dimensions so the source's 80×80 canvas
stays native before the experiment viewport applies its outer scale. Teardown
releases static snapshot and WebGL state. Shader setup and text, defaults,
native geometry, live snapshot behavior, uniforms, and draw behavior are
unchanged.
