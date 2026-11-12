'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError, requestPasswordReset, verifyPasswordResetCode } from '@/lib/api';
import { PasswordInput } from '@/components/PasswordInput';
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from '@/components/auth/AuthShell';
import { ArrowRightIcon } from '@/components/icons';

type Step = 'email' | 'code' | 'password';

/** Matches the backend's resend cooldown (PasswordResetService.RESEND_COOLDOWN_MS). */
const RESEND_SECONDS = 60;

const STEP_COPY: Record<Step, { eyebrow: string; title: string; subtitle: string }> = {
  email: {
    eyebrow: 'Forgot password',
    title: 'Reset your password',
    subtitle: 'Enter the email you sign in with and we’ll send you a 6-digit code.',
  },
  code: {
    eyebrow: 'Check your inbox',
    title: 'Enter your code',
    subtitle: 'We sent a 6-digit code to your email. It expires in 10 minutes.',
  },
  password: {
    eyebrow: 'Almost done',
    title: 'Choose a new password',
    subtitle: 'Use at least 8 characters. Every other device will be signed out.',
  },
};

function errorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  // Validation errors arrive as a list; show the first.
  const message = err.message as unknown;
  return Array.isArray(message) ? String(message[0]) : err.message;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordFlow />
    </Suspense>
  );
}

function ForgotPasswordFlow() {
  const { completePasswordReset } = useAuth();
  const router = useRouter();
  // The login page passes the email it already has, so it isn't typed twice.
  const prefilledEmail = useSearchParams().get('email') ?? '';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function run(action: () => Promise<void>, fallback: string) {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  }

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    return run(async () => {
      await requestPasswordReset(email.trim());
      setStep('code');
      setCode('');
      setResendIn(RESEND_SECONDS);
      setNotice(`If an account exists for ${email.trim()}, a code is on its way.`);
    }, 'Couldn’t send the code. Please try again.');
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    return run(async () => {
      const res = await verifyPasswordResetCode(email.trim(), code);
      setResetToken(res.resetToken);
      setStep('password');
    }, 'Couldn’t check the code. Please try again.');
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('The two passwords don’t match.');
      return;
    }
    return run(async () => {
      await completePasswordReset(email.trim(), resetToken, password);
      router.push('/app/dashboard');
    }, 'Couldn’t save the new password. Please try again.');
  };

  const copy = STEP_COPY[step];

  return (
    <AuthShell eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <StepDots step={step} />

      {step === 'email' && (
        <form onSubmit={sendCode}>
          <label htmlFor="reset-email" className={authLabelClass}>
            Work email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mb-6 ${authInputClass}`}
          />
          <Feedback error={error} notice={notice} />
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? 'Sending code…' : 'Send code'}
            {!loading && <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={verify}>
          <label htmlFor="reset-code" className={authLabelClass}>
            6-digit code
          </label>
          <input
            id="reset-code"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`mb-2 text-center font-mono text-2xl tracking-[0.5em] ${authInputClass}`}
          />
          <p className="mb-6 text-xs text-muted-on-ink">
            Sent to <span className="font-semibold text-white">{email.trim()}</span> ·{' '}
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
                setNotice(null);
              }}
              className="cursor-pointer font-semibold text-cobalt hover:underline"
            >
              Change email
            </button>
          </p>
          <Feedback error={error} notice={notice} />
          <button type="submit" disabled={loading || code.length !== 6} className={authButtonClass}>
            {loading ? 'Checking…' : 'Verify code'}
            {!loading && <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
          <p className="mt-4 text-center text-xs text-muted-on-ink">
            Didn’t get it? Check your spam folder, or{' '}
            {resendIn > 0 ? (
              <span>resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => sendCode()}
                className="cursor-pointer font-semibold text-cobalt hover:underline disabled:cursor-wait"
              >
                send a new code
              </button>
            )}
            .
          </p>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={savePassword}>
          <label htmlFor="new-password" className={authLabelClass}>
            New password
          </label>
          <PasswordInput
            id="new-password"
            required
            autoFocus
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            wrapperClassName="mb-4"
            className={authInputClass}
          />
          <label htmlFor="confirm-password" className={authLabelClass}>
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            wrapperClassName="mb-6"
            className={authInputClass}
          />
          <Feedback error={error} notice={notice} />
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? 'Saving…' : 'Save password and sign in'}
            {!loading && <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-on-ink">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-cobalt hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['email', 'code', 'password'];
  const current = steps.indexOf(step);
  return (
    <ol aria-label={`Step ${current + 1} of 3`} className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={i === current ? 'step' : undefined}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i <= current ? 'bg-cobalt' : 'bg-ink-line'}`}
        />
      ))}
    </ol>
  );
}

function Feedback({ error, notice }: { error: string | null; notice: string | null }) {
  if (error) {
    return (
      <div role="alert" className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
        {error}
      </div>
    );
  }
  if (notice) {
    return (
      <div role="status" className="mb-4 rounded-lg border border-pass/40 bg-pass/10 px-3 py-2 text-xs text-[#7ee2ad]">
        {notice}
      </div>
    );
  }
  return null;
}
