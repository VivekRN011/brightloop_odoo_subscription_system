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
  CheckCircle2,
  Repeat,
  Receipt,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { DEMO_USERS } from '../services/auth.service';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Forgot password interactive state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{
    success: boolean;
    message: string;
    resetToken?: string;
  } | null>(null);

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
    getValues,
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

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus({
        success: true,
        message: res.data?.message || 'Password reset email sent!',
        resetToken: res.data?.data?.devResetToken,
      });
    } catch (err: any) {
      setForgotStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch reset email.',
      });
    } finally {
      setForgotLoading(false);
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
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                Brightloop
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                Subscription Management
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to access your Brightloop workspace.
            </p>
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Interactive Forgot Password Box */}
          {forgotModalOpen && (
            <div className="p-4 mb-5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Mail size={15} className="text-indigo-600" />
                  Reset Password via Nodemailer
                </span>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                Enter your account email. We will send a secure password reset link to your inbox.
              </p>
              <form onSubmit={handleSendResetEmail} className="space-y-2">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full h-9 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  {forgotLoading ? 'Dispatching via Nodemailer...' : 'Send Reset Link'}
                </Button>
              </form>

              {forgotStatus && (
                <div
                  className={`mt-3 p-2.5 rounded-lg text-[11px] ${
                    forgotStatus.success
                      ? 'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100/80 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    {forgotStatus.success ? (
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <span>{forgotStatus.message}</span>
                  </div>

                  {forgotStatus.resetToken && (
                    <div className="mt-2 pt-2 border-t border-emerald-300/60 dark:border-emerald-800/60">
                      <Link
                        to={`/reset-password/${forgotStatus.resetToken}`}
                        className="font-bold underline text-emerald-950 dark:text-emerald-200 flex items-center gap-1"
                      >
                        👉 Open Password Reset Page now
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
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
                  placeholder="admin@brightloop.io"
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

            {/* Password Field */}
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
                  onClick={() => {
                    const currentEmail = getValues('email');
                    setForgotEmail(currentEmail || '');
                    setForgotStatus(null);
                    setForgotModalOpen(true);
                  }}
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
                <span className="login-demo__email">admin@brightloop</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('staff')}
                className="login-demo__btn"
              >
                <span className="login-demo__role">Staff</span>
                <span className="login-demo__email">staff@brightloop</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="login-demo__btn"
              >
                <span className="login-demo__role">Customer</span>
                <span className="login-demo__email">sarah.chen</span>
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
