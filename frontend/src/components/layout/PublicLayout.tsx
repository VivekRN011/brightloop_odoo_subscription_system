import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Repeat,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const id = hash.replace('/#', '').replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  const navLinks = [
    { label: 'Features', to: '/#features', isAnchor: true },
    { label: 'How It Works', to: '/#how-it-works', isAnchor: true },
    { label: 'Benefits', to: '/#benefits', isAnchor: true },
    { label: 'Products', to: '/products', isAnchor: false },
  ];

  return (
    <div className="min-h-screen bg-[#EDEFF4] text-[#040404] flex flex-col font-sans selection:bg-[#2346ED]/15 selection:text-[#2346ED]">
      {/* Top Notification / Context Banner */}
      <div className="bg-[#040404] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-black/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2346ED] animate-pulse"></span>
        <span>Brightloop Subscription Management</span>
        <span className="text-[#A9B6CF] hidden sm:inline">• B2B Recurring Billing &amp; Workflow System</span>
        {isAuthenticated && role === 'CUSTOMER' ? (
          <Link
            to="/portal"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 text-[#A9B6CF] hover:text-white font-medium text-[11px] ml-2 transition-colors"
          >
            <span>My Subscriber Workspace</span>
            <ArrowRight size={12} />
          </Link>
        ) : !isAuthenticated ? (
          <Link
            to="/login?redirect=/portal/catalog"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 text-[#A9B6CF] hover:text-white font-medium text-[11px] ml-2 transition-colors"
          >
            <span>Sign In to Subscribe</span>
            <ArrowRight size={12} />
          </Link>
        ) : null}
      </div>

      {/* Main Public Header */}
      <header className="sticky top-0 z-40 bg-[#EDEFF4]/90 backdrop-blur-md border-b border-[#E2E6EE] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#2346ED] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Zap size={19} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#040404]">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-[#2346ED] border border-[#E2E6EE] shadow-2xs">
                  B2B
                </span>
              </div>
              <p className="text-[10px] text-[#5A6578] -mt-0.5 hidden sm:block">
                Subscription Operations Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isAnchor ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.to)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5A6578] hover:text-[#040404] hover:bg-white/70 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors',
                    location.pathname.startsWith(link.to)
                      ? 'text-[#2346ED] bg-white shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#040404] hover:bg-white/70'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Auth / User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {role === 'CUSTOMER' ? (
                  <Button
                    onClick={() => navigate('/portal')}
                    size="sm"
                    className="bg-[#2346ED] hover:bg-[#1b37c7] active:bg-[#162fa8] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Repeat size={14} />
                    <span>My Customer Portal</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/app/dashboard')}
                    size="sm"
                    className="bg-[#040404] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                  className="text-xs text-[#5A6578] hover:text-rose-600 p-2 rounded-lg cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold text-[#040404] hover:text-[#2346ED] hover:bg-white/70 rounded-xl cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-[#2346ED] hover:bg-[#1b37c7] active:bg-[#162fa8] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
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
              className="p-2 rounded-xl text-[#040404] bg-white border border-[#E2E6EE] hover:bg-slate-50 shadow-2xs"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E2E6EE] bg-white p-5 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.to}
                    href={link.to}
                    onClick={(e) => handleAnchorClick(e, link.to)}
                    className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#040404] hover:bg-[#EDEFF4] transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#040404] hover:bg-[#EDEFF4] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <div className="pt-3 border-t border-[#E2E6EE] flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  {role === 'CUSTOMER' ? (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/portal');
                      }}
                      className="w-full bg-[#2346ED] text-white text-xs font-semibold rounded-xl py-2.5"
                    >
                      Open Customer Portal
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/app/dashboard');
                      }}
                      className="w-full bg-[#040404] text-white text-xs font-semibold rounded-xl py-2.5"
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
                    className="w-full text-xs rounded-xl border-[#E2E6EE] text-[#5A6578]"
                  >
                    Sign Out ({user?.name || user?.email})
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="text-xs font-semibold rounded-xl border-[#E2E6EE] text-[#040404]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="bg-[#2346ED] hover:bg-[#1b37c7] text-white text-xs font-semibold rounded-xl shadow-xs"
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
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Unified Marketing Footer */}
      <footer className="border-t border-[#E2E6EE] bg-white text-xs text-[#5A6578] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Brand */}
            <div className="space-y-3.5 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2346ED] text-white flex items-center justify-center font-bold shadow-2xs">
                  <Zap size={16} className="fill-white" />
                </div>
                <span className="font-bold text-base tracking-tight text-[#040404]">
                  Brightloop
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#5A6578]">
                B2B subscription management platform to configure plans, manage customer subscriptions, convert quotations, and track recurring revenue.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck size={14} />
                <span>GST Compliant • Indian Rupees (INR)</span>
              </div>
            </div>

            {/* Col 2: Platform Capabilities */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#040404]">
                Product
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/#features"
                    onClick={(e) => handleAnchorClick(e, '/#features')}
                    className="hover:text-[#2346ED] transition-colors"
                  >
                    Core Features
                  </a>
                </li>
                <li>
                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleAnchorClick(e, '/#how-it-works')}
                    className="hover:text-[#2346ED] transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="/#benefits"
                    onClick={(e) => handleAnchorClick(e, '/#benefits')}
                    className="hover:text-[#2346ED] transition-colors"
                  >
                    Why Brightloop
                  </a>
                </li>
                <li>
                  <Link to="/products" className="hover:text-[#2346ED] transition-colors">
                    Product Catalog &amp; Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Workspaces */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#040404]">
                Workspaces
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-[#2346ED] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#2346ED] transition-colors">
                    Register New Account
                  </Link>
                </li>
                <li>
                  <Link to="/portal" className="hover:text-[#2346ED] transition-colors">
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link to="/app/dashboard" className="hover:text-[#2346ED] transition-colors">
                    Operations Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Subscription Operations Workflow */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#040404]">
                Operations
              </h4>
              <p className="text-xs leading-relaxed text-[#5A6578]">
                Connected lifecycle support: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed with recurring tax invoices and payment tracking.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-[#2346ED] font-semibold">
                <Link to="/login" className="hover:underline flex items-center gap-1">
                  <span>Sign in as Admin or Staff</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#E2E6EE] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A9B6CF]">
            <p className="text-[#5A6578]">&copy; 2026 Brightloop. All rights reserved.</p>
            <p className="text-[#5A6578] font-medium">Subscriptions, Simplified.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
