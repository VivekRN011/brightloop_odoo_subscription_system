import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = isAuthenticated && role === 'CUSTOMER'
    ? [
        { label: 'Home', to: '/' },
        { label: 'Public Catalog', to: '/products' },
        { label: 'Customer Portal', to: '/portal' },
        { label: 'Services & Subscriptions', to: '/portal/catalog' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Products & Services', to: '/products' },
        { label: 'Pricing & Plans', to: '/#plans' },
      ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Banner for Hackathon Context */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white text-xs py-2 px-4 text-center font-medium shadow-xs flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-amber-300" />
        <span>
          Odoo x Make-A-Ton 9.0 Hackathon • Explore Brightloop Recurring Billing &amp; Self-Service
        </span>
        {isAuthenticated && role === 'CUSTOMER' ? (
          <Link
            to="/portal"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:text-white/90 font-semibold text-[11px] ml-2"
          >
            <span>My Subscriber Workspace</span>
            <ArrowRight size={12} />
          </Link>
        ) : (
          <Link
            to="/login?redirect=/portal/catalog"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:text-white/90 font-semibold text-[11px] ml-2"
          >
            <span>Sign In to Subscribe</span>
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* Main Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap size={19} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-950 dark:text-white">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Subscription Management &amp; Billing
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth / User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {role === 'CUSTOMER' ? (
                  <Button
                    onClick={() => navigate('/portal')}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Repeat size={14} />
                    <span>My Customer Portal</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/app/dashboard')}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <LayoutDashboard size={14} />
                    <span>Admin Console</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-2"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {role === 'CUSTOMER' ? (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/portal');
                      }}
                      className="w-full bg-indigo-600 text-white text-xs font-semibold"
                    >
                      Open Customer Portal
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/app/dashboard');
                      }}
                      className="w-full bg-slate-900 text-white text-xs font-semibold"
                    >
                      Open Admin Dashboard
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-xs"
                  >
                    Sign Out ({user?.name || user?.email})
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="text-xs"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Zap size={16} className="fill-white" />
                </div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Brightloop
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Enterprise recurring billing, product variants, quotation workflows, and subscriber self-service for the modern SaaS economy.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck size={14} />
                <span>GST Compliant • Indian Rupees (INR)</span>
              </div>
            </div>

            {/* Col 2: Software Catalog */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Products &amp; Add-ons
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products/prod-core-billing" className="hover:text-indigo-600 transition-colors">
                    Core Billing Engine
                  </Link>
                </li>
                <li>
                  <Link to="/products/prod-addon-analytics" className="hover:text-indigo-600 transition-colors">
                    Advanced Analytics &amp; Forecasting
                  </Link>
                </li>
                <li>
                  <Link to="/products/prod-sup-sla" className="hover:text-indigo-600 transition-colors">
                    Technical Support SLA Package
                  </Link>
                </li>
                <li>
                  <Link to="/products/prod-api-suite" className="hover:text-indigo-600 transition-colors">
                    Developer API &amp; Webhooks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Portal */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Subscriber Workspace
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/portal" className="hover:text-indigo-600 transition-colors">
                    Customer Portal Overview
                  </Link>
                </li>
                <li>
                  <Link to="/portal/subscriptions" className="hover:text-indigo-600 transition-colors">
                    My Subscriptions
                  </Link>
                </li>
                <li>
                  <Link to="/portal/invoices" className="hover:text-indigo-600 transition-colors">
                    Tax Invoices &amp; Receipts
                  </Link>
                </li>
                <li>
                  <Link to="/portal/catalog" className="hover:text-indigo-600 transition-colors">
                    Services &amp; Subscription Setup
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Hackathon Context */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Hackathon Solution
              </h4>
              <p className="text-xs leading-relaxed text-slate-500">
                Developed for <strong>Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026</strong>. Implements full subscription lifecycle: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <Link to="/login" className="hover:underline flex items-center gap-1">
                  <span>Sign in as Admin or Staff</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>&copy; 2026 Brightloop Subscription Management. All rights reserved.</p>
            <p>Designed for Odoo x Make-A-Ton 9.0 • Vital Admin System Tokens</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

