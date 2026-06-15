import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachHybridFinal() {
  return (
    <ExperimentShell
      title="Hybrid Final"
      technique="Composite — liquidGL panels + liquid-glass-react controls + CSS fallbacks + Aero skin"
      referencePaths={[
        `${REF}/REFERENCE_MANIFEST.md`,
        `${REF}/github/liquidGL`,
        `${REF}/github/liquid-glass-react`,
        `${REF}/codepen-extracted/glass-button-css-only`,
        `${REF}/codepen-extracted/liquid-glass-switcher-css`,
        `${REF}/github/7.css`,
        `${REF}/github/7-Aero-Stylesheet`,
        `${REF}/codepen-extracted/liquid-glass-bokeh-background`,
        '/Users/lekan/Dev/aero-twitter-glass-lab/public/reference.png',
      ]}
    />
  );
}
