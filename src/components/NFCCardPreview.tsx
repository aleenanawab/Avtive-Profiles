'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  RotateCw, 
  Download, 
  Zap, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { ProfileData } from '../types/profile';

interface NFCCardPreviewProps {
  profile: ProfileData;
  onSimulateNFCTap: () => void;
  onOpenQRModal: () => void;
  onViewCompany?: (companyId?: string) => void;
  onDownloadCard?: () => void;
  isDark?: boolean;
}

export function NFCCardPreview({ 
  profile, 
  onSimulateNFCTap, 
  onOpenQRModal, 
  onViewCompany,
  onDownloadCard,
  isDark 
}: NFCCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const companyName = profile.company || profile.companyInfo?.name || 'Avtive';
  const companyId = profile.companyId || 'avtive-company';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownloadCard) {
      onDownloadCard();
    } else {
      // Direct vCard / digital identity card download
      const vCardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.name}`,
        `ORG:${companyName}`,
        `TITLE:${profile.designation || ''}`,
        profile.phone ? `TEL;TYPE=CELL,VOICE:${profile.phone}` : '',
        profile.email ? `EMAIL;TYPE=PREF,INTERNET:${profile.email}` : '',
        `URL;TYPE=WORK:${profile.website || 'https://www.avtive.app'}`,
        `ADR;TYPE=WORK:;;${profile.officeAddress || profile.location};${profile.location};;;Pakistan`,
        'END:VCARD'
      ].filter(Boolean);

      const blob = new Blob([vCardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.slug || 'digital-card'}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 text-left">
      {/* 3D Flippable Digital Identity Card */}
      <div
        className="w-full max-w-[340px] aspect-[1.586/1] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ========================================================================= */}
          {/* FRONT: Dynamic Profile Photo + Clickable Dynamic Company Name (No Chip)   */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] bg-white dark:bg-[#0A1128] text-[#0A1128] dark:text-white p-5 flex flex-col justify-between backface-hidden shadow-lg border border-[#E2E8F0] dark:border-white/15 overflow-hidden transition-colors">
            {/* Subtle gloss sweep */}
            <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#1E3A8A]/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A] dark:via-[#7EC384] to-transparent" />

            {/* Top Bar: Clickable Dynamic Company Name + Contactless Indicator */}
            <div className="flex items-center justify-between z-10">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewCompany) onViewCompany(companyId);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group/comp"
                title={`View ${companyName} Company Profile`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] font-black flex items-center justify-center text-xs shadow-xs font-mono">
                  {companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs tracking-wider uppercase text-[#0A1128] dark:text-white font-mono group-hover/comp:text-[#1E3A8A] dark:group-hover/comp:text-[#7EC384] transition-colors">
                    {companyName}
                  </span>
                  {onViewCompany && (
                    <ExternalLink className="w-2.5 h-2.5 text-[#94A3B8] group-hover/comp:text-[#1E3A8A]" />
                  )}
                </div>
              </div>

              {/* NFC Wave */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10">
                <Wifi className="w-3.5 h-3.5 text-[#25D366] rotate-90" />
                <span className="text-[9px] font-mono text-[#475569] dark:text-[#94A3B8] uppercase tracking-widest font-bold">PASS</span>
              </div>
            </div>

            {/* Middle: Dynamic Profile Photo (Replaces the chip) */}
            <div className="flex items-center justify-between z-10 my-auto">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#1E3A8A] to-[#7EC384] shadow-md">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full border-2 border-white dark:border-[#0A1128]"
                />
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest block font-bold">DIGITAL ID</span>
                <span className="text-[11px] font-mono font-bold text-[#0A1128] dark:text-[#7EC384]">
                  {profile.nfcCard?.cardNumber || `${companyName.toUpperCase()} • ID`}
                </span>
              </div>
            </div>

            {/* Bottom: Cardholder Identity */}
            <div className="flex items-end justify-between z-10">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-[#0A1128] dark:text-white tracking-wide truncate">
                  {profile.name}
                </p>
                <p className="text-[10px] text-[#475569] dark:text-[#94A3B8] truncate font-medium">
                  {profile.designation || companyName}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono text-[#94A3B8] shrink-0 font-bold">
                <span>Avtive.app</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK: Digital Information & Verification                                  */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] bg-[#F8FAFC] dark:bg-[#060B1E] text-[#0A1128] dark:text-white p-5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-lg border border-[#E2E8F0] dark:border-white/15 overflow-hidden transition-colors">
            {/* Top Stripe */}
            <div className="absolute top-4 left-0 right-0 h-9 bg-slate-800 dark:bg-black/90 border-y border-slate-700 dark:border-white/10" />

            <div className="pt-10 flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>AUTHORIZED DIGITAL PASS</span>
              <span>{profile.location}</span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-white/10">
              <div className="text-left space-y-0.5">
                <p className="text-[10px] font-bold text-[#0A1128] dark:text-white">{profile.name}</p>
                <p className="text-[9px] text-[#475569] dark:text-[#94A3B8]">{companyName} • Tap to connect</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQRModal();
                }}
                className="px-2 py-1 rounded-lg bg-[#0A1128] dark:bg-white text-white dark:text-[#0A1128] text-[10px] font-bold shrink-0"
              >
                QR View
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-[#94A3B8]">
              <span>www.avtive.app</span>
              <span>ENCRYPTED PASS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls with Download Card, Flip, and Tap */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[340px]">
        {/* 1. Flip Card */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#152238] text-[11px] font-semibold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-colors shadow-2xs"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Flip</span>
        </button>

        {/* 2. Download Card Action */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#152238] text-[11px] font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-colors shadow-2xs"
          title="Download Digital Identity Card"
        >
          <Download className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Download</span>
        </button>

        {/* 3. Simulate Tap */}
        <button
          onClick={onSimulateNFCTap}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-[11px] font-bold text-white dark:text-[#0A1128] shadow-xs transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Tap</span>
        </button>
      </div>
    </div>
  );
}
