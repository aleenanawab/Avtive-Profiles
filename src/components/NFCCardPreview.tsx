'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Wifi, 
  RotateCw, 
  Download, 
  Zap, 
  ExternalLink,
  QrCode,
  Share2
} from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface NFCCardPreviewProps {
  profile: ProfileData;
  onSimulateNFCTap?: () => void;
  onOpenQRModal?: () => void;
  onViewCompany?: (companyId?: string) => void;
  onDownloadCard?: () => void;
  onOpenShare?: () => void;
  isDark?: boolean;
  theme?: ThemeConfig;
}

export function NFCCardPreview({ 
  profile, 
  onSimulateNFCTap, 
  onOpenQRModal, 
  onViewCompany, 
  onDownloadCard,
  onOpenShare,
  isDark,
  theme = getThemeConfig(profile.theme || 'elegant')
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
        dark: '#000000',
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
          <div className={`absolute inset-0 w-full h-full rounded-[24px] ${theme.cardBg} ${theme.textPrimary} p-5 flex flex-col justify-between backface-hidden shadow-xl border ${theme.cardBorder} overflow-hidden transition-colors`}>
            {/* Subtle premium accent rim */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentRim}`} />

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
                <span className={`text-xs font-bold tracking-wider uppercase ${theme.accentText} font-mono`}>
                  AVTIVE
                </span>
              </div>

              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.cardBg} border ${theme.cardBorder}`}>
                <Wifi className={`w-3 h-3 ${theme.accentText} rotate-90`} />
                <span className={`text-[8px] font-mono ${theme.textMuted} uppercase tracking-wider font-bold`}>SAAS PASS</span>
              </div>
            </div>

            {/* Middle: Founder PFP (Replaces the chip) + Designation */}
            <div className="flex items-center justify-between z-10 my-auto">
              <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 ${theme.cardBorder} ${theme.cardBg} shrink-0`}>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-right">
                <span className={`text-[9px] font-mono ${theme.textMuted} uppercase tracking-widest block font-bold`}>SAAS IDENTITY</span>
                <span className={`text-[11px] font-mono font-bold ${theme.accentText}`}>
                  {profile.nfcCard?.cardNumber || 'AVTIVE • SAAS VERIFIED'}
                </span>
              </div>
            </div>

            {/* Bottom: Cardholder Name, Company Name with Distinct Brand Color, Location */}
            <div className="flex items-end justify-between z-10">
              <div className="min-w-0 pr-2">
                <p className={`text-sm font-bold ${theme.textPrimary} tracking-tight truncate`}>
                  {profile.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewCompany) onViewCompany(companyId);
                    }}
                    className={`text-xs font-bold ${theme.accentText} hover:underline cursor-pointer`}
                  >
                    {companyName}
                  </span>
                  <span className={`text-[10px] ${theme.textMuted}`}>•</span>
                  <span className={`text-[10px] ${theme.textSecondary} truncate`}>
                    {profile.location}
                  </span>
                </div>
              </div>

              <div className={`text-[9px] font-mono font-bold ${theme.textMuted} shrink-0`}>
                <span>Avtive.app</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK: QR Code with "Scan to view profile" instruction                      */}
          {/* ========================================================================= */}
          <div className={`absolute inset-0 w-full h-full rounded-[24px] ${theme.cardBg} ${theme.textPrimary} p-5 flex flex-col items-center justify-between backface-hidden rotate-y-180 shadow-xl border ${theme.cardBorder} overflow-hidden transition-colors text-center`}>
            {/* Top brand header */}
            <div className={`w-full flex items-center justify-between text-[10px] ${theme.textMuted} font-mono`}>
              <span className={`font-bold tracking-wider ${theme.accentText}`}>AVTIVE SAAS CARD</span>
              <span>{companyName}</span>
            </div>

            {/* Center: Real QR Code */}
            <div className="flex flex-col items-center my-auto space-y-2">
              <div className={`p-2 rounded-2xl ${theme.cardBg} shadow-md border ${theme.cardBorder} inline-block`}>
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
              <p className={`text-[11px] font-bold ${theme.textPrimary} tracking-wide`}>
                Scan to view profile
              </p>
            </div>

            {/* Bottom info */}
            <div className={`w-full flex items-center justify-between text-[9px] font-mono ${theme.textMuted}`}>
              <span>{profile.name}</span>
              <span>www.avtive.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls: Download Virtual Card + Share Card + Flip */}
      <div className="flex flex-col gap-2 w-full max-w-[360px]">
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Download Virtual Card */}
          <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer`}
            title="Download Virtual Card (.vcf)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Virtual Card</span>
          </button>

          {/* Share Card */}
          <button
            onClick={onOpenShare}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl ${theme.btnSecondary} text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer`}
            title="Share Virtual Card"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Share Card</span>
          </button>
        </div>

        {/* Flip to QR */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 ${theme.subCardBg} text-[11px] font-semibold ${theme.textSecondary} hover:${theme.textPrimary} transition-all active:scale-95 cursor-pointer`}
        >
          <RotateCw className="w-3 h-3" />
          <span>{isFlipped ? 'Show Front of Card' : 'Flip to View QR Code'}</span>
        </button>
      </div>
    </div>
  );
}
