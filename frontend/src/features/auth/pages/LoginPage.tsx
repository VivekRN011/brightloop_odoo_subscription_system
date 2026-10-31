import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Zap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Repeat,
  Receipt,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { DEMO_USERS } from '../services/auth.service';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState(false);

  // If already authenticated, redirect to appropriate destination
  React.useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'CUSTOMER') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@brightloop.io',
      password: 'Brightloop@2026',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setFormError(null);
      const user = await login(data);

      // Check destination from state or redirect according to authenticated role
      const fromPath = (location.state as { from?: string } | null)?.from;
      if (fromPath && !fromPath.startsWith('/login')) {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'CUSTOMER') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred during login. Please try again.');
      }
    }
  };

  const handleFillDemo = (type: 'admin' | 'staff' | 'customer') => {
    const demo = DEMO_USERS[type];
    if (demo) {
      setValue('email', demo.email);
      setValue('password', demo.passwordHint);
      setFormError(null);
    }
  };

  return (
    <div className="login-page">
      {/* Left Column: Sign In Form */}
      <div className="login-page__left">
        <div className="login-card">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Zap size={22} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Sign In
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Subscription & Recurring Billing Management
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
            Sign in to your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Enter your credentials to access your administrative workspace or customer portal.
          </p>

          {/* Error Alert */}
          {formError && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetNotice(true)}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register('password')}
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {resetNotice && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
                Password reset link dispatch is configured via Nodemailer. For demonstration, click any of the role cards below to pre-fill credentials.
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="login-demo">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-600" />
                Quick-Fill Demo Credentials
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="login-demo__grid">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="login-demo__btn"
              >
                <span className="login-demo__role">Admin</span>
                <span className="login-demo__email">alex.morgan</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff')}
                className="login-demo__btn"
              >
                <span className="login-demo__role">Staff</span>
                <span className="login-demo__email">staff.member</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="login-demo__btn"
              >
                <span className="login-demo__role">Customer</span>
                <span className="login-demo__email">billing@apex</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create customer account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Branded Value Proposition */}
      <aside className="login-page__right" aria-label="Brightloop Platform Overview">
        <div className="login-page__panel">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
            Subscription &amp; Billing Management
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Automate your recurring revenue from quote to payment.
          </h2>
          <p className="text-sm leading-relaxed text-indigo-100 max-w-lg">
            Brightloop centralizes plans, variants, quotation conversion, automated recurring invoicing, and a dedicated self-service customer portal for modern subscription businesses.
          </p>

          <ul className="space-y-4 mt-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Repeat size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Complete Subscription Lifecycle
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Track Active, Quotation, Confirmed, Paused, and Closed states with automated billing eligibility.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Receipt size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Recurring Tax Invoicing
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Automated generation from active subscriptions preventing duplicate billing periods with GST rules.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Payment Recording &amp; Overdue Visibility
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Record bank transfers, UPI, cheques, and track outstanding overdue balances in Indian Rupees.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <UserCheck size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Isolated Customer Self-Service
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Subscribers securely view their own plans, download GST tax invoices, and monitor renewals.
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-indigo-400/30 flex items-center justify-between text-xs text-indigo-200">
            <span>Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026</span>
            <span className="font-semibold text-white">v1.0 Baseline</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

