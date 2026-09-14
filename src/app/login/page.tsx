'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';

  const [mode, setMode] = useState<'options' | 'login' | 'register'>('options');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    registered ? 'Account created! Please sign in with your credentials.' : null
  );

  // 1. Session check: if already authenticated, redirect to Profile or Dashboard
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const returnUrl = searchParams.get('returnUrl');
          const hasProfiles = Boolean((data.profiles && data.profiles.length > 0) || data.profile);
          if (hasProfiles) {
            if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
              router.replace(returnUrl);
            } else {
              router.replace('/dashboard');
            }
          } else {
            router.replace('/create-profile');
          }
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/auth/social?provider=${provider}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Social authentication failed.');
        setIsLoading(false);
        return;
      }
      if (data.hasProfile) {
        router.push('/dashboard');
      } else {
        router.push('/create-profile');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during social authentication.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'register' && (!name.trim() || name.trim().length < 2)) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' 
        ? { name: name.trim(), email: email.trim(), password, confirmPassword: password }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your details.');
        setIsLoading(false);
        return;
      }

      if (mode === 'register') {
        // Automatically login after successful registration or proceed to theme selection
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          router.push('/create-profile');
          router.refresh();
          return;
        }
      }

      const returnUrl = searchParams.get('returnUrl');
      if (data.hasProfile) {
        if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/register')) {
          router.push(returnUrl);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/create-profile');
      }

      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#09090B] font-sans text-white">
      {/* Mountain Dusk Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/95" />
      </div>

      {/* Top Bar: Avtive Brand */}
      <header className="relative z-10 w-full max-w-md mx-auto px-6 pt-8 sm:pt-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-sm group-hover:bg-white/20 transition-all">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight text-white/90">
            Avtive
          </span>
        </Link>

        {mode !== 'options' && (
          <button
            type="button"
            onClick={() => {
              setMode('options');
              setErrorMessage(null);
            }}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors py-1 px-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}
      </header>

      {/* Main Screen Content */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 pb-10 flex-1 flex flex-col justify-end">
        <AnimatePresence mode="wait">
          {mode === 'options' ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Your Identity,<br />Your Story
                </h1>
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                  Create professional profiles, showcase your work, and control what you share.
                </p>
              </div>

              {/* Alerts */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all active:scale-[0.99] shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Continue with Email */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm transition-all active:scale-[0.99] backdrop-blur-md"
                >
                  <Mail className="w-4 h-4 text-white/80" />
                  <span>Continue with Email</span>
                </button>
              </div>

              {/* Demo Account Quick Access */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mesum@avtive.app');
                    setPassword('Avtive@123');
                    setMode('login');
                  }}
                  className="text-xs text-white/60 hover:text-white transition-colors underline decoration-white/30"
                >
                  Quick Demo: Sign in as Mesum (Founder)
                </button>
              </div>

              {/* Footer Switcher */}
              <div className="pt-2 text-center text-xs text-white/60">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-semibold text-white hover:underline"
                >
                  Log in
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">
                  {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-white/60">
                  {mode === 'register'
                    ? 'Fill in your details to start creating your profiles.'
                    : 'Sign in to access your profiles and workspace.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/80">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aleena Nawab"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/80">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aleena@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/80">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-4 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'register' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-white/60">
                {mode === 'register' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-white font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </span>
                ) : (
                  <span>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-white font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white text-sm">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
