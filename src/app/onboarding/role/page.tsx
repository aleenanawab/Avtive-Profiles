'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, Crown, User, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileType, ProfileTheme } from '@/types/profile';

interface RoleCardData {
  id: ProfileType;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  features: string[];
}

const ROLE_OPTIONS: RoleCardData[] = [
  {
    id: 'owner',
    title: 'Owner',
    badge: 'Full Control',
    icon: Crown,
    description: 'Full administrative control over your digital identity, permissions, and persona passes.',
    features: ['Direct granular privacy controls', 'Create custom multi-personas', 'Verified owner badge']
  },
  {
    id: 'employee',
    title: 'Employee',
    badge: 'Work at a Company',
    icon: User,
    description: 'Showcase your role, department, credentials, and achievements within an organization.',
    features: ['Company affiliation link', 'Professional skills showcase', 'Work experience timeline']
  },
  {
    id: 'company',
    title: 'Company',
    badge: 'Business / Organization',
    icon: Building2,
    description: 'Centralized company presence, services directory, team showcase, and brand identity.',
    features: ['Team member roster', 'Products & services showcase', 'Company contact channels']
  }
];

function RoleStepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = (searchParams.get('theme') as ProfileTheme) || 'editorial';
  const initialRole = (searchParams.get('role') as ProfileType) || 'owner';

  const [selectedRole, setSelectedRole] = useState<ProfileType>(initialRole);

  const handleBack = () => {
    router.push(`/onboarding/theme?theme=${theme}`);
  };

  const handleNext = () => {
    router.push(`/onboarding/create?theme=${theme}&role=${selectedRole}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="figma-phone-frame w-full max-w-[390px] p-6 sm:p-7 flex flex-col justify-between relative"
    >
      {/* Mobile Top Status Bar (9:41, Wifi, Battery) */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-4 px-1 font-mono">
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

      {/* Screen 4 Header: Back Arrow, Title & Subtitle */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Select Profile Type
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
            Select the type that matches for your profile.
          </p>
        </div>
      </div>

      {/* Role Cards List matching Figma Screen 4 */}
      <div className="space-y-3 mb-6">
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-50 dark:bg-[#1B1E28] border-slate-900 dark:border-white/30 shadow-xs ring-1 ring-slate-900/10 dark:ring-white/20'
                  : 'bg-white dark:bg-[#151821] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Circular Icon matching Figma Screen 4 */}
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#1E222D] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-800 dark:text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {role.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {role.title === 'Owner' 
                      ? 'Full control of the profile' 
                      : role.title === 'Employee' 
                      ? 'Work at a company' 
                      : 'Business / Organization'}
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button: White Pill Button */}
      <div>
        <button
          type="button"
          onClick={handleNext}
          className="figma-pill-primary w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Next</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function OnboardingRolePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading roles...</div>}>
      <RoleStepContent />
    </Suspense>
  );
}
