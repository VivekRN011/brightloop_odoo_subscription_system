import React from 'react';
import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const { user, role } = useAuth();

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
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm ring-1 ring-primary/20 shrink-0">
            <span className="material-symbols-outlined fill text-xl">autorenew</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-base text-on-surface tracking-tight">Brightloop</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">Billing &amp; Subscriptions</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar__nav">
          {ADMIN_NAV_SECTIONS.map((section) => {
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
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-secondary-container text-on-secondary-container">
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

        {/* Enterprise Fleet Tier Widget & User Chip (from Stitch shared specs) */}
        {!collapsed && (
          <div className="px-3 py-2 border-t border-outline-variant/60 space-y-2">
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/50 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface">
                <span>Enterprise Fleet Tier</span>
                <span className="text-primary font-bold">28%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '28%' }}></div>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">1,428 / 5,000 Active Contracts</div>
            </div>

            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
              <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'AM'}
              </div>
              <div className="flex-1 truncate text-left">
                <div className="text-xs font-bold text-on-surface truncate">
                  {user?.name || 'Arjun Mehta'}
                </div>
                <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{role === 'ADMIN' ? 'Platform Admin' : 'Staff Member'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
