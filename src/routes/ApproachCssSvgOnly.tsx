import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachCssSvgOnly() {
  return (
    <ExperimentShell
      title="CSS / SVG Only"
      technique="Pure CSS glass + SVG filters — no WebGL libraries"
      referencePaths={[
        `${REF}/codepen-extracted/glass-button-css-only`,
        `${REF}/codepen-extracted/glass-effect-pure-css-liquid-glass`,
        `${REF}/codepen-extracted/glass-like-css`,
        `${REF}/codepen-extracted/glass-pure-css`,
        `${REF}/codepen-extracted/svg-liquid-glass`,
        `${REF}/codepen-extracted/liquid-glass-svg-filter-configurator-chrome-firefox-safari`,
        `${REF}/web-archives/kube-liquid-glass`,
      ]}
    />
  );
}
