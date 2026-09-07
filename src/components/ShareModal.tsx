'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2, Download, QrCode } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { getThemeConfig } from './themeStyles';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onCopySuccess: () => void;
}

export function ShareModal({ isOpen, onClose, profile, onCopySuccess }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const theme = getThemeConfig(profile.theme || 'elegant');

  const identifier = profile.slug || profile.id;
  const canonicalPublicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${identifier}` 
    : `https://www.avtive.app/profile/${identifier}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(canonicalPublicUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, canonicalPublicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalPublicUrl);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${identifier}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Avtive Digital Identity`,
          text: `Connect with ${profile.name} (${profile.designation || 'Professional'}) on Avtive`,
          url: canonicalPublicUrl
        });
      } catch (err) {
        // User dismissed or aborted
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className={`relative w-full max-w-sm rounded-[32px] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl p-6 text-center space-y-5 transition-colors`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${theme.textMuted} hover:${theme.textPrimary} ${theme.subCardBg} transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Executive Identity Header */}
        <div className="flex flex-col items-center space-y-2 pt-1">
          <div className="flex items-center gap-1.5 mb-1">
            <img 
              src="/images/avtive-symbol.png" 
              alt="Avtive" 
              className="h-6 w-auto object-contain" 
            />
            <span className={`text-xs font-bold ${theme.accentText} tracking-wider font-mono`}>
              AVTIVE
            </span>
          </div>
          <div className={`w-16 h-16 rounded-2xl p-0.5 ${theme.badgeBg} shadow-md`}>
            <img
              src={profile.avatar}
              alt={profile.name}
              className={`w-full h-full object-cover rounded-xl border ${theme.cardBorder}`}
            />
          </div>
          <div>
            <h3 className={`text-base font-bold ${theme.textPrimary}`}>
              {profile.name}
            </h3>
            <p className={`text-xs ${theme.accentText} font-bold`}>
              {profile.designation}
            </p>
            <p className={`text-[11px] ${theme.textSecondary}`}>
              {profile.company || 'Avtive'}
            </p>
          </div>
        </div>

        {/* Real Profile QR Code Card */}
        <div className={`p-4 rounded-2xl ${theme.subCardBg} border ${theme.subCardBorder} inline-block shadow-inner`}>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Profile QR Code"
              className="w-44 h-44 mx-auto rounded-xl shadow-xs"
            />
          ) : (
            <div className="w-44 h-44 mx-auto flex items-center justify-center text-xs text-[#94A3B8]">
              <QrCode className="w-10 h-10 animate-pulse text-[#94A3B8]" />
            </div>
          )}
          <p className={`text-[11px] font-semibold ${theme.textMuted} mt-2.5 font-mono`}>
            Scan to view digital profile
          </p>
        </div>

        {/* Executive Action Buttons: Share Profile, Copy Link, Download QR */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* 1. Share Profile */}
          <button
            onClick={handleNativeShare}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl ${theme.btnPrimary} transition-colors active:scale-95 shadow-2xs font-bold`}
          >
            <Share2 className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Share Profile</span>
          </button>

          {/* 2. Copy Link */}
          <button
            onClick={handleCopy}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl ${theme.btnSecondary} transition-colors active:scale-95 shadow-2xs font-bold`}
          >
            {copied ? (
              <Check className="w-4 h-4 mb-1" />
            ) : (
              <Copy className="w-4 h-4 mb-1" />
            )}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          {/* 3. Download QR */}
          <button
            onClick={handleDownloadQR}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl ${theme.btnSecondary} transition-colors active:scale-95 shadow-2xs font-bold`}
          >
            <Download className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Download QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
