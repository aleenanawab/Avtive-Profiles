'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SocialAuthOptions } from '@/components/SocialAuthOptions';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    registered ? 'Account created successfully! Please sign in with your credentials.' : null
  );

  // 1. Session check: if already authenticated, redirect to Profile or Create Profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const returnUrl = searchParams.get('returnUrl');
          if (data.profile) {
            if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register') && !returnUrl.includes('/create-profile')) {
              router.replace(returnUrl);
            } else {
              router.replace(`/profile/${data.profile.slug || data.profile.id}`);
            }
          } else {
            router.replace(returnUrl ? `/create-profile?returnUrl=${encodeURIComponent(returnUrl)}` : '/create-profile');
          }
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials. Please verify and try again.');
        setIsLoading(false);
        return;
      }

      // Success: Redirect according to profile existence
      const returnUrl = searchParams.get('returnUrl');

      if (data.hasProfile && data.profileSlug) {
        if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register') && !returnUrl.includes('/create-profile')) {
          router.push(returnUrl);
        } else {
          router.push(`/profile/${data.profileSlug}`);
        }
      } else {
        if (returnUrl) {
          router.push(`/create-profile?returnUrl=${encodeURIComponent(returnUrl)}`);
        } else {
          router.push('/create-profile');
        }
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error while logging in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img src="/images/avtive-symbol.png" alt="Avtive" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">Avtive</span>
          </Link>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Sign in to manage your digital identity profile and pass card.
        </p>
      </div>

      {/* Success Notice from Registration */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Social Authentication: Google & LinkedIn */}
      <SocialAuthOptions onError={(err) => setErrorMessage(err)} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mesum@avtive.app"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium bg-slate-50 dark:bg-[#18181D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Hint */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#18181D] border border-slate-200 dark:border-white/10 text-left space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Demo Account Credentials</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Email: <code className="font-bold text-slate-900 dark:text-white">mesum@avtive.app</code> • Password: <code className="font-bold text-slate-900 dark:text-white">Avtive@123</code>
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-slate-900 dark:text-white hover:underline">
            Create an account
          </Link>
        </p>
        <p>
          <Link href="/" className="hover:underline text-[11px] text-[#94A3B8]">
            ← Return to public profile view
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
