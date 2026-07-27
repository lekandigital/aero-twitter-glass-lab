import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from './appRoutes';

/**
 * Prominent switcher between top-level experiment sets.
 *
 * The compact route strip is a single `overflow-x: auto` row of every route, so
 * an entry near the end of the list (such as Button Source Experiments) can sit
 * outside the first viewport at ordinary desktop widths and is effectively
 * undiscoverable. This renders the experiment sets as large, wrapping controls
 * inside each set's own header, driven by the same central route list.
 */
export function ExperimentSetNav() {
  const sets = APP_ROUTES.filter((route) => route.experimentSet);
  if (sets.length < 2) return null;

  return (
    <nav className="experiment-set-nav" aria-label="Experiment sets">
      <span className="experiment-set-nav__label">Experiment sets</span>
      {sets.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) =>
            `experiment-set-nav__link${isActive ? ' experiment-set-nav__link--active' : ''}`
          }
          data-experiment-set-link={route.path}
        >
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
}
