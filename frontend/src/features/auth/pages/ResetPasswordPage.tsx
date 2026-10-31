import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password.length <= 8) {
      setError('Password must be greater than 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired or is invalid.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col justify-center items-center px-4 py-12 selection:bg-secondary-container selection:text-on-secondary-container">
      <div className="w-full max-w-md bg-card-pure rounded-2xl shadow-sm border border-outline-variant/70 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-7">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs ring-1 ring-primary/20 shrink-0">
            <span className="material-symbols-outlined fill text-2xl">autorenew</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-lg text-[#0F090B] tracking-tight">
                Brightloop
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-container text-primary border border-outline-variant/40">
                Security
              </span>
            </div>
            <span className="block text-[11px] text-on-surface-variant font-medium">
              Subscription Management &amp; Billing
            </span>
          </div>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[26px]">check_circle</span>
            </div>
            <h2 className="text-xl font-bold font-headline text-[#0F090B] mb-2 tracking-tight">
              Password Updated Successfully!
            </h2>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Your account password has been updated. You can now sign in to your workspace with your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>Back to Sign In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold font-headline text-[#0F090B] tracking-tight mb-1.5">
              Set New Password
            </h2>
            <p className="text-xs text-on-surface-variant mb-6 font-normal">
              Please enter and confirm your new secure password.
            </p>

            {error && (
              <div className="p-3.5 mb-5 rounded-xl bg-error-container/70 border border-error/30 text-xs text-on-error-container flex items-start gap-2.5 shadow-2xs">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                  error
                </span>
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-outline-variant bg-card-pure text-on-surface text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70 shadow-2xs"
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
                <p className="text-[10px] text-on-surface-variant mt-1.5">
                  Must be &gt;8 characters with uppercase, lowercase, and a special character.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-outline-variant bg-card-pure text-on-surface text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70 shadow-2xs"
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
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-outline-variant/40 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
