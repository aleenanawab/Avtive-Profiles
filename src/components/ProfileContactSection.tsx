'use client';

import React from 'react';
import { Mail, Phone, MessageSquare, MapPin, Globe } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface ProfileContactSectionProps {
  profile: ProfileData;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  theme?: ThemeConfig;
}

export function ProfileContactSection({
  profile,
  isEditing = false,
  onUpdateField,
  theme = getThemeConfig(profile.theme || 'editorial')
}: ProfileContactSectionProps) {
  const sharing = profile.sharingSettings || {};

  if (!isEditing && sharing.contactInfo === false) {
    return null;
  }

  const hasContactInfo = Boolean(
    (profile.email && sharing.email !== false) ||
    (profile.phone && sharing.phone !== false) ||
    (profile.whatsapp && sharing.phone !== false) ||
    profile.location ||
    profile.website
  );

  if (!hasContactInfo && !isEditing) {
    return null;
  }

  return (
    <section className={`px-6 sm:px-8 py-5 space-y-3 text-left border-b ${theme.divider} ${theme.cardBg} transition-colors`}>
      <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
        Contact
      </h2>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Email Address
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => onUpdateField?.('email', e.target.value)}
              placeholder="email@example.com"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => onUpdateField?.('phone', e.target.value)}
              placeholder="+92 300 1234567"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={profile.whatsapp || ''}
              onChange={(e) => onUpdateField?.('whatsapp', e.target.value)}
              placeholder="+92 312 5175041"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
            />
          </div>

          <div className="space-y-1">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Location / City
            </label>
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => onUpdateField?.('location', e.target.value)}
              placeholder="Islamabad, Pakistan"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
              Website URL
            </label>
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => onUpdateField?.('website', e.target.value)}
              placeholder="https://www.avtive.app"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} ${theme.textPrimary} focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {profile.email && sharing.email !== false && (
            <a
              href={`mailto:${profile.email}`}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} hover:opacity-80 transition-opacity`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
                <Mail className={`w-3.5 h-3.5 ${theme.accentText}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                  Email
                </span>
                <span className={`block text-xs font-semibold ${theme.textPrimary} truncate`}>
                  {profile.email}
                </span>
              </div>
            </a>
          )}

          {profile.phone && sharing.phone !== false && (
            <a
              href={`tel:${profile.phone.replace(/[^0-9+]/g, '')}`}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} hover:opacity-80 transition-opacity`}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                  Phone
                </span>
                <span className={`block text-xs font-semibold ${theme.textPrimary} truncate`}>
                  {profile.phone}
                </span>
              </div>
            </a>
          )}

          {profile.whatsapp && sharing.phone !== false && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} hover:opacity-80 transition-opacity`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                  WhatsApp
                </span>
                <span className={`block text-xs font-semibold ${theme.textPrimary} truncate`}>
                  {profile.whatsapp}
                </span>
              </div>
            </a>
          )}

          {profile.location && (
            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg}`}>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                  Location
                </span>
                <span className={`block text-xs font-semibold ${theme.textPrimary} truncate`}>
                  {profile.location}
                </span>
              </div>
            </div>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${theme.cardBorder} ${theme.subCardBg} hover:opacity-80 transition-opacity`}
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                  Website
                </span>
                <span className={`block text-xs font-semibold ${theme.textPrimary} truncate`}>
                  {profile.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
