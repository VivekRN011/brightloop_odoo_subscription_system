import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';
import { DEMO_USERS } from '../services/auth.service';
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
        message: res.data?.message || 'Password reset link dispatched successfully.',
        resetToken: res.data?.data?.devResetToken,
      });
    } catch (err: any) {
      setForgotStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch reset email. Please try again.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
      {/* ================= LEFT COLUMN: SIGN IN FORM ================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto w-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-[480px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Brightloop</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/60 text-[11px] font-medium text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Odoo 2026 Core</span>
          </div>
        </div>

        {/* Center Main Card Form Area */}
        <div className="w-full max-w-[480px] mx-auto my-auto py-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 mb-7">
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs ring-1 ring-primary/20 shrink-0">
              <span className="material-symbols-outlined fill text-2xl">autorenew</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xl text-[#0F090B] tracking-tight">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-container text-primary border border-outline-variant/40">
                  B2B SaaS
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Subscription Management &amp; Billing System
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F090B] tracking-tight font-headline">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 font-normal">
              Enter your credentials to access your Brightloop workspace.
            </p>
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="p-3.5 mb-5 rounded-xl bg-error-container/70 border border-error/30 text-xs text-on-error-container flex items-start gap-2.5 shadow-2xs animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                error
              </span>
              <span className="leading-relaxed font-medium">{formError}</span>
            </div>
          )}

          {/* Interactive Forgot Password Card */}
          {forgotModalOpen && (
            <div className="p-4.5 mb-6 rounded-xl bg-surface-container-low border border-outline-variant/70 text-xs shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-on-surface flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[17px] text-primary">
                    mark_email_unread
                  </span>
                  Send Password Reset Link
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotStatus(null);
                  }}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-md text-xs transition-colors"
                  aria-label="Close reset password dialog"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
                Enter your account email. We will generate a secure reset link to recover your credentials.
              </p>
              <form onSubmit={handleSendResetEmail} className="space-y-2.5">
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter registered email (e.g. admin@brightloop.io)"
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-outline-variant/70 text-xs bg-card-pure text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-9 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Dispatching Link...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>
              </form>

              {forgotStatus && (
                <div
                  className={`mt-3 p-3 rounded-lg text-[11px] ${
                    forgotStatus.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-error-container/70 text-on-error-container border border-error/30'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[15px] shrink-0 mt-0.5 ${
                        forgotStatus.success ? 'text-emerald-700' : 'text-error'
                      }`}
                    >
                      {forgotStatus.success ? 'check_circle' : 'error'}
                    </span>
                    <span className="leading-snug">{forgotStatus.message}</span>
                  </div>

                  {forgotStatus.resetToken && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-200/80">
                      <Link
                        to={`/reset-password/${forgotStatus.resetToken}`}
                        className="font-bold underline text-emerald-950 flex items-center gap-1 hover:text-emerald-800"
                      >
                        <span>👉 Open Password Reset Page now</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-on-surface mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@brightloop.io"
                  {...register('email')}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs bg-card-pure text-on-surface focus:outline-none focus:ring-2 transition-all placeholder:text-outline/70 shadow-2xs ${
                    errors.email
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant/70 focus:border-primary focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-on-surface"
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
                  className="text-xs font-semibold text-primary hover:text-primary-container hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register('password')}
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border text-xs bg-card-pure text-on-surface focus:outline-none focus:ring-2 transition-all placeholder:text-outline/70 shadow-2xs ${
                    errors.password
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant/70 focus:border-primary focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-on-surface-variant font-normal select-none">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 accent-[#743746] cursor-pointer"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Authenticating credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Credentials Bar */}
          <div className="mt-8 p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  verified_user
                </span>
                Quick-Fill Demo Credentials
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">Click to populate</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="group p-2.5 rounded-lg border border-outline-variant/60 bg-card-pure hover:border-primary/50 hover:bg-surface-container-high transition-all text-left flex flex-col justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary-container text-primary">
                    Admin
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors">
                    login
                  </span>
                </div>
                <span className="text-[11px] font-medium text-on-surface truncate mt-1.5">
                  admin@brightloop.io
                </span>
                <span className="text-[10px] text-on-surface-variant">Full Ops Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('staff')}
                className="group p-2.5 rounded-lg border border-outline-variant/60 bg-card-pure hover:border-primary/50 hover:bg-surface-container-high transition-all text-left flex flex-col justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    Staff
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors">
                    login
                  </span>
                </div>
                <span className="text-[11px] font-medium text-on-surface truncate mt-1.5">
                  staff@brightloop.io
                </span>
                <span className="text-[10px] text-on-surface-variant">Billing Operations</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="group p-2.5 rounded-lg border border-outline-variant/60 bg-card-pure hover:border-primary/50 hover:bg-surface-container-high transition-all text-left flex flex-col justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    Customer
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors">
                    login
                  </span>
                </div>
                <span className="text-[11px] font-medium text-on-surface truncate mt-1.5">
                  sarah.chen@acme.inc
                </span>
                <span className="text-[10px] text-on-surface-variant">Portal Subscriber</span>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-outline-variant/40 text-center text-xs text-on-surface-variant">
            <span>Don't have an enterprise account? </span>
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary-container hover:underline transition-colors"
            >
              Create customer portal account
            </Link>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="w-full max-w-[480px] mx-auto text-center text-[11px] text-outline pt-4">
          <span>Brightloop Subscription Management • Odoo Enterprise Baseline</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: EDITORIAL SAAS VALUE PROPOSITION ================= */}
      <aside
        className="lg:flex-1 hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#180E12] text-white selection:bg-primary-container selection:text-white"
        aria-label="Brightloop Platform Overview"
      >
        {/* Subtle Ambient Radial Glows (matching Cecillia Yo warm burgundy palette) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_75%_25%,rgba(144,78,93,0.32),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[radial-gradient(circle_at_20%_80%,rgba(114,55,70,0.22),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col justify-between h-full w-full">
          {/* Top Hero Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#ffd3da] tracking-wide mb-6 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb1c1] animate-pulse"></span>
              <span>B2B Subscription Management &amp; Billing</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight font-headline leading-[1.18]">
              Automate your recurring revenue from quote to payment.
            </h2>

            <p className="text-sm text-[#e0bec0] leading-relaxed mt-4 font-normal">
              Engineered for Indian SaaS businesses. Streamline multi-cadence recurring billing,
              native GST compliance, IRN e-invoicing, and customer self-service on autopilot.
            </p>
          </div>

          {/* Center 4 Feature Cards */}
          <div className="my-8 space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">autorenew</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-semibold block text-white">
                    Subscription Lifecycle Orchestration
                  </strong>
                  <span className="text-[10px] text-[#ffd3da] font-medium bg-white/10 px-2 py-0.5 rounded-full">
                    Automated
                  </span>
                </div>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Track Active, Quotation, Confirmed, Paused, and Closed states with automatic billing eligibility.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">receipt_long</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-semibold block text-white">
                    Automated Tax Invoicing &amp; GST
                  </strong>
                  <span className="text-[10px] text-[#ffd3da] font-medium bg-white/10 px-2 py-0.5 rounded-full">
                    100% Compliant
                  </span>
                </div>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Deterministic recurring invoice generation preventing duplicate cycles. Dual CGST/SGST and IGST rules.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">account_balance_wallet</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-semibold block text-white">
                    Multi-Channel Collections &amp; E-Mandates
                  </strong>
                  <span className="text-[10px] text-[#ffd3da] font-medium bg-white/10 px-2 py-0.5 rounded-full">
                    Instant Ledger
                  </span>
                </div>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Record UPI, bank transfers, RBI e-Mandates, and track overdue collections in Indian Rupees (₹).
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">shield_person</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-semibold block text-white">
                    Isolated Customer Portal
                  </strong>
                  <span className="text-[10px] text-[#ffd3da] font-medium bg-white/10 px-2 py-0.5 rounded-full">
                    Self-Service
                  </span>
                </div>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Subscribers securely inspect active plans, review payment history, and download GST tax invoices.
                </span>
              </div>
            </div>
          </div>

          {/* Mini Operational Performance Snapshot Card */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-[#e0bec0] mb-3">
              <span className="font-semibold flex items-center gap-1.5 text-white">
                <span className="material-symbols-outlined text-[16px] text-[#ffb1c1]">
                  query_stats
                </span>
                Operational Health Metrics
              </span>
              <span className="text-[10px] text-[#ffd3da] bg-white/10 px-2 py-0.5 rounded-full font-medium">
                Real-Time
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="text-base font-bold text-white font-headline">1,428</div>
                <div className="text-[10px] text-[#e0bec0]">Active Subscriptions</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="text-base font-bold text-white font-headline">₹38,45,200</div>
                <div className="text-[10px] text-[#e0bec0]">Monthly MRR</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="text-base font-bold text-emerald-400 font-headline">99.8%</div>
                <div className="text-[10px] text-[#e0bec0]">Billing Accuracy</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#cbc5c6]">
            <span>Odoo Hackathon 2026 • Enterprise Edition</span>
            <span className="font-medium text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">
                lock
              </span>
              Dual GST Ready
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
