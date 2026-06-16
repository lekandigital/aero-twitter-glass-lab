import { NavLink } from 'react-router-dom';

type AppRoute = {
  path: string;
  label: string;
  external?: boolean;
};

const routes: AppRoute[] = [
  { path: '/setup', label: 'Setup' },
  { path: '/liquidgl', label: 'liquidGL' },
  { path: '/react-liquid-glass', label: 'React Liquid Glass' },
  { path: '/css-svg', label: 'CSS / SVG' },
  { path: '/archisvaze-svg', label: 'Archisvaze SVG' },
  { path: '/dashersw', label: 'Dashersw' },
  { path: '/aero-css', label: 'Aero CSS' },
  { path: '/hybrid', label: 'Hybrid' },
  { path: '/approach-1', label: 'Approach 1' },
  { path: '/approach-2', label: 'Approach 2' },
  { path: '/experiment-set-1', label: 'Experiment Set 1' },
  { path: '/showcase', label: 'Showcase' },
  { path: '/references', label: 'References' },
  { path: '/reference-lab', label: 'Reference Lab' },
  { path: '/raw-reference-lab/', label: 'Raw Reference Lab', external: true },
];

export function RouteSwitcher() {
  return (
    <nav className="route-switcher" aria-label="Experiment routes">
      {routes.map(({ path, label, external }) =>
        external ? (
          <a key={path} href={path} className="route-switcher__external">
            {label}
          </a>
        ) : (
          <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
