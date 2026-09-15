'use client';

import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneMockupFrameProps {
  children: React.ReactNode;
  currentTime?: string;
  className?: string;
}

export function PhoneMockupFrame({
  children,
  currentTime = '9:41',
  className = ''
}: PhoneMockupFrameProps) {
  return (
    <div className={`relative mx-auto select-none transition-all duration-300 ${className}`}>
      {/* Device Outer Chassis with Realistic Depth & Glow */}
      <div className="relative w-[340px] sm:w-[365px] h-[690px] sm:h-[730px] rounded-[50px] p-[10px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40">
        
        {/* Outer Rim Antenna Bands / Subtle Metallic Glint */}
        <div className="absolute -left-[2px] top-28 w-[3px] h-9 bg-neutral-600 rounded-l-xs" />
        <div className="absolute -left-[2px] top-42 w-[3px] h-12 bg-neutral-600 rounded-l-xs" />
        <div className="absolute -left-[2px] top-58 w-[3px] h-12 bg-neutral-600 rounded-l-xs" />
        <div className="absolute -right-[2px] top-36 w-[3px] h-16 bg-neutral-600 rounded-r-xs" />

        {/* Screen Bezel & Container */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-white dark:bg-[#09090B] flex flex-col border border-black/60 shadow-inner">
          
          {/* iOS Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-7 pt-3.5 pb-2 text-[11px] font-semibold text-slate-800 dark:text-white select-none bg-transparent">
            {/* Time */}
            <span className="tabular-nums tracking-tight font-medium text-[12px]">{currentTime}</span>

            {/* Dynamic Island / Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-[22px] bg-black rounded-full flex items-center justify-end px-2.5 gap-1.5 shadow-md z-40">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-950/70" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Scrollable Live Profile Screen Viewport */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none overscroll-contain">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="relative z-30 w-full py-2 flex justify-center bg-transparent pointer-events-none">
            <div className="w-32 h-1 bg-black/40 dark:bg-white/40 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
