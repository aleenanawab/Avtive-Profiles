'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CertificationsSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function CertificationsSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  onSelectSection
}: CertificationsSectionProps) {
  const hasCerts = profile.certifications && profile.certifications.length > 0;

  if (!hasCerts && !canEdit) {
    return null;
  }

  return (
    <section 
      onClick={() => canEdit && onSelectSection?.('certifications')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Certifications
        </h2>
        {canEdit && onSelectSection && (
          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
            Click to edit
          </span>
        )}
      </div>

      {hasCerts ? (
        <div className="space-y-2.5">
          {profile.certifications!.map((cert) => (
            <div
              key={cert.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex items-start gap-3.5 shadow-2xs`}
            >
              <div className={`w-9 h-9 rounded-xl ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
                <Award className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                    {cert.name || (cert as any).title}
                  </h3>
                </div>

                <p className={`text-[11px] font-semibold ${theme.accentText}`}>
                  {cert.issuer}
                </p>

                <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] ${theme.textMuted} font-mono`}>
                  <span>Issued {cert.issued}</span>
                  {cert.expires && <span>• Expires {cert.expires}</span>}
                  {cert.credentialId && (
                    <span>• ID: <span className={`font-bold ${theme.textPrimary}`}>{cert.credentialId}</span></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
          <p className={`text-xs ${theme.textMuted}`}>
            No certifications added yet.
          </p>
        </div>
      )}
    </section>
  );
}
