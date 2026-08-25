'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, QrCode } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface QRFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
}

export function QRFullscreenModal({ isOpen, onClose, profile }: QRFullscreenModalProps) {
  const [qrUrl, setQrUrl] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.avtive.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0A1128', light: '#FFFFFF' }
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${profile.slug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#0A1128] border border-[#E2E8F0] dark:border-white/10 shadow-2xl p-6 text-center space-y-5 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#94A3B8] hover:text-[#0A1128] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#152238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Identity */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#1E3A8A] shadow-md"
          />
          <div>
            <h3 className="text-base font-bold text-[#0A1128] dark:text-white">
              {profile.name}
            </h3>
            <p className="text-xs text-[#1E3A8A] dark:text-[#7EC384] font-semibold">
              {profile.designation}
            </p>
          </div>
        </div>

        {/* QR Code Box */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 inline-block shadow-inner">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code" className="w-52 h-52 mx-auto rounded-xl" />
          ) : (
            <div className="w-52 h-52 mx-auto flex items-center justify-center text-xs text-[#94A3B8]">
              <QrCode className="w-10 h-10 animate-pulse text-[#94A3B8]" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Scan with any camera to immediately view or save this card.
          </p>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A1128] font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Resolution QR (.PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
