'use client';

import React from 'react';
import { Globe, Mail, ArrowUpRight } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { LinkedInIcon, TwitterXIcon, GithubIcon, InstagramIcon, FacebookIcon, BehanceIcon } from './BrandIcons';
import { getThemeConfig } from './themeStyles';

interface SocialLinksSectionProps {
  profile: ProfileData;
}

export function SocialLinksSection({ profile }: SocialLinksSectionProps) {
  if (!profile.socials || profile.socials.length === 0) {
    return null;
  }

  const theme = getThemeConfig(profile.theme || 'elegant');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'behance':
        return <BehanceIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'instagram':
        return <InstagramIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'facebook':
        return <FacebookIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'twitter':
        return <TwitterXIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'github':
        return <GithubIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'email':
        return <Mail className={`w-4 h-4 ${theme.accentText}`} />;
      default:
        return <Globe className={`w-4 h-4 ${theme.accentText}`} />;
    }
  };

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
        SOCIAL & PROFESSIONAL LINKS
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {profile.socials.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-3.5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-colors group shadow-2xs`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
                {getPlatformIcon(item.platform)}
              </div>
              <div className="min-w-0 text-left flex-1">
                <p className={`text-xs font-bold ${theme.textPrimary} truncate`}>
                  {item.label || item.platform}
                </p>
                <p className={`text-[11px] ${theme.textSecondary} truncate font-medium`}>
                  {item.handle || item.url.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </div>
            <ArrowUpRight className={`w-4 h-4 ${theme.textMuted} group-hover:${theme.accentText} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2`} />
          </a>
        ))}
      </div>
    </section>
  );
}
