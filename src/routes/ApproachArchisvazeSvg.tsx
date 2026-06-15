import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachArchisvazeSvg() {
  return (
    <ExperimentShell
      title="Archisvaze SVG Displacement"
      technique="SVG displacement maps + glass-refraction React filters"
      referencePaths={[
        `${REF}/github/archisvaze-liquid-glass`,
        `${REF}/github/glass-refraction`,
        `${REF}/github/glass-refraction/src/css/glass.css`,
        `${REF}/codepen-extracted/svg-liquid-glass`,
        `${REF}/codepen-extracted/liquid-glass-svg-filter-configurator-chrome-firefox-safari`,
      ]}
    />
  );
}
