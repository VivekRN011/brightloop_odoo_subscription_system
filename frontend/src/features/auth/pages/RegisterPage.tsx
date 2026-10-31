import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Zap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  Receipt,
  Repeat,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import { Button } from '@/components/ui/button';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
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
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  // Password rules checklist mandated by PRD.md FR-AUTH-03 & FR-AUTH-04
  const hasMinLength = passwordValue.length > 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setFormError(null);
      await registerAuth(data);
      // Public registration strictly assigns CUSTOMER role and redirects to /portal
      navigate('/portal', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create account. Please check your information and try again.');
      }
    }
  };

  return (
    <div className="login-page">
      {/* Left Column: Registration Form */}
      <div className="login-page__left">
        <div className="login-card my-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Zap size={22} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                  Brightloop
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Customer Registration
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Self-Service Subscriber Onboarding
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
            Create your Brightloop account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Get started with a simpler way to manage your subscriptions and billing.
          </p>

          {/* Role Boundary Notice */}
          <div className="mb-5 p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Shield size={14} className="shrink-0" />
            <span>
              Public registration creates a <strong>Subscriber Customer</strong> account. Administrative and Staff roles are provisioned internally by system administrators.
            </span>
          </div>

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

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Vikram Mehta"
                  {...register('name')}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Company / Business Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Company / Organization
              </label>
              <div className="relative">
                <Building2
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  placeholder="e.g. Apex Logistics India"
                  {...register('companyName')}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.companyName
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Business Email Address
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
                  placeholder="billing@yourcompany.com"
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

              {/* Security Requirements Checklist (FR-AUTH-03 & 04) */}
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check size={11} className={hasMinLength ? 'text-emerald-600' : 'text-slate-300'} />
                  &gt; 8 characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check size={11} className={hasUppercase ? 'text-emerald-600' : 'text-slate-300'} />
                  1 uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check size={11} className={hasLowercase ? 'text-emerald-600' : 'text-slate-300'} />
                  1 lowercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <Check size={11} className={hasSpecial ? 'text-emerald-600' : 'text-slate-300'} />
                  1 special symbol
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  {...register('confirmPassword')}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-rose-300 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Accept Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] leading-relaxed">
                  I agree to the Brightloop Subscription Terms of Service and Privacy Policy.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 mt-2"
            >
              {isSubmitting ? (
                <span>Creating customer account...</span>
              ) : (
                <>
                  <span>Complete Customer Registration</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Subscriber Benefits Panel */}
      <aside className="login-page__right" aria-label="Subscriber Portal Benefits">
        <div className="login-page__panel">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
            Dedicated Customer Self-Service
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Instant visibility into your recurring subscriptions.
          </h2>
          <p className="text-sm leading-relaxed text-indigo-100 max-w-lg">
            As a subscriber, manage your active software subscriptions, review itemized billing statements, and access official GST tax invoices from a dedicated self-service portal.
          </p>

          <ul className="space-y-4 mt-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Repeat size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Real-Time Plan Oversight
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Inspect subscription numbers, active seats, add-on storage, and upcoming renewal dates.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Receipt size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  GST Tax Invoices on Demand
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Download tax invoice PDFs with company GSTIN and itemized HSN/SAC codes for input tax credit.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-indigo-200" />
              </div>
              <div>
                <strong className="text-xs font-semibold block text-white">
                  Payment History &amp; Balance Tracking
                </strong>
                <span className="text-[11px] text-indigo-100">
                  Monitor settled invoices, pending payment dues, and verified payment allocations.
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-indigo-400/30 flex items-center justify-between text-xs text-indigo-200">
            <span>Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026</span>
            <span className="font-semibold text-white">Subscriber Portal</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

