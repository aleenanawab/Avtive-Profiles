import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfileByIdOrSlug, sanitizeProfileForPublic } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { PublicProfileClient } from './PublicProfileClient';
import { ArrowLeft, UserX } from 'lucide-react';

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  const profile = await getProfileByIdOrSlug(identifier);

  if (!profile) {
    return {
      title: 'Profile Not Found | Avtive',
      description: 'The requested digital identity profile could not be found.'
    };
  }

  return {
    title: `${profile.name} | Avtive Digital Profile`,
    description: profile.shortBio || `${profile.name} - ${profile.designation || 'Professional Profile'} on Avtive`,
    openGraph: {
      title: `${profile.name} | Avtive Digital Profile`,
      description: profile.shortBio || 'View verified digital card and identity pass.',
      images: profile.avatar ? [{ url: profile.avatar }] : []
    }
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { identifier } = await params;
  const session = await getSession();

  // 1. Mandatory Gatekeeper: Register/Login must come first before profile access (Req 13 & 47)
  if (!session) {
    redirect(`/login?returnUrl=/profile/${encodeURIComponent(identifier)}`);
  }

  const profile = await getProfileByIdOrSlug(identifier);

  // 1. If Profile does not exist, show clean 404
  if (!profile) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#09090B] text-slate-900 dark:text-white">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 mx-auto flex items-center justify-center text-[#475569] dark:text-[#94A3B8]">
            <UserX className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Profile Not Found
            </h1>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              The profile &quot;{identifier}&quot; does not exist or has been moved.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-xs transition-colors"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. Strict Owner Verification: Caller's session ID === targetProfile.userId
  const isOwner = Boolean(
    session?.id && (
      (profile.userId && session.id === profile.userId) ||
      (profile.email && session.email && profile.email.toLowerCase().trim() === session.email.toLowerCase().trim()) ||
      (profile.id === session.id) ||
      (profile.slug === session.id)
    )
  );

  // 3. ZERO TOLERANCE SERVER-SIDE FILTERING:
  // If caller is NOT the owner, sanitize the profile data server-side
  // so hidden contact info, experience, etc. are strictly omitted before sending to client
  const servedProfile = sanitizeProfileForPublic(profile, isOwner);

  return (
    <PublicProfileClient
      initialProfile={servedProfile}
      session={session}
      isOwner={isOwner}
    />
  );
}
