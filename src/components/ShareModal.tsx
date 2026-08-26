'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2, Download, QrCode } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onCopySuccess: () => void;
}

export function ShareModal({ isOpen, onClose, profile, onCopySuccess }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.avtive.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#0A1128', light: '#FFFFFF' }
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Avtive Digital Profile`,
          text: `Check out ${profile.name}'s digital card on Avtive:`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${profile.slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 text-center space-y-5 transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
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
            <span className="text-xs font-bold text-[#1E3A8A] dark:text-[#60A5FA] tracking-wider font-mono">
              AVTIVE
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl p-0.5 bg-[#1E3A8A]/20 dark:bg-white/20 shadow-md">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover rounded-xl border border-white dark:border-[#0A1128]"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A1128] dark:text-white">
              {profile.name}
            </h3>
            <p className="text-xs text-[#1E3A8A] dark:text-[#60A5FA] font-bold">
              {profile.designation}
            </p>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              {profile.company || 'Avtive'}
            </p>
          </div>
        </div>

        {/* Real Profile QR Code Card */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-white/10 inline-block shadow-inner">
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
          <p className="text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] mt-2.5 font-mono">
            Scan to view digital profile
          </p>
        </div>

        {/* Executive Action Buttons: Share Profile, Copy Link, Download QR */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* 1. Share Profile */}
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] transition-colors active:scale-95 shadow-2xs font-bold"
          >
            <Share2 className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Share Profile</span>
          </button>

          {/* 2. Copy Link */}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#152238] hover:bg-[#E2E8F0] dark:hover:bg-[#1E3050] text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-colors active:scale-95 shadow-2xs font-bold"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA] mb-1" />
            ) : (
              <Copy className="w-4 h-4 mb-1" />
            )}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          {/* 3. Download QR */}
          <button
            onClick={handleDownloadQR}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#152238] hover:bg-[#E2E8F0] dark:hover:bg-[#1E3050] text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 transition-colors active:scale-95 shadow-2xs font-bold"
          >
            <Download className="w-4 h-4 mb-1" />
            <span className="text-[10px]">Download QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
