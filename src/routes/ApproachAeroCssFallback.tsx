import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachAeroCssFallback() {
  return (
    <ExperimentShell
      title="Aero CSS Fallback"
      technique="7.css + 7-Aero-Stylesheet — Frutiger Aero / Windows 7 skin"
      referencePaths={[
        `${REF}/github/7.css`,
        `${REF}/github/7-Aero-Stylesheet`,
        'npm:7.css (installed, not integrated)',
        `${REF}/codepen-extracted/glass-theme-page-and-menu`,
      ]}
    />
  );
}
