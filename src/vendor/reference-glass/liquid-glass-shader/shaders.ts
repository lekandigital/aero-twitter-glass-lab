export const LIQUID_GLASS_SHADER_VERTEX = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/**
 * Byte-for-logic extraction of dist/index.html#fragShader. This first pass is
 * deliberately not edited to make its outside pixels transparent.
 */
export const LIQUID_GLASS_SHADER_FRAGMENT = `
  precision mediump float;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse;
  uniform sampler2D iChannel0;

  void mainImage(out vec4 fragColor, in vec2 fragCoord)
  {
    const float NUM_ZERO = 0.0;
    const float NUM_ONE = 1.0;
    const float NUM_HALF = 0.5;
    const float NUM_TWO = 2.0;
    const float POWER_EXPONENT = 6.0;
    const float MASK_MULTIPLIER_1 = 10000.0;
    const float MASK_MULTIPLIER_2 = 9500.0;
    const float MASK_MULTIPLIER_3 = 11000.0;
    const float LENS_MULTIPLIER = 5000.0;
    const float MASK_STRENGTH_1 = 8.0;
    const float MASK_STRENGTH_2 = 16.0;
    const float MASK_STRENGTH_3 = 2.0;
    const float MASK_THRESHOLD_1 = 0.95;
    const float MASK_THRESHOLD_2 = 0.9;
    const float MASK_THRESHOLD_3 = 1.5;
    const float SAMPLE_RANGE = 4.0;
    const float SAMPLE_OFFSET = 0.5;
    const float GRADIENT_RANGE = 0.2;
    const float GRADIENT_OFFSET = 0.1;
    const float GRADIENT_EXTREME = -1000.0;
    const float LIGHTING_INTENSITY = 0.3;

    vec2 uv = fragCoord / iResolution.xy;
    vec2 mouse = iMouse.xy;
    if (length(mouse) < NUM_ONE) {
      mouse = iResolution.xy / NUM_TWO;
    }
    vec2 m2 = (uv - mouse / iResolution.xy);

    float roundedBox = pow(abs(m2.x * iResolution.x / iResolution.y), POWER_EXPONENT) + pow(abs(m2.y), POWER_EXPONENT);
    float rb1 = clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
    float rb2 = clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
      clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
    float rb3 = clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
      clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);

    fragColor = vec4(NUM_ZERO);
    float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);

    if (transition > NUM_ZERO) {
      vec2 lens = ((uv - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBox * LENS_MULTIPLIER) + NUM_HALF);
      float total = NUM_ZERO;
      for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
          vec2 offset = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
          fragColor += texture2D(iChannel0, offset + lens);
          total += NUM_ONE;
        }
      }
      fragColor /= total;

      float gradient = clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
        clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
      vec4 lighting = clamp(fragColor + vec4(rb1) * gradient + vec4(rb2) * LIGHTING_INTENSITY, NUM_ZERO, NUM_ONE);

      fragColor = mix(texture2D(iChannel0, uv), lighting, transition);
    } else {
      fragColor = texture2D(iChannel0, uv);
    }
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`;

export const LIQUID_GLASS_SHADER_COMPOSITE_VERTEX = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT = `
  precision mediump float;
  uniform sampler2D u_exactPass;
  uniform vec2 u_sourceResolution;
  uniform vec2 u_sourceMouse;
  uniform vec2 u_outputResolution;
  uniform float u_outputRadius;
  uniform float u_geometryMode;

  float roundedRectDistance(vec2 pixel, vec2 size, float radius) {
    vec2 center = size * 0.5;
    vec2 toCorner = abs(pixel - center) - (center - radius);
    return length(max(toCorner, 0.0)) +
      min(max(toCorner.x, toCorner.y), 0.0) - radius;
  }

  float sourceTransition(vec2 sourcePixel) {
    const float NUM_ZERO = 0.0;
    const float NUM_ONE = 1.0;
    const float POWER_EXPONENT = 6.0;
    const float MASK_MULTIPLIER_1 = 10000.0;
    const float MASK_MULTIPLIER_2 = 9500.0;
    const float MASK_STRENGTH_1 = 8.0;
    const float MASK_STRENGTH_2 = 16.0;
    const float MASK_THRESHOLD_1 = 0.95;
    const float MASK_THRESHOLD_2 = 0.9;
    vec2 uv = sourcePixel / u_sourceResolution;
    vec2 m2 = uv - u_sourceMouse / u_sourceResolution;
    float roundedBox =
      pow(abs(m2.x * u_sourceResolution.x / u_sourceResolution.y), POWER_EXPONENT) +
      pow(abs(m2.y), POWER_EXPONENT);
    float rb1 = clamp(
      (NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1,
      NUM_ZERO,
      NUM_ONE
    );
    float rb2 = clamp(
      (MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2,
      NUM_ZERO,
      NUM_ONE
    ) - clamp(
      pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) *
        MASK_STRENGTH_2,
      NUM_ZERO,
      NUM_ONE
    );
    return smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);
  }

  void main() {
    vec2 sourcePixel =
      u_sourceMouse + gl_FragCoord.xy - u_outputResolution * 0.5;
    vec2 sourceUv = sourcePixel / u_sourceResolution;
    vec4 exactColor = texture2D(u_exactPass, sourceUv);
    float alpha;
    if (u_geometryMode < 0.5) {
      alpha = sourceTransition(sourcePixel) > 0.0 ? 1.0 : 0.0;
    } else {
      float distance = roundedRectDistance(
        gl_FragCoord.xy,
        u_outputResolution,
        u_outputRadius
      );
      alpha = 1.0 - smoothstep(-1.0, 1.0, distance);
    }
    gl_FragColor = vec4(exactColor.rgb, exactColor.a * alpha);
  }
`;

