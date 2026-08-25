'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Share2 } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface QRCodeCardProps {
  profile: ProfileData;
  onOpenQRModal: () => void;
  onCopyLink: () => void;
  onOpenShare?: () => void;
  isDark?: boolean;
}

export function QRCodeCard({ profile, onOpenQRModal, onCopyLink, onOpenShare, isDark }: QRCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://www.avtive.app';
    QRCode.toDataURL(url, {
      width: 260,
      margin: 1,
      color: { dark: '#0A1128', light: '#FFFFFF' }
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error(err));
  }, [profile]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${profile.slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="px-6 sm:px-8 py-5 bg-white dark:bg-[#0A1128] transition-colors">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 flex items-center gap-4 text-left shadow-2xs">
        {/* QR Box */}
        <div
          onClick={onOpenShare || onOpenQRModal}
          className="cursor-pointer w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-xs border border-[#E2E8F0] shrink-0 flex items-center justify-center hover:scale-105 transition-transform"
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <QrCode className="w-8 h-8 text-slate-300 animate-pulse" />
          )}
        </div>

        {/* QR Info & Actions */}
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="text-sm font-bold text-[#0A1128] dark:text-white">
              Scan to Save My Profile
            </h3>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              Scan with your phone camera to view or save digital card.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#152238] text-[11px] font-bold text-[#0A1128] dark:text-white border border-[#E2E8F0] dark:border-white/10 hover:bg-[#F1F5F9] transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0A1128] hover:bg-[#152238] dark:bg-white dark:hover:bg-slate-100 text-[11px] font-bold text-white dark:text-[#0A1128] transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
