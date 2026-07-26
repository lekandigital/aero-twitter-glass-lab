export const APPLE_LIQUID_GLASS_SHADER_PARAMETERS = {
  directionSamples: 10,
  qualitySamples: 10,
  blurSizePx: 20,
  outsideTextureMultiplier: 0.8,
  glassTextureMultiplier: 0.7,
  glassLift: 0.1,
  highlightStrength: 0.9,
} as const;

export const APPLE_LIQUID_GLASS_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Object-only adaptation of the source LiquidGlass shader. The source flower
 * contribution and opaque page background are removed; all glass sampling,
 * displacement, blur, and highlight math is retained.
 */
export const APPLE_LIQUID_GLASS_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform vec2 uTexRes;
  uniform vec2 uMouse;
  uniform vec2 uGlassCoreHalfSize;
  uniform float uGlassRadius;
  uniform sampler2D uTexture;

  #define PI 3.14159265
  #define S smoothstep
  #define R uRes
  #define PX(a) a / R.y

  vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 st = rs < ri
      ? vec2(i.x * s.y / i.y, s.y)
      : vec2(s.x, i.y * s.x / i.x);
    vec2 o = (
      rs < ri
        ? vec2((st.x - s.x) / 2.0, 0.0)
        : vec2(0.0, (st.y - s.y) / 2.0)
    ) / st;
    return u * s / st + o;
  }

  float Box(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  vec4 LiquidGlass(
    sampler2D tex,
    vec2 uv,
    float direction,
    float quality,
    float size
  ) {
    vec2 radius = size / R;
    vec4 color = texture2D(tex, uv);

    for (float d = 0.0; d < PI; d += PI / direction) {
      for (
        float i = 1.0 / quality;
        i <= 1.0;
        i += 1.0 / quality
      ) {
        color += texture(
          tex,
          uv + vec2(cos(d), sin(d)) * radius * i
        );
      }
    }

    color /= quality * direction;
    return color;
  }

  vec4 GlassShape(vec2 uv) {
    float box = Box(uv, uGlassCoreHalfSize / R.y);
    float shapeRadius = PX(uGlassRadius);
    float boxShape = S(PX(1.5), 0.0, box - shapeRadius);
    float boxDisp = S(
      PX(uGlassRadius * 0.7),
      0.0,
      box - PX(uGlassRadius * 0.5)
    );
    float boxLight = boxShape * S(
      0.0,
      PX(uGlassRadius * 0.6),
      box - PX(uGlassRadius * 0.8)
    );
    return vec4(boxShape, boxDisp, boxLight, 0.0);
  }

  void main() {
    vec2 uv = CoverUV(vUv, uRes, uTexRes);
    vec2 st = (gl_FragCoord.xy - 0.5 * R) / R.y;
    vec2 M = uMouse * 0.5;
    M.x *= uRes.x / uRes.y;

    vec3 tex = texture2D(uTexture, uv).rgb;
    vec4 icon = GlassShape(st - M);

    vec2 uv2 = uv - M;
    uv2 *= S(-0.6, 1.0, icon.y);
    uv2 += M;

    vec3 col = mix(
      tex * 0.8,
      0.1 + LiquidGlass(uTexture, uv2, 10.0, 10.0, 20.0).rgb * 0.7,
      icon.x
    );
    col += icon.z * 0.9;

    gl_FragColor = vec4(col, icon.x);
  }
`;
