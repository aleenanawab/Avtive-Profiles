'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Wifi, 
  RotateCw, 
  Download, 
  Zap, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import { ProfileData } from '../types/profile';

interface NFCCardPreviewProps {
  profile: ProfileData;
  onSimulateNFCTap?: () => void;
  onOpenQRModal?: () => void;
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const companyName = profile.company || profile.companyInfo?.name || 'Avtive';
  const companyId = profile.companyId || 'avtive-company';

  useEffect(() => {
    const profileUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.avtive.app';
    QRCode.toDataURL(profileUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0A1128',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [profile.slug]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownloadCard) {
      onDownloadCard();
    } else {
      const vCardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.name}`,
        `ORG:${companyName}`,
        `TITLE:${profile.designation || ''}`,
        profile.phone ? `TEL;TYPE=CELL,VOICE:${profile.phone}` : '',
        profile.email ? `EMAIL;TYPE=PREF,INTERNET:${profile.email}` : '',
        `URL;TYPE=WORK:${profile.website || 'https://www.avtive.app'}`,
        `ADR;TYPE=WORK:;;${profile.officeAddress || profile.location};Islamabad;;;Pakistan`,
        `NOTE:${profile.shortBio || ''}`,
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
    <div className="flex flex-col items-center space-y-4 text-left w-full">
      {/* 3D Flippable Digital Identity Card */}
      <div
        className="w-full max-w-[360px] aspect-[1.586/1] perspective-1000 cursor-pointer group select-none"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Click to flip card"
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ========================================================================= */}
          {/* FRONT: Avtive Logo + Founder PFP + Identity + Company Name (No Chip)       */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] bg-white dark:bg-[#0A1228] text-[#0A1128] dark:text-white p-5 flex flex-col justify-between backface-hidden shadow-xl border border-[#E2E8F0] dark:border-white/15 overflow-hidden transition-colors">
            {/* Subtle premium accent rim */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E3A8A] via-[#C49A6C] to-[#1E3A8A]" />

            {/* Top Bar: Actual Avtive Logo + Contactless Wave */}
            <div className="flex items-center justify-between z-10">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewCompany) onViewCompany(companyId);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                title={`Go to ${companyName} Profile`}
              >
                <img 
                  src="/images/avtive-symbol.png" 
                  alt="Avtive Logo" 
                  className="h-6 w-auto object-contain"
                />
                <span className="text-xs font-bold tracking-wider uppercase text-[#1E3A8A] dark:text-[#60A5FA] font-mono">
                  AVTIVE
                </span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-white/10">
                <Wifi className="w-3 h-3 text-[#1E3A8A] dark:text-[#60A5FA] rotate-90" />
                <span className="text-[8px] font-mono text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider font-bold">SAAS PASS</span>
              </div>
            </div>

            {/* Middle: Founder PFP (Replaces the chip) + Designation */}
            <div className="flex items-center justify-between z-10 my-auto">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-[#1E293B] bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest block font-bold">SAAS IDENTITY</span>
                <span className="text-[11px] font-mono font-bold text-[#1E3A8A] dark:text-[#60A5FA]">
                  {profile.nfcCard?.cardNumber || 'AVTIVE • SAAS VERIFIED'}
                </span>
              </div>
            </div>

            {/* Bottom: Cardholder Name, Company Name with Distinct Brand Color, Location */}
            <div className="flex items-end justify-between z-10">
              <div className="min-w-0 pr-2">
                <p className="text-sm font-bold text-[#0A1128] dark:text-white tracking-tight truncate">
                  {profile.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewCompany) onViewCompany(companyId);
                    }}
                    className="text-xs font-bold text-[#1E3A8A] dark:text-[#60A5FA] hover:underline cursor-pointer"
                  >
                    {companyName}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">•</span>
                  <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] truncate">
                    {profile.location}
                  </span>
                </div>
              </div>

              <div className="text-[9px] font-mono font-bold text-[#94A3B8] shrink-0">
                <span>Avtive.app</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK: QR Code with "Scan to view profile" instruction                      */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-[24px] bg-[#F8FAFC] dark:bg-[#060B1E] text-[#0A1128] dark:text-white p-5 flex flex-col items-center justify-between backface-hidden rotate-y-180 shadow-xl border border-[#E2E8F0] dark:border-white/15 overflow-hidden transition-colors text-center">
            {/* Top brand header */}
            <div className="w-full flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
              <span className="font-bold tracking-wider text-[#1E3A8A] dark:text-[#60A5FA]">AVTIVE SAAS CARD</span>
              <span>{companyName}</span>
            </div>

            {/* Center: Real QR Code */}
            <div className="flex flex-col items-center my-auto space-y-2">
              <div className="p-2 rounded-2xl bg-white shadow-md border border-[#E2E8F0] dark:border-white/20 inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Profile QR Code"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-[#94A3B8] animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-[11px] font-bold text-[#0A1128] dark:text-white tracking-wide">
                Scan to view profile
              </p>
            </div>

            {/* Bottom info */}
            <div className="w-full flex items-center justify-between text-[9px] font-mono text-[#94A3B8]">
              <span>{profile.name}</span>
              <span>www.avtive.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls: Flip Card + Download Card */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-[360px]">
        {/* 1. Flip Card */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-[#0E1A38] hover:bg-[#F1F5F9] dark:hover:bg-[#152238] text-xs font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-colors shadow-2xs active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#60A5FA]" />
          <span>{isFlipped ? 'Show Front' : 'Flip to QR'}</span>
        </button>

        {/* 2. Download Card Action */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-xs font-bold text-white dark:text-[#0A1128] shadow-xs transition-all active:scale-95"
          title="Download Digital Identity Card"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Card</span>
        </button>
      </div>
    </div>
  );
}
