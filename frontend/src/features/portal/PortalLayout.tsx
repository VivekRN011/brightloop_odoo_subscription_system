import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate, Link } from 'react-router-dom';
import {
  Zap,
  Repeat,
  Receipt,
  CreditCard,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Layers,
  ArrowRightLeft,
  Plus,
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
    { label: 'Services & Catalog', to: '/portal/catalog', icon: Layers },
    { label: 'My Subscriptions', to: '/portal/subscriptions', icon: Repeat },
    { label: 'My Invoices', to: '/portal/invoices', icon: Receipt },
    { label: 'Payment History', to: '/portal/payments', icon: CreditCard },
    { label: 'Profile & Tax Details', to: '/portal/profile', icon: User },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'SC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f3f5f9] dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
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

      {/* Modernized Portal Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link to="/portal" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap size={18} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-950 dark:text-white">
                  Brightloop
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Customer Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Self-Service Subscriber Workspace
              </p>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link to="/portal/catalog">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 px-3.5 flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Subscription</span>
              <span className="sm:hidden">Subscribe</span>
            </Button>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'Sarah Chen'}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                {user?.email || 'sarah.chen@acme.inc'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs flex items-center gap-1 h-8 px-2.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            title="Switch demo role"
          >
            <ArrowRightLeft size={12} />
            <span className="hidden lg:inline">Switch Role</span>
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
            <LogOut size={15} />
          </Button>
        </div>
      </header>

      {/* Portal Navigation Bar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-0.5">
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
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        Brightloop Subscription Self-Service • Odoo x Make-A-Ton 9.0 Hackathon 2026
      </footer>
    </div>
  );
};
