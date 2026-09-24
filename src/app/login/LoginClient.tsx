'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

export default function LoginClient() {
  const router = useRouter();

  // Shared Application State between Desktop & Mobile Working Screens
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('registered') === 'true') {
        setSuccessMessage('Account created successfully! Please sign in below.');
      }
    }
  }, []);

  const getReturnUrl = () => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('returnUrl');
  };

  // When user lands on /login, they enter their credentials to sign in

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Google authentication failed.');
        setIsLoading(false);
        return;
      }
      try {
        sessionStorage.setItem('avtive_active_session', 'true');
      } catch {}

      if (data.hasProfile) {
        const returnUrl = getReturnUrl();
        const targetId = data.profileSlug || data.user?.id;
        if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
          router.push(returnUrl);
        } else {
          router.push(`/profile/${targetId}`);
        }
      } else {
        router.push('/onboarding/theme');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during Google authentication.');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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
        setErrorMessage(data.error || 'Invalid credentials. Please check email and password.');
        setIsLoading(false);
        return;
      }

      try {
        sessionStorage.setItem('avtive_active_session', 'true');
      } catch {}

      const returnUrl = getReturnUrl();
      if (data.hasProfile) {
        const targetId = data.profileSlug || data.user?.id;
        if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
          router.push(returnUrl);
        } else {
          router.push(`/profile/${targetId}`);
        }
      } else {
        router.push('/onboarding/theme');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during login. Please try again.');
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP WORKING SCREEN REPRESENTATION
  // ──────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div className="w-full max-w-4xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      {/* Left Column: Brand & Return Highlights */}
      <div className="lg:col-span-5 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avtive Identity Workspaces</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-cyan-500/25">
              A
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Access your profile studio, edit multiple identity personas, manage NFC pass cards, and inspect connection metrics.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Secure Encrypted Session</h4>
              <p className="text-[11px] text-slate-400">Industry-standard authentication and session protection.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Instant Profile Switcher</h4>
              <p className="text-[11px] text-slate-400">Seamlessly toggle between your work, freelance, and personal cards.</p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400">
          New to Avtive?{' '}
          <Link href="/register" className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
            Create a new account
          </Link>
        </div>
      </div>

      {/* Right Column: Desktop Sign-in Form */}
      <div className="lg:col-span-7">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1528] border border-white/10 shadow-xl space-y-5 text-left">
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-xs text-slate-400">Enter your credentials or authenticate via Google</p>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aleena@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#070D18] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#070D18] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0E1528] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>
      </div>

    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // MOBILE WORKING SCREEN REPRESENTATION
  // ──────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="w-full flex-1 flex flex-col justify-between p-3.5 sm:p-4 text-left overflow-y-auto">
      
      <div className="space-y-3">
        {/* Mobile Centered Brand Header */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Avtive Mobile Pass</span>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-cyan-500/25 mb-1.5">
            A
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="text-[11px] text-slate-300 mt-0.5">Sign in to access your pass &amp; profile studio</p>

          {/* Micro Trust Pills */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
              <span>Encrypted</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Multi-Pass</span>
            </span>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">{errorMessage}</span>
          </div>
        )}

        {/* Mobile Form Card */}
        <div className="p-3.5 rounded-2xl bg-[#0E1528] border border-white/10 shadow-lg space-y-3">
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 ml-0.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aleena@example.com"
                className="w-full px-3 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 ml-0.5">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1.5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0E1528] px-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 pb-1 text-center text-[11px] text-slate-400">
        <span>New to Avtive? </span>
        <Link href="/register" className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 ml-1">
          Create an account
        </Link>
      </div>

    </div>
  );

  return (
    <DualScreenWorkspace
      workflowTitle="2. Login"
      workflowSubtitle="Permanent Twin-Screen Working Workflow"
      currentUrlPath="/login"
      desktopContent={desktopView}
      mobileContent={mobileView}
    />
  );
}
