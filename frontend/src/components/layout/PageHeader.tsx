import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if not explicitly passed
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const crumbs = breadcrumbs || [
    { label: 'Admin', to: '/app/dashboard' },
    ...pathSegments.slice(1).map((seg, idx, arr) => {
      const path = '/app/' + arr.slice(0, idx + 1).join('/');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
      return { label, to: idx === arr.length - 1 ? undefined : path };
    }),
  ];

  return (
    <div className="page-header">
      <div>
        {crumbs.length > 1 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2"
          >
            <Link
              to="/app/dashboard"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
            >
              <Home size={12} />
            </Link>
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={12} className="text-slate-400 dark:text-slate-600" />
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="page-header__title">{title}</h1>
        {description && (
          <p className="page-header__description">{description}</p>
        )}
      </div>

      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
};

