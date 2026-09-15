'use client';

import React from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { AvtiveDigitalCard } from './AvtiveDigitalCard';

interface PhonePreviewProps {
  profile: ProfileData;
  isDark?: boolean;
}

export function PhonePreview({ profile, isDark = false }: PhonePreviewProps) {
  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Phone Header Label */}
      <div className="w-full max-w-[370px] flex items-center justify-between pb-2 px-3 text-xs font-bold text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Smartphone className="w-3.5 h-3.5" />
          Live Mobile Preview
        </span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Realtime
        </span>
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="relative w-[340px] sm:w-[365px] h-[700px] sm:h-[730px] rounded-[48px] p-[9px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-2xl ring-1 ring-black/50 border border-white/10">
        
        {/* Screen Frame */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-white dark:bg-[#111319] flex flex-col border border-black/40">
          
          {/* iOS Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-800 dark:text-white select-none bg-transparent">
            <span className="tabular-nums font-mono text-[11px]">9:41</span>

            {/* Dynamic Island Notch */}
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#111] ring-1 ring-white/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable Live Profile Screen */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none overscroll-contain">
            <AvtiveDigitalCard
              profile={profile}
              canEdit={false}
              isEditing={false}
              isConnected={false}
              onSaveContact={() => {}}
              onOpenShare={() => {}}
              onOpenConnect={() => {}}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={() => {}}
              isDark={isDark}
              viewMode="standard"
            />
          </div>

          {/* Bottom Home Indicator */}
          <div className="relative z-30 w-full py-1.5 flex justify-center bg-transparent pointer-events-none">
            <div className="w-28 h-1 bg-black/40 dark:bg-white/40 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
