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
    router.push(`/onboarding/details?theme=${theme}&role=${selectedRole}`);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-semibold text-white/80">Step 2 of 3</span>
        </div>
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
          Profile Persona
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Select Profile Type
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Choose whether this profile represents you as an Owner, Employee, or Company.
        </p>
      </div>

      {/* Role Cards List */}
      <div className="space-y-3 pt-2">
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white/10 border-white shadow-xl ring-1 ring-white/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {role.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? 'bg-white border-white text-black'
                      : 'border-white/30 bg-black/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="pt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/15 transition-all active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingRolePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-sm">Loading roles...</div>}>
      <RoleStepContent />
    </Suspense>
  );
}
