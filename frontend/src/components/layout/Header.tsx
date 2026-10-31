import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  RefreshCw,
  Sun,
  Moon,
  Bell,
  Settings,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Repeat,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export interface HeaderProps {
  onToggleMobileMenu: () => void;
  mobileOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  mobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const fiscalPeriod = 'FY 2026-27 (Q3)';

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const notifications = [
    {
      id: 1,
      title: 'Payment Recorded',
      desc: '₹2,83,200 settled for invoice INV-2026-1048 (Nexarise)',
      time: '15m ago',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      id: 2,
      title: 'Dunning L2 Warning',
      desc: 'INV-2026-1047 overdue 6 days (Kore Tech India)',
      time: '2h ago',
      icon: AlertTriangle,
      color: 'text-rose-500',
    },
    {
      id: 3,
      title: 'Subscription Auto-Renewed',
      desc: 'Nexarise Labs renewed Enterprise Annual',
      time: '1d ago',
      icon: Repeat,
      color: 'text-primary',
    },
  ];

  return (
    <header className="topbar">
      {/* Mobile Hamburger Trigger */}
      <button
        type="button"
        className="icon-btn lg:hidden"
        onClick={onToggleMobileMenu}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        <Menu size={18} />
      </button>

      {/* Global Search Affordance */}
      <div className="topbar__search" role="search">
        <Search size={15} className="topbar__search-icon" />
        <input
          type="search"
          placeholder="Search subscriptions, invoices, customers... (Ctrl + K)"
          className="topbar__search-input"
          aria-label="Search"
        />
      </div>

      {/* Fiscal Scope Preset Indicator */}
      <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low text-xs font-semibold text-primary">
        <span className="material-symbols-outlined text-sm">calendar_month</span>
        <span>{fiscalPeriod}</span>
      </div>

      {/* Topbar Actions */}
      <div className="topbar__actions">
        {/* Refresh Action */}
        <button
          type="button"
          className="icon-btn"
          title="Refresh current data"
          onClick={handleRefresh}
        >
          <RefreshCw size={16} />
        </button>

        {/* Theme Toggle (Light/Dark) */}
        <button
          type="button"
          className="icon-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Quick Settings Shortcut */}
        <button
          type="button"
          className="icon-btn hidden sm:inline-flex"
          title="Admin Settings"
          onClick={() => navigate('/app/settings')}
        >
          <Settings size={16} />
        </button>

        <span className="topbar__divider" />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            className="icon-btn relative"
            title="Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-expanded={notificationsOpen}
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl z-50 p-2 text-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant">
                <span className="font-semibold text-on-surface">Notifications</span>
                <span className="text-[11px] font-medium text-primary bg-secondary-container px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-outline-variant/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon size={16} className={`mt-0.5 shrink-0 ${n.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-on-surface">{n.title}</p>
                          <p className="text-xs text-on-surface-variant truncate">{n.desc}</p>
                          <span className="text-[10px] text-outline mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-outline-variant text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/app/invoices');
                  }}
                  className="text-xs text-primary font-medium hover:underline py-1"
                >
                  View all billing notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="user-btn"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
          >
            <div className="user-btn__avatar bg-primary text-on-primary font-bold">
              {user?.name?.slice(0, 2).toUpperCase() || 'AM'}
            </div>
            <div className="user-btn__info hidden sm:flex">
              <span className="user-btn__name">{user?.name || 'Arjun Mehta'}</span>
              <span className="user-btn__role">{user?.role || 'ADMIN'}</span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl z-50 p-1.5 text-sm">
              <div className="px-3 py-2 border-b border-outline-variant">
                <p className="text-xs font-semibold text-on-surface">{user?.name || 'Arjun Mehta'}</p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {user?.email || 'admin@brightloop.io'}
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  Role: {user?.role || 'ADMIN'}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg text-left"
                >
                  <User size={14} />
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/app/invoices');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg text-left"
                >
                  <Receipt size={14} />
                  Manage Invoices
                </button>
              </div>

              <div className="pt-1 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-error-container/40 rounded-lg text-left"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
