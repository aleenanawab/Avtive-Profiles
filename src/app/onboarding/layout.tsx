import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    <div className="min-h-[calc(100vh-65px)] w-full flex flex-col justify-center items-center p-3 sm:p-6 py-6 font-sans relative">
      {/* Main Content Area */}
      <main className="w-full flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}
