'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Mail, ShieldCheck, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStoreContext } from '@/components/providers/StoreProvider';
import { UserRole } from '@/types';

const destinations: Record<UserRole, string> = {
  buyer: '/account',
  admin: '/admin',
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticate } = useStoreContext();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Forgot password & OTP reset states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  // Check URL query parameters for direct reset email link
  useEffect(() => {
    const action = searchParams.get('action');
    const paramEmail = searchParams.get('email');
    const paramOtp = searchParams.get('otp');
    const paramToken = searchParams.get('token');

    if (action === 'reset' && paramEmail) {
      setResetEmail(paramEmail);
      if (paramOtp) setResetOtp(paramOtp);
      if (paramToken) setResetToken(paramToken);
      setResetStep(2);
      setShowForgotModal(true);
    }
  }, [searchParams]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : {
              full_name: fullName,
              email,
              password,
              phone,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to continue');

      const account = result.profile || result.user || {};
      const role: UserRole = account.role === 'admin' ? 'admin' : 'buyer';

      await authenticate({
        id: account.id || `user-${Date.now()}`,
        email: account.email || email,
        full_name: account.full_name || fullName || email.split('@')[0],
        phone: account.phone || phone,
        role,
        created_at: account.created_at || new Date().toISOString(),
        updated_at: account.updated_at || new Date().toISOString(),
      });

      router.push(destinations[role]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsResetSubmitting(true);
    setResetMessage(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      if (data.token) setResetToken(data.token);
      setResetStep(2);
      setResetMessage({
        text: 'A 6-digit verification code has been sent to your email address.',
        type: 'success',
      });
    } catch (err) {
      setResetMessage({
        text: err instanceof Error ? err.message : 'Unable to send verification code',
        type: 'error',
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsResetSubmitting(true);
    setResetMessage(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          token: resetToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setResetMessage({
        text: 'Your password has been reset successfully! You can now sign in.',
        type: 'success',
      });

      setTimeout(() => {
        setShowForgotModal(false);
        setMode('login');
        setEmail(resetEmail);
        setPassword('');
        setResetStep(1);
        setResetMessage(null);
      }, 2000);
    } catch (err) {
      setResetMessage({
        text: err instanceof Error ? err.message : 'Unable to update password',
        type: 'error',
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-brown-deep sm:px-6 lg:py-16">
      <div className="mx-auto max-w-md text-center">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brown-deep/55 hover:text-brown-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to storefront
        </button>
        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">
          Bizzare Fragrances <span className="text-[10px] normal-case tracking-normal font-normal">(by Bizzare)</span>
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          {mode === 'login' ? 'Client Sign-In' : 'Create Your Account'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-brown-deep/65">
          {mode === 'login'
            ? 'Sign in to access your client account and track your orders.'
            : 'Register a client account to follow your fragrance orders and save your delivery details.'}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-cream-border bg-white p-6 shadow-card-soft sm:p-8">
        <div className="mb-6 grid grid-cols-2 border-b border-cream-border">
          {(['login', 'signup'] as const).map((item) => (
            <button
              key={item}
              onClick={() => {
                setMode(item);
                setMessage('');
              }}
              className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                mode === item ? 'border-brown text-brown' : 'border-transparent text-brown-deep/45'
              }`}
            >
              {item === 'login' ? 'Sign in' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                Full Name *
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
              placeholder="you@example.com"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                Phone Number <span className="font-normal text-brown-deep/50">(optional)</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 font-mono text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                placeholder="+234..."
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                Password *
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetStep(1);
                    setResetMessage(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-brown hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft pr-11 pl-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                placeholder="At least 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-deep/40 transition-colors hover:text-brown-deep"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
              {message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brown text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-brown-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 border-t border-cream-border pt-4 text-xs text-brown-deep/60">
          <ShieldCheck className="h-4 w-4 text-brown" />
          <span>Encrypted session with secure cookie authentication.</span>
        </div>
      </div>

      {/* Forgot Password & OTP Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-deep/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cream-border bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cream-border">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brown" />
                <h3 className="font-serif text-lg font-bold text-brown-deep">
                  {resetStep === 1 ? 'Password Recovery' : 'Verify Security OTP'}
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="rounded-lg p-1 text-brown-deep/50 hover:bg-cream-soft hover:text-brown-deep"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetMessage && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-bold ${
                  resetMessage.type === 'success'
                    ? 'border border-green-200 bg-green-50 text-green-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {resetMessage.text}
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="mt-4 space-y-4">
                <p className="text-xs leading-5 text-brown-deep/70">
                  Enter your registered email address and we will dispatch a secure 6-digit OTP code to reset your password.
                </p>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                    Email Address *
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-brown-deep/40" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-cream-border bg-cream-soft pl-10 pr-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="h-11 flex-1 rounded-xl border border-cream-border text-xs font-bold uppercase tracking-wider text-brown-deep/70 hover:bg-cream-soft"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetSubmitting}
                    className="h-11 flex-1 rounded-xl bg-brown text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover disabled:opacity-60"
                  >
                    {isResetSubmitting ? 'Sending...' : 'Send OTP Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                <p className="text-xs leading-5 text-brown-deep/70">
                  Enter the 6-digit code sent to <strong className="text-brown-deep">{resetEmail}</strong> and specify your new password.
                </p>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                    6-Digit Verification OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                    className="mt-1.5 h-12 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-center font-mono text-2xl font-bold tracking-[0.3em] text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                    New Password (min 12 characters) *
                  </label>
                  <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={12}
                    className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft pr-11 pl-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                    placeholder="Enter new 12+ character password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-deep/40 transition-colors hover:text-brown-deep"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-brown-deep/60 hover:text-brown-deep hover:underline"
                  >
                    Resend Code or change email
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="h-11 flex-1 rounded-xl border border-cream-border text-xs font-bold uppercase tracking-wider text-brown-deep/70 hover:bg-cream-soft"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetSubmitting}
                    className="h-11 flex-1 rounded-xl bg-brown text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover disabled:opacity-60"
                  >
                    {isResetSubmitting ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-brown-deep">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brown border-t-transparent mx-auto" />
          <p className="mt-3 text-xs uppercase tracking-widest text-brown-warm">Loading...</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
