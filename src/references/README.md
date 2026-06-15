# References — Aero Twitter Glass Lab

This app does **not** copy the full reference library. Use these external paths when implementing experiments.

## Primary locations

| Resource | Path |
|---|---|
| Reference library (source of truth for GitHub repos, manifests) | `/Users/lekan/Dev/aero-twitter-glass-references` |
| CodePen ZIP source folder | `/Users/lekan/Downloads/zipsofglass2` |
| Synced CodePen exports (44 folders) | `/Users/lekan/Dev/aero-twitter-glass-references/codepen-extracted` |
| Combined ZIP text dump | `/Users/lekan/Dev/aero-twitter-glass-references/all_zip_contents.txt` |
| CodePen export audit | `/Users/lekan/Dev/aero-twitter-glass-references/CODEPEN_EXPORT_AUDIT.md` |

## Priority map (implement later)

1. **liquidGL** — later for large panels.  
   Local: `aero-twitter-glass-references/github/liquidGL`

2. **liquid-glass-react** — later for small React controls.  
   Local: `aero-twitter-glass-references/github/liquid-glass-react`  
   npm: `liquid-glass-react` (installed in app, not integrated)

3. **glass-button-css-only** — later for Post button.  
   Local: `aero-twitter-glass-references/codepen-extracted/glass-button-css-only`

4. **liquid-glass-switcher-css** — later for Home / search / gear / badges.  
   Local: `aero-twitter-glass-references/codepen-extracted/liquid-glass-switcher-css`

5. **7.css** and **7-Aero-Stylesheet** — later for Aero skin.  
   Local: `aero-twitter-glass-references/github/7.css`  
   Local: `aero-twitter-glass-references/github/7-Aero-Stylesheet`

6. **archisvaze-liquid-glass** and **glass-refraction** — later for SVG displacement routes.  
   Local: `aero-twitter-glass-references/github/archisvaze-liquid-glass`  
   Local: `aero-twitter-glass-references/github/glass-refraction`

7. **dashersw-liquid-glass-js** — later for vanilla JS route.  
   Local: `aero-twitter-glass-references/github/liquid-glass-js`

8. **Bokeh / background CodePens** — later for bubbles / background effects.  
   Examples: `liquid-glass-bokeh-background`, `liquid-glass-form-beautiful-backgrounds-js`, `neon-sign`

## App assets

- Background wallpaper: `public/aero-bg.png` (from `Downloads/background.png`)
- Reference screenshot: `public/reference.png`

## Mega combined text

Run `/Users/lekan/Dev/make-aero-glass-mega-text.sh` to regenerate:

`/Users/lekan/Dev/aero-glass-everything-combined.txt`
