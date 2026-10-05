'use client';

import React from 'react';
import { Globe, Mail, ArrowUpRight } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { LinkedInIcon, TwitterXIcon, GithubIcon, InstagramIcon, FacebookIcon, BehanceIcon } from './BrandIcons';
import { getThemeConfig } from './themeStyles';

interface SocialLinksSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  onSelectSection?: (sectionId: string) => void;
}

export function SocialLinksSection({ profile, canEdit, onSelectSection }: SocialLinksSectionProps) {
  const theme = getThemeConfig(profile.theme || 'elegant');

  const rawSocials = (profile.socials && profile.socials.length > 0)
    ? profile.socials
    : (profile.socialLinks && profile.socialLinks.length > 0)
      ? profile.socialLinks
      : [];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <LinkedInIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'behance':
        return <BehanceIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'instagram':
        return <InstagramIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'facebook':
        return <FacebookIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'twitter':
      case 'x':
        return <TwitterXIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'github':
        return <GithubIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'email':
        return <Mail className={`w-4 h-4 ${theme.accentText}`} />;
      default:
        return <Globe className={`w-4 h-4 ${theme.accentText}`} />;
    }
  };

  if (rawSocials.length === 0) {
    if (!canEdit) return null;

    return (
      <section 
        onClick={() => canEdit && onSelectSection?.('socialLinks')}
        className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
          canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
        }`}
      >
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Social & Professional Links
        </h2>
        <p className={`text-xs ${theme.textSecondary} italic py-1`}>
          No social or professional links added yet.
        </p>
      </section>
    );
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('socialLinks')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
        Social & Professional Links
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rawSocials.map((item, idx) => {
          const handleText: string = ('handle' in item && typeof (item as any).handle === 'string' && (item as any).handle)
            ? (item as any).handle
            : (item.url ? item.url.replace(/^https?:\/\//, '') : '');

          return (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-3.5 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} ${theme.hoverBorder} transition-colors group shadow-2xs`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
                  {getPlatformIcon(item.platform)}
                </div>
                <div className="min-w-0 text-left">
                  <p className={`text-xs font-bold ${theme.textPrimary}`}>
                    {item.label || item.platform}
                  </p>
                  <p className={`text-[11px] ${theme.textSecondary} truncate font-medium`}>
                    {handleText}
                  </p>
                </div>
              </div>
              <ArrowUpRight className={`w-4 h-4 ${theme.textMuted} group-hover:${theme.accentText} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2`} />
            </a>
          );
        })}
      </div>
    </section>
  );
}
