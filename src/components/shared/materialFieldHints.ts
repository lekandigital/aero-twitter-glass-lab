import type { MaterialFieldBase } from './MaterialSettingControl';

const SHEET_KEY_HINTS: Record<string, string> = {
  width: 'Sets panel width in px — changes how much background is framed and how wide rim gradients stretch.',
  height: 'Sets panel height in px — taller panels show more vertical fill gradient and inner shadow falloff.',
  transparency:
    'Inverse of fill opacity: higher values thin the white/cyan glass tint so more wallpaper shows through the frost.',
  frost: 'Backdrop-filter blur radius — increases milkiness and scatters detail behind the glass without adding white paint.',
  saturate: 'Boosts color chroma of the blurred backdrop — makes background hues punchier through the glass.',
  brightness: 'Lifts or dims the filtered backdrop — useful when frost makes the scene feel too dark or flat.',
  cornerRadius: 'Border-radius in px — rounds the clip path, rim, shadows, and corner highlights together.',
  fillTop: 'White/cyan wash strength at the top of the body gradient — mimics overhead light on thick glass.',
  fillMid: 'Mid-body tint between top and bottom fills — controls the “body” color of the sheet.',
  fillBottom: 'Heavier tint near the lower edge — sells thickness and grounds the panel visually.',
  bodyTint: 'Extra cyan mixed into the glass fill — ties the sheet to the Aero palette accent.',
  borderWidth: 'Scales rim highlight thickness and inset top lip — stronger values read as a thicker bezel.',
  borderOpacity: 'Alpha of the outer rim stroke — fades the edge without changing rim geometry.',
  topShine: 'Bright radial hotspot along the top edge in the shine overlay — specular catch on upper glass.',
  topRadial: 'Wide soft bloom from the top center — ambient skylight reflected in the surface.',
  diagonalGloss: 'Angled specular band across the face — classic “glass streak” highlight.',
  shineOpacity: 'Master opacity of the shine overlay layer (screen blend) sitting above the frost body.',
  sparkle: 'Brightness of static sparkle dots when sparkles are enabled.',
  showSparkles: 'Shows/hides animated pin-light dots on the shine layer.',
  depth: 'Overall “lift” multiplier — scales inner shadow, outer shadow, and glow together.',
  innerDepth: 'Inset shadow along the bottom inside edge — makes the sheet feel recessed into the bezel.',
  outerShadow: 'Drop shadow strength under the panel — separates it from the background.',
  shadowSpread: 'Blur/spread of the outer shadow in px — larger values float the panel higher.',
  glow: 'Colored outer bloom (cyan) around the panel — Aero ambient light bleed.',
  refraction: 'Edge displacement / refraction strength where supported — warps background at borders.',
};

const E1_HINTS: Record<string, string> = {
  colorCyan: 'Primary Aero accent — feeds rim glow, outer bloom, sparkles, and cyan tints across Experiment One.',
  colorBlue: 'Mid-tone blue for vertical fills and depth shading inside the single panel.',
  colorDeep: 'Deep navy for lower shadows and contrast at the bottom of the glass stack.',
  rim: 'Bezel rim highlight intensity — brightens the outer lip and inset top edge of the Aero frame.',
  innerBevel: 'Inner lip shadow/highlight just inside the border — separates face from rim.',
  showSparkles: 'Toggles decorative sparkle highlights on the panel surface.',
};

const E4_PWZZOV_HINTS: Record<string, string> = {
  layerAOppositeCornerEnabled:
    'Applies the PwzzovO inset box-shadow stack — simulates curved-glass edge catch light on opposite corners via layered inset shadows (not a gradient).',
  layerAGlassReflexLight:
    'Scales white inset highlights in the PwzzovO stack (--glass-reflex-light). Higher = brighter corner catch on the lit diagonal.',
  layerAGlassReflexDark:
    'Scales dark inset shadows in the PwzzovO stack (--glass-reflex-dark). Higher = deeper opposing-corner shade.',
  layerBOppositeCornerEnabled: 'Same PwzzovO inset reflex on the frost body (layer B).',
  layerBGlassReflexLight: 'PwzzovO light reflex multiplier on layer B.',
  layerBGlassReflexDark: 'PwzzovO dark reflex multiplier on layer B.',
};

const E4_RADIAL_HINTS: Record<string, string> = {
  layerARadialCornerMode:
    'Chooses how corner blooms render: Off, a matched diagonal pair (TL+BR or TR+BL), or independent per-corner control. Set strength to 0 in Each corner mode to skip a corner.',
  layerARadialCornerStrength:
    'Paired modes only — master opacity of both diagonal blooms. Applied as layer opacity over two fixed radial gradients (screen blend).',
  layerARadialCornerSize:
    'Paired modes only — ellipse radius in px for both corner blooms. Larger = softer, wider corner glow.',
  layerBRadialCornerMode: 'Radial layout for layer B — same options as layer A.',
  layerBRadialCornerStrength: 'Paired-mode bloom opacity on layer B.',
  layerBRadialCornerSize: 'Paired-mode bloom radius on layer B.',
};

const RADIAL_CORNER_HINTS: Record<string, string> = {
  TlStrength:
    'Each-corner mode — opacity of the top-left radial bloom. 0 = off. Screen-blended white ellipse anchored at the corner.',
  TlSize: 'Each-corner mode — radius in px of the top-left bloom ellipse.',
  TrStrength: 'Each-corner mode — opacity of the top-right bloom.',
  TrSize: 'Each-corner mode — size of the top-right bloom.',
  BlStrength: 'Each-corner mode — opacity of the bottom-left bloom.',
  BlSize: 'Each-corner mode — size of the bottom-left bloom.',
  BrStrength: 'Each-corner mode — opacity of the bottom-right bloom.',
  BrSize: 'Each-corner mode — size of the bottom-right bloom.',
};

function e4PerCornerHints(): Record<string, string> {
  const hints: Record<string, string> = {};
  for (const prefix of ['layerA', 'layerB'] as const) {
    for (const [suffix, text] of Object.entries(RADIAL_CORNER_HINTS)) {
      hints[`${prefix}Radial${suffix}`] = text;
    }
  }
  return hints;
}

const E4_PER_CORNER_HINTS = e4PerCornerHints();

function sheetKeyFromId(id: string): string | null {
  const match = id.match(/^(?:layerA|layerB|trans|frost)([A-Z].*)$/);
  if (!match) return null;
  return match[1].charAt(0).toLowerCase() + match[1].slice(1);
}

export function resolveFieldHint(field: MaterialFieldBase): string | undefined {
  if (field.hint) return field.hint;
  if (E4_PWZZOV_HINTS[field.id]) return E4_PWZZOV_HINTS[field.id];
  if (E4_RADIAL_HINTS[field.id]) return E4_RADIAL_HINTS[field.id];
  if (E4_PER_CORNER_HINTS[field.id]) return E4_PER_CORNER_HINTS[field.id];
  if (E1_HINTS[field.id]) return E1_HINTS[field.id];

  const sheetKey = sheetKeyFromId(field.id);
  if (sheetKey && SHEET_KEY_HINTS[sheetKey]) return SHEET_KEY_HINTS[sheetKey];

  return undefined;
}
