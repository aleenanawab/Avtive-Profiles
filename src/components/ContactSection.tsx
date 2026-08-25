'use client';

import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ProfileData } from '../types/profile';

interface ContactSectionProps {
  profile: ProfileData;
  onSendMessage?: (data: { name: string; email: string; message: string }) => void;
}

export function ContactSection({ profile }: ContactSectionProps) {
  if (!profile.whatsapp) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}%2C%20I%20saw%20your%20Avtive%20profile.`;

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
              Send Message on WhatsApp
            </h3>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate font-medium">
              Direct chat with {profile.name.split(' ')[0]}
            </p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
