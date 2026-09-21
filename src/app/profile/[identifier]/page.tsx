import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfileByIdOrSlug, sanitizeProfileForPublic } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { PublicProfileClient } from './PublicProfileClient';
import { ProfileNotFoundFallback } from './ProfileNotFoundFallback';

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

  const profile = await getProfileByIdOrSlug(identifier);

  // 1. If Profile was not found on server, use ProfileNotFoundFallback to hydrate from localStorage if available
  if (!profile) {
    return <ProfileNotFoundFallback identifier={identifier} session={session} />;
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
