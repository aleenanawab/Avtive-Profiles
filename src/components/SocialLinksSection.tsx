'use client';

import React from 'react';
import { 
  Globe, 
  Mail, 
  ArrowUpRight 
} from 'lucide-react';
import { ProfileData } from '../types/profile';
import { LinkedInIcon, TwitterXIcon, GithubIcon, InstagramIcon, FacebookIcon } from './BrandIcons';

interface SocialLinksSectionProps {
  profile: ProfileData;
}

export function SocialLinksSection({ profile }: SocialLinksSectionProps) {
  if (!profile.socials || profile.socials.length === 0) {
    return null;
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />;
      case 'instagram':
        return <InstagramIcon className="w-4 h-4 text-[#E4405F]" />;
      case 'facebook':
        return <FacebookIcon className="w-4 h-4 text-[#1877F2]" />;
      case 'twitter':
        return <TwitterXIcon className="w-4 h-4 text-[#0A1128] dark:text-white" />;
      case 'github':
        return <GithubIcon className="w-4 h-4 text-[#24292F] dark:text-white" />;
      case 'email':
        return <Mail className="w-4 h-4 text-[#EA4335]" />;
      default:
        return <Globe className="w-4 h-4 text-[#2563EB]" />;
    }
  };

  return (
    <section className="px-6 sm:px-8 py-5 space-y-3 text-left bg-white dark:bg-[#0A1128] border-b border-[#E2E8F0] dark:border-white/10 transition-colors">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A1128] dark:text-white/80 font-mono">
        Social & Professional Links
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {profile.socials.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0F172A] dark:hover:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 transition-colors group shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#152238] flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs">
                {getPlatformIcon(item.platform)}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {item.label || item.platform}
                </p>
                <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate font-medium">
                  {item.handle || item.url.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0A1128] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
          </a>
        ))}
      </div>
    </section>
  );
}
