import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  Zap,
  Repeat,
  Receipt,
  CreditCard,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const PortalLayout: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  // If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Overview', to: '/portal', end: true, icon: Zap },
    { label: 'My Subscriptions', to: '/portal/subscriptions', icon: Repeat },
    { label: 'My Invoices', to: '/portal/invoices', icon: Receipt },
    { label: 'Payment History', to: '/portal/payments', icon: CreditCard },
    { label: 'Profile & Tax Details', to: '/portal/profile', icon: User },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* If Admin or Staff is previewing Customer Portal */}
      {(role === 'ADMIN' || role === 'STAFF') && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-6 py-2 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Staff Preview:</strong> You are viewing the Customer Self-Service Portal as an internal {role} user.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/dashboard')}
            className="h-6 text-[11px] px-2.5 bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center gap-1.5"
          >
            <LayoutDashboard size={12} />
            <span>Return to Admin Console</span>
          </Button>
        </div>
      )}

      {/* Portal Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
            <Zap size={18} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Brightloop
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Customer Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Self-Service Subscriber Workspace
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:flex flex-col text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Customer Account'}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {user?.email || 'subscriber@apexlogistics.in'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs flex items-center gap-1.5 h-8"
            title="Switch user account"
          >
            <ArrowRightLeft size={13} />
            <span className="hidden sm:inline">Switch Role</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 h-8 w-8"
            title="Sign out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Portal Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Portal Content Region */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        Brightloop Subscription Self-Service • Odoo x Make-A-Ton 9.0 Hackathon 2026
      </footer>
    </div>
  );
};
