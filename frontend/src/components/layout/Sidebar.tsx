import React from 'react';
import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react';
import { ADMIN_NAV_SECTIONS } from './navigation.config';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { role } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar__backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'sidebar',
          collapsed && 'sidebar--collapsed',
          mobileOpen && 'sidebar--mobile-open'
        )}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="sidebar__header">
          <div className="sidebar__logo-badge" title="Brightloop">
            <Zap size={20} className="fill-white" />
          </div>
          {!collapsed && (
            <div className="sidebar__brand-name">
              <span>Brightloop</span>
              <span className="sidebar__brand-pill">Admin</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar__nav">
          {ADMIN_NAV_SECTIONS.map((section) => {
            // Filter section items based on user role
            const visibleItems = section.items.filter(
              (item) => !item.adminOnly || role === 'ADMIN'
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id} className="sidebar__section">
                {!collapsed && (
                  <p className="sidebar__section-label">{section.label}</p>
                )}
                <ul className="sidebar__list">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onCloseMobile}
                          title={collapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            cn('sidebar__link', isActive && 'sidebar__link--active')
                          }
                        >
                          <span className="sidebar__link-icon">
                            <Icon size={16} />
                          </span>
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse Sidebar Toggle */}
        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
            <span>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
};

