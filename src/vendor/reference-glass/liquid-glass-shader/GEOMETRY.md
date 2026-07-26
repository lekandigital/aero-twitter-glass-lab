# Source geometry and the transparent output adaptation

The authoritative demo does not contain a discrete rectangular glass object.
It paints a full-viewport, one-pixel-per-CSS-pixel WebGL canvas and returns the
source texture unchanged outside a mouse-centered p=6 superellipse.

The source boundary is viewport-coupled:

```text
|m2.x * resolution.x / resolution.y|^6 + |m2.y|^6 < 0.0001
```

Its bounding width and height are therefore approximately
`0.430886938 × viewportHeight`. At the audited 1440×1000 viewport that is a
430.887px square, rounded up to a 431px transparent technical envelope. There
is no source CSS radius or radius uniform.

`LiquidGlassShaderSurface` preserves the exact source vertex and fragment
program as the first framebuffer pass. A second pass is required solely because
the Experiment Eleven object contract forbids the demo's opaque source pixels
outside the glass. The native renderer masks those pixels with the source
superellipse.

The requested 358×140 radius-54 duplicate cannot be expressed by the source
shader's uniforms: width, height, and radius inputs do not exist. The explicit
`rounded-rect-geometry-adaptation` keeps the exact first pass and clips its
output with a size-dependent 358×140 r54 mask in the transparent composite
pass. It must not be described as an untouched source-native geometry.

