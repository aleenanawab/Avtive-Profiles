'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



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
      if (data.hasProfile && data.profileSlug) {
        router.push(`/profile/${data.profileSlug}`);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
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
          confirmPassword: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      // User is now authenticated automatically: proceed directly to theme onboarding
      router.push('/onboarding/theme');
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during registration. Please try again.');
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-65px)] w-full flex items-center justify-center p-3 sm:p-6 py-8 font-sans transition-colors">
      {/* Figma Mobile Screen Card (Screen 1. Register / Signup) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="figma-phone-frame w-full max-w-[390px] p-6 sm:p-7 flex flex-col justify-between relative"
      >
        {/* Mobile Top Status Bar (9:41, Wifi, Battery) */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-6 px-1 font-mono">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
            </svg>
            <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-current rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Centered Brand Header: Logo + "Avtive" */}
        <div className="flex flex-col items-center justify-center pt-2 pb-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-lg shadow-sm font-sans">
              A
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Avtive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Create Your Account
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields: Name, Email, Password */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-300 ml-1">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aleena Nawab"
              className="figma-input w-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-300 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aleena@example.com"
              className="figma-input w-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-300 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="figma-input w-full pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button: White Pill Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </div>
        </form>

        {/* Secondary Action: Continue with Google Pill Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="figma-pill-secondary w-full py-3 px-6 text-sm font-medium flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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

        {/* Footer Link: Already have an account? Log in */}
        <div className="pt-6 pb-2 text-center text-xs text-slate-500 dark:text-zinc-400">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-slate-900 dark:text-white hover:underline ml-1"
          >
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
