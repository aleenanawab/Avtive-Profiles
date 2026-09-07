import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { getThemeConfig } from './themeStyles';

interface ContactSectionProps {
  profile: ProfileData;
  onSendMessage?: (data: { name: string; email: string; message: string }) => void;
}

export function ContactSection({ profile }: ContactSectionProps) {
  if (!profile.whatsapp) {
    return null;
  }

  const theme = getThemeConfig(profile.theme || 'elegant');
  const whatsappUrl = `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}%2C%20I%20saw%20your%20Avtive%20profile.`;

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex items-center justify-between gap-3 shadow-2xs`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-2xl ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm font-bold ${theme.textPrimary} truncate`}>
              Send Message on WhatsApp
            </h3>
            <p className={`text-[11px] ${theme.textSecondary} truncate font-medium`}>
              Direct chat with {profile.name.split(' ')[0]}
            </p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
