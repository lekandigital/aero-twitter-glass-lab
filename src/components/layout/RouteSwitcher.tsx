import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from './appRoutes';

export { APP_ROUTES };
export type { AppRoute } from './appRoutes';

type RouteSwitcherProps = {
  /**
   * `compact` keeps every route from the central list but renders it as one
   * scrollable row, so a standalone experiment page stays navigable without
   * taking the vertical space the full wrapped switcher needs.
   */
  variant?: 'full' | 'compact';
};

export function RouteSwitcher({ variant = 'full' }: RouteSwitcherProps) {
  return (
    <nav
      className={`route-switcher${variant === 'compact' ? ' route-switcher--compact' : ''}`}
      aria-label="Experiment routes"
      data-route-switcher={variant}
    >
      {APP_ROUTES.map(({ path, label, external }) =>
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
