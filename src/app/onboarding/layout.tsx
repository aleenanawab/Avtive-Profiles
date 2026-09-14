import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Setup Your Avtive Profile | Onboarding',
  description: 'Sequential onboarding flow to set up your verified Avtive digital identity profile.'
};

export default async function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?returnUrl=/onboarding/theme');
  }

  return (
    <div className="min-h-screen w-full bg-[#09090B] text-white flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-white/20">
      {/* Mountain Dusk Subtle Background Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090B] via-[#09090B]/90 to-[#09090B]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-sm group-hover:bg-white/20 transition-all">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight text-white/90">
            Avtive
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
          <span>Logged in as</span>
          <span className="text-white/90 font-medium truncate max-w-[120px] sm:max-w-[180px]">
            {session.name}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto px-6 py-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Avtive Sequential Onboarding System &middot; 256-bit Identity Encryption</span>
      </footer>
    </div>
  );
}
