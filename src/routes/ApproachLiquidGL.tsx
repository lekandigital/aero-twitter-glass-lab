import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachLiquidGL() {
  return (
    <ExperimentShell
      title="liquidGL"
      technique="WebGL refraction — large panels (sidebar, feed shell, trends, footer)"
      referencePaths={[
        `${REF}/github/liquidGL`,
        `${REF}/github/liquidGL/scripts/liquidGL.js`,
        `${REF}/github/liquidGL/demos`,
        `${REF}/web-archives/liquidgl-demo`,
      ]}
    />
  );
}
