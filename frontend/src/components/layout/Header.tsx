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
      desc: '₹45,000 received for invoice INV-2026-0891',
      time: '15m ago',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      id: 2,
      title: 'Invoice Overdue',
      desc: 'INV-2026-0894 past due date (Orion Cloud)',
      time: '2h ago',
      icon: AlertTriangle,
      color: 'text-rose-500',
    },
    {
      id: 3,
      title: 'Subscription Activated',
      desc: 'Zenith Tech upgraded to Enterprise Plan',
      time: '1d ago',
      icon: Repeat,
      color: 'text-indigo-500',
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
          placeholder="Search subscriptions, invoices, customers..."
          className="topbar__search-input"
          aria-label="Search"
        />
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-2 text-sm animate-in fade-in-50 slide-in-from-top-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </span>
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon size={16} className={`mt-0.5 shrink-0 ${n.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/app/invoices');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline py-1"
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
            <div className="user-btn__avatar">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'AD'}
            </div>
            <div className="user-btn__info hidden sm:flex">
              <span className="user-btn__name">{user?.name || 'Administrator'}</span>
              <span className="user-btn__role">{user?.role || 'ADMIN'}</span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-1.5 text-sm animate-in fade-in-50 slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'admin@brightloop.io'}
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Receipt size={14} />
                  Manage Invoices
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
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

