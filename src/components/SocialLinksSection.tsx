'use client';

import React from 'react';
import { Globe, Mail, ArrowUpRight, Plus, Trash2, Link2 } from 'lucide-react';
import { ProfileData, SocialLink } from '../types/profile';
import { LinkedInIcon, TwitterXIcon, GithubIcon, InstagramIcon, FacebookIcon, BehanceIcon, WhatsAppIcon } from './BrandIcons';
import { getThemeConfig } from './themeStyles';

interface SocialLinksSectionProps {
  profile: ProfileData;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionId: string) => void;
}

export function SocialLinksSection({ profile, canEdit, isEditing = false, onUpdateField, onSelectSection }: SocialLinksSectionProps) {
  const theme = getThemeConfig(profile.theme || 'elegant');

  const rawSocials: SocialLink[] = (Array.isArray(profile.socials) && profile.socials.length > 0)
    ? (profile.socials as any[])
    : (Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0)
      ? (profile.socialLinks as any[])
      : [];

  const handleAddLink = () => {
    const newLink: SocialLink = {
      platform: 'linkedin',
      url: 'https://linkedin.com/in/',
      label: 'LinkedIn'
    };
    const updated = [...rawSocials, newLink];
    onUpdateField?.('socials', updated);
    onUpdateField?.('socialLinks', updated);
  };

  const handleUpdateItem = (index: number, field: keyof SocialLink, value: any) => {
    const updated = rawSocials.map((s, idx) => 
      idx === index ? { ...s, [field]: value } : s
    );
    onUpdateField?.('socials', updated);
    onUpdateField?.('socialLinks', updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = rawSocials.filter((_, idx) => idx !== index);
    onUpdateField?.('socials', updated);
    onUpdateField?.('socialLinks', updated);
  };

  const getPlatformIcon = (platform: string) => {
    switch ((platform || '').toLowerCase()) {
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
      case 'whatsapp':
        return <WhatsAppIcon className={`w-4 h-4 ${theme.accentText}`} />;
      case 'email':
      case 'mail':
        return <Mail className={`w-4 h-4 ${theme.accentText}`} />;
      default:
        return <Globe className={`w-4 h-4 ${theme.accentText}`} />;
    }
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Social & Professional Links
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddLink}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-1">
          {rawSocials.length === 0 ? (
            <div className={`p-4 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No social or portfolio links added yet.</p>
              <button
                type="button"
                onClick={handleAddLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Link
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rawSocials.map((link, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${theme.cardBg} border ${theme.cardBorder} flex items-center gap-3 relative group/item shadow-2xs`}
                >
                  <div className="space-y-1 w-32 shrink-0">
                    <select
                      value={link.platform || 'website'}
                      onChange={(e) => handleUpdateItem(idx, 'platform', e.target.value)}
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="behance">Behance</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="website">Website</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => handleUpdateItem(idx, 'url', e.target.value)}
                      placeholder="https://... or username"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : rawSocials.length > 0 ? (
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
      ) : (
        <p className={`text-xs ${theme.textSecondary} italic py-1`}>
          No social or professional links added yet.
        </p>
      )}
    </section>
  );
}
