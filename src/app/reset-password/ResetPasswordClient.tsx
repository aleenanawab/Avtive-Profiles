'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { DualScreenWorkspace } from '@/components/layout/DualScreenWorkspace';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get('email') || '';
  const urlToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(urlEmail);
  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [urlEmail, urlToken]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !token.trim()) {
      setErrorMessage('Missing reset verification parameters. Please request a new link.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token: token.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      try {
        sessionStorage.setItem('avtive_active_session', 'true');
      } catch {}

      setSuccessMessage('Password reset successfully! Redirecting to your workspace...');

      setTimeout(() => {
        const targetId = data.profileSlug || data.user?.id;
        if (targetId) {
          router.push(`/profile/${targetId}`);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }, 1200);

    } catch (err) {
      console.error(err);
      setErrorMessage('Network error while resetting password.');
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP WORKING SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  const desktopView = (
    <div className="w-full max-w-4xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      {/* Left Column: Brand & Security Highlights */}
      <div className="lg:col-span-5 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security &amp; Pass Vault</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-cyan-500/25">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">New Password</h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create a strong new password to protect your digital pass and profile data.
          </p>
        </div>

        {email && (
          <div className="p-3.5 rounded-2xl bg-[#0E1528] border border-cyan-500/30 space-y-1">
            <div className="text-[11px] font-mono text-slate-400">Account Being Reset:</div>
            <div className="text-xs font-bold text-cyan-300 truncate">{email}</div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Instant Sign In</h4>
              <p className="text-[11px] text-slate-400">You will be authenticated and redirected immediately upon reset.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: New Password Form */}
      <div className="lg:col-span-7">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1528] border border-white/10 shadow-xl space-y-5 text-left">
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Set New Password</h2>
            <p className="text-xs text-slate-400">Must be at least 8 characters long</p>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#070D18] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save Password &amp; Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // MOBILE WORKING SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="w-full flex-1 flex flex-col justify-between p-3.5 sm:p-4 text-left overflow-y-auto">
      
      <div className="space-y-3">
        {/* Mobile Header */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold mb-2">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Vault Security</span>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-cyan-500/25 mb-1.5">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-white">Set New Password</h2>
          <p className="text-[11px] text-slate-300 mt-0.5">Create your updated password below</p>
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
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 ml-0.5">New Password</label>
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

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 ml-0.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#070D18] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Save Password &amp; Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 pb-1 text-center text-[11px] text-slate-400">
        <span>Need a new link? </span>
        <Link href="/forgot-password" className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 ml-1">
          Request again
        </Link>
      </div>

    </div>
  );

  return (
    <DualScreenWorkspace
      workflowTitle="Reset Password"
      workflowSubtitle="Update Account Credentials"
      currentUrlPath="/reset-password"
      desktopContent={desktopView}
      mobileContent={mobileView}
    />
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading reset verification...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
