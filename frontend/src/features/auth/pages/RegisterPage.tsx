import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already authenticated as Customer, redirect to portal; if Admin/Staff, redirect to app
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordValue = watch('password') || '';

  const passwordChecks = [
    { label: 'At least 9 characters', met: passwordValue.length >= 9 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'One special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setFormError(null);
      await registerAuth(data);
      navigate('/portal', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Registration could not be completed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
      {/* ================= LEFT COLUMN: REGISTRATION FORM ================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto w-full">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-[480px] mx-auto">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Sign In</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/60 text-[11px] font-medium text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Subscriber Onboarding</span>
          </div>
        </div>

        {/* Center Main Card Form Area */}
        <div className="w-full max-w-[480px] mx-auto my-auto py-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs ring-1 ring-primary/20 shrink-0">
              <span className="material-symbols-outlined fill text-2xl">autorenew</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xl text-[#0F090B] tracking-tight">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-container text-primary border border-outline-variant/40">
                  Customer Portal
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Self-Service Subscriber Onboarding
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F090B] tracking-tight font-headline">
              Create customer account
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 font-normal">
              Manage your subscriptions, view invoices, and track renewals in one place.
            </p>
          </div>

          {/* Role Boundary Notice */}
          <div className="mb-5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/70 text-[11px] text-on-surface-variant flex items-start gap-2.5 leading-relaxed">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
              shield_person
            </span>
            <span>
              Public registration provisions a <strong>Subscriber Customer</strong> account.
              Administrative and billing staff accounts are managed internally.
            </span>
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-on-surface mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Vikram Mehta"
                  {...register('name')}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs bg-card-pure text-on-surface focus:outline-none focus:ring-2 transition-all placeholder:text-outline/70 shadow-2xs ${
                    errors.name
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant/70 focus:border-primary focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-xs font-semibold text-on-surface mb-1.5"
              >
                Company / Organization Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  domain
                </span>
                <input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  {...register('companyName')}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs bg-card-pure text-on-surface focus:outline-none focus:ring-2 transition-all placeholder:text-outline/70 shadow-2xs ${
                    errors.companyName
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant/70 focus:border-primary focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1.5 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.companyName.message}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
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
                  placeholder="vikram@company.com"
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-on-surface mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

              {/* Password Requirements Checklist */}
              {passwordValue && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 text-[11px] space-y-1">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className={`flex items-center gap-1.5 ${
                        check.met ? 'text-emerald-700' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {check.met ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-on-surface mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  lock
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  {...register('confirmPassword')}
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border text-xs bg-card-pure text-on-surface focus:outline-none focus:ring-2 transition-all placeholder:text-outline/70 shadow-2xs ${
                    errors.confirmPassword
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant/70 focus:border-primary focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.confirmPassword.message}</span>
                </p>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant font-normal select-none">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="w-4 h-4 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary/30 accent-[#743746] cursor-pointer shrink-0"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-primary font-medium underline">Terms of Service</span> and{' '}
                  <span className="text-primary font-medium underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-[11px] text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  <span>{errors.acceptTerms.message}</span>
                </p>
              )}
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
                  <span>Creating Customer Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Customer Registration</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-outline-variant/40 text-center text-xs text-on-surface-variant">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-container hover:underline transition-colors"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="w-full max-w-[480px] mx-auto text-center text-[11px] text-outline pt-4">
          <span>Brightloop Customer Portal • Odoo Enterprise Baseline</span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: EDITORIAL BENEFITS PANEL ================= */}
      <aside
        className="lg:flex-1 hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#180E12] text-white selection:bg-primary-container selection:text-white"
        aria-label="Brightloop Subscriber Portal Benefits"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_75%_25%,rgba(144,78,93,0.32),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[radial-gradient(circle_at_20%_80%,rgba(114,55,70,0.22),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col justify-between h-full w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#ffd3da] tracking-wide mb-6 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb1c1] animate-pulse"></span>
              <span>Subscriber Self-Service Portal</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight font-headline leading-[1.18]">
              Instant visibility into your recurring services &amp; billing.
            </h2>

            <p className="text-sm text-[#e0bec0] leading-relaxed mt-4 font-normal">
              Manage your active subscriptions, review itemized billing statements, and download
              official GST tax invoices from a dedicated, secure self-service portal.
            </p>
          </div>

          <div className="my-8 space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">autorenew</span>
              </div>
              <div className="flex-1">
                <strong className="text-xs font-semibold block text-white">
                  Real-Time Plan Oversight
                </strong>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Inspect active subscription identifiers, plan tiers, add-on storage, and upcoming renewal dates.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">receipt_long</span>
              </div>
              <div className="flex-1">
                <strong className="text-xs font-semibold block text-white">
                  GST Tax Invoices on Demand
                </strong>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Download tax invoice PDFs with company GSTIN and itemized HSN/SAC codes for input tax credit.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 text-[#ffd3da] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">check_circle</span>
              </div>
              <div className="flex-1">
                <strong className="text-xs font-semibold block text-white">
                  Settled Payments &amp; Due Tracking
                </strong>
                <span className="text-[11px] text-[#e0bec0] leading-relaxed block mt-0.5">
                  Monitor settled invoices, pending payment dues, and verified bank receipts in Indian Rupees (₹).
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#cbc5c6]">
            <span>Odoo Hackathon 2026 • Enterprise Edition</span>
            <span className="font-medium text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">
                verified
              </span>
              Subscriber Access
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
