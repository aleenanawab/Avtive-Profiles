'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { SocialAuthOptions } from '@/components/SocialAuthOptions';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect away to profile or create-profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
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
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side Validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both passwords.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      // Requirement: Register -> Login -> Profile Check -> Create Profile -> My Profile
      const redirectTarget = returnUrl
        ? `/login?registered=true&returnUrl=${encodeURIComponent(returnUrl)}`
        : '/login?registered=true';
      router.push(redirectTarget);
    } catch (err: any) {
      console.error('Registration Error:', err);
      setErrorMessage('Network error during registration. Please try again.');
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
          Create Your Account
        </h1>
        <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
          Get your verified digital identity profile and contactless pass card.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Social Authentication: Google, LinkedIn, GitHub, Facebook */}
      <SocialAuthOptions onError={(err) => setErrorMessage(err)} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Syed Mesum Raza Shah"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-medium bg-[#F8FAFC] dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-white/30"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mesum@avtive.app"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-medium bg-[#F8FAFC] dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-white/30"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Password (min. 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-medium bg-[#F8FAFC] dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-white/30"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-medium bg-[#F8FAFC] dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-white/30"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Passwords are securely encrypted with bcrypt</span>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 text-center text-xs text-[#475569] dark:text-[#94A3B8] space-y-2">
        <p>
          Already have an account?{' '}
          <Link
            href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
            className="font-bold text-slate-900 dark:text-white hover:underline"
          >
            Sign in
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

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white transition-colors">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading...</div>}>
        <RegisterFormContent />
      </Suspense>
    </main>
  );
}
