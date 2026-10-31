import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Zap, Repeat, Receipt, User, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const PortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', to: '/portal', end: true, icon: Zap },
    { label: 'My Subscriptions', to: '/portal/subscriptions', icon: Repeat },
    { label: 'My Invoices', to: '/portal/invoices', icon: Receipt },
    { label: 'Profile & Tax Details', to: '/portal/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f8] dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Portal Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
            <Zap size={18} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">Brightloop</span>
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
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || 'Customer Account'}
            </span>
            <span className="text-[11px] text-slate-400">
              {user?.email || 'subscriber@apexlogistics.in'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs flex items-center gap-1.5"
            title="Switch user account"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Switch Account</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
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
                    'flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        Brightloop Subscription Self-Service • Odoo x Make-A-Ton 9.0 Hackathon 2026
      </footer>
    </div>
  );
};

