'use client';

import React from 'react';
import { Phone, MessageSquare, UserPlus } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface StickyBottomBarProps {
  profile: ProfileData;
  onSaveContact: () => void;
}

export function StickyBottomBar({ profile, onSaveContact }: StickyBottomBarProps) {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none md:hidden">
      <div className="pointer-events-auto flex items-center justify-between gap-2 p-2 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md max-w-sm w-full">
        {profile.phone ? (
          <a
            href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-green-600" />
            <span>Call</span>
          </a>
        ) : null}

        {profile.whatsapp ? (
          <a
            href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-green-600" />
            <span>WhatsApp</span>
          </a>
        ) : null}

        <button
          onClick={onSaveContact}
          className="flex-[1.3] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#1E40AF] hover:bg-[#1D4ED8] shadow-sm transition-transform active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Save Contact</span>
        </button>
      </div>
    </div>
  );
}
