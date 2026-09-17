'use client';

import React from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { AvtiveDigitalCard } from './AvtiveDigitalCard';

interface PhonePreviewProps {
  profile: ProfileData;
  isDark?: boolean;
  canEdit?: boolean;
  isEditing?: boolean;
  onOpenEdit?: () => void;
  onOpenShare?: () => void;
  onOpenConnect?: () => void;
  onSaveContact?: () => void;
  onSaveEdits?: (data: ProfileData) => Promise<void>;
  onSelectTeamMember?: (member: any) => void;
  onViewCompany?: () => void;
  onSelectProject?: (project: any) => void;
  hideHeaderLabel?: boolean;
  headerTitle?: string;
}

export function PhonePreview({ 
  profile, 
  isDark = false,
  canEdit = false,
  isEditing = false,
  onOpenEdit,
  onOpenShare,
  onOpenConnect,
  onSaveContact,
  onSaveEdits,
  onSelectTeamMember,
  onViewCompany,
  onSelectProject,
  hideHeaderLabel = false,
  headerTitle = 'Live Mobile Preview'
}: PhonePreviewProps) {
  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Phone Header Label */}
      {!hideHeaderLabel && (
        <div className="w-full max-w-[375px] flex items-center justify-between pb-2 px-3 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Smartphone className="w-3.5 h-3.5" />
            {headerTitle}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Realtime
          </span>
        </div>
      )}

      {/* Realistic Smartphone Chassis */}
      <div className="relative w-[340px] sm:w-[375px] h-[720px] sm:h-[760px] max-h-[82vh] rounded-[48px] p-[9px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-2xl ring-1 ring-black/50 border border-white/10 flex flex-col">
        
        {/* Screen Frame */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-white dark:bg-[#111319] flex flex-col border border-black/40 select-text">
          
          {/* iOS Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-800 dark:text-white select-none bg-transparent shrink-0">
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
          <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden scrollbar-none overscroll-contain">
            <AvtiveDigitalCard
              profile={profile}
              canEdit={canEdit}
              isEditing={isEditing}
              isConnected={false}
              onOpenEdit={onOpenEdit || (() => {})}
              onCancelEdit={() => {}}
              onSaveEdits={onSaveEdits}
              onSaveContact={onSaveContact || (() => {})}
              onOpenShare={onOpenShare || (() => {})}
              onOpenConnect={onOpenConnect || (() => {})}
              onOpenQRModal={() => {}}
              onOpenResumeModal={() => {}}
              onSelectProject={onSelectProject || (() => {})}
              onSelectTeamMember={onSelectTeamMember || (() => {})}
              onViewCompany={onViewCompany || (() => {})}
              isDark={isDark}
              viewMode="standard"
            />
          </div>

          {/* Bottom Home Indicator */}
          <div className="relative z-30 w-full py-1.5 flex justify-center bg-transparent pointer-events-none shrink-0">
            <div className="w-28 h-1 bg-black/40 dark:bg-white/40 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
