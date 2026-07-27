import { Link } from 'react-router-dom';
import { ExperimentShell } from '../components/layout/WorkspaceShell';
import { APP_ROUTES } from '../components/layout/appRoutes';

const REF_ROOT = '/Users/lekan/Dev/aero-twitter-glass-references';

const EXPERIMENT_SET_SUMMARIES: Record<string, string> = {
  '/experiment-set-1':
    'Experiments One to Eleven, including the Right overlap pane and its Layer C reference glass objects.',
  '/button-source-experiments':
    'Six one-layer button placements — Button Left Bottom, Button Left Top, Button Middle Right, Button Middle Left, Search Bar and Gear Icon — rendering 59 exact source button presets. Layer A only.',
};

/**
 * Experiment sets get their own cards here so every set is reachable from the
 * landing route without relying on the horizontally scrolling route strip.
 */
function ExperimentSetCards() {
  const sets = APP_ROUTES.filter((route) => route.experimentSet);
  return (
    <section className="setup-experiment-sets" aria-label="Experiment sets">
      <h2>Experiment sets</h2>
      <div className="setup-experiment-sets__grid">
        {sets.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="setup-experiment-sets__card"
            data-experiment-set-card={route.path}
          >
            <strong>{route.label}</strong>
            <span>{EXPERIMENT_SET_SUMMARIES[route.path] ?? ''}</span>
            <em>{route.path}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SetupDashboard() {
  return (
    <ExperimentShell
      title="Setup Dashboard"
      technique="Workspace overview — no glass implementation yet"
      referencePaths={[
        `${REF_ROOT}`,
        `${REF_ROOT}/REFERENCE_MANIFEST.md`,
        `${REF_ROOT}/CODEPEN_EXPORT_AUDIT.md`,
        `${REF_ROOT}/codepen-extracted`,
        '/Users/lekan/Downloads/zipsofglass2',
        '/Users/lekan/Dev/aero-twitter-glass-lab/public/aero-bg.png',
        '/Users/lekan/Dev/aero-twitter-glass-lab/public/reference.png',
      ]}
    >
      <ExperimentSetCards />
    </ExperimentShell>
  );
}
