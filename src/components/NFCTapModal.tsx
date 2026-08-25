'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Wifi, X, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface NFCTapModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSaveContact: () => void;
  onExchangeContact: () => void;
}

export function NFCTapModal({
  isOpen,
  onClose,
  profile,
  onSaveContact,
  onExchangeContact
}: NFCTapModalProps) {
  const [phase, setPhase] = useState<'tapping' | 'connected'>('tapping');

  useEffect(() => {
    if (isOpen) {
      setPhase('tapping');
      const timer = setTimeout(() => {
        setPhase('connected');
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5 },
            colors: ['#0A1128', '#1E3A8A', '#7EC384']
          });
        } catch (e) {}
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 text-center text-[#0A1128] dark:text-white space-y-4 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {phase === 'tapping' ? (
          <div className="py-6 space-y-5">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#1E3A8A]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-[#1E3A8A]/30 animate-pulse" />
              <div className="relative z-10 w-14 h-14 rounded-full bg-[#0A1128] text-white flex items-center justify-center shadow-lg border border-white/20">
                <Wifi className="w-7 h-7 rotate-90 text-[#7EC384]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0A1128] dark:text-white">
                Reading Avtive Smart NFC Chip...
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Hold smartphone near card
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full border-2 border-[#1E3A8A] shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#7EC384] text-[#0A1128]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A] dark:text-[#7EC384] font-mono">
                Connected via Contactless NFC
              </span>
              <h3 className="text-base font-bold text-[#0A1128] dark:text-white">
                {profile.name}
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                {profile.company || profile.designation}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onSaveContact();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Contact to Phone (.vcf)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExchangeContact();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#152238] hover:bg-[#F1F5F9] text-[#0A1128] dark:text-white font-bold text-xs border border-[#E2E8F0] dark:border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#7EC384]" />
                <span>Exchange Contact</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
