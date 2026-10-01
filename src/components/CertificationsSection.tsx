'use client';

import React from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { ProfileData, CertificationItem } from '../types/profile';
import { ThemeConfig, getThemeConfig } from './themeStyles';

interface CertificationsSectionProps {
  profile: ProfileData;
  theme?: ThemeConfig;
  canEdit?: boolean;
  isEditing?: boolean;
  onUpdateField?: (field: keyof ProfileData, value: any) => void;
  onSelectSection?: (sectionKey: string, fieldKey?: string) => void;
}

export function CertificationsSection({ 
  profile, 
  theme = getThemeConfig(profile.theme || 'elegant'),
  canEdit = false,
  isEditing = false,
  onUpdateField,
  onSelectSection
}: CertificationsSectionProps) {
  const certifications: CertificationItem[] = profile.certifications || [];
  const hasCerts = certifications.length > 0;

  const handleAddCert = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issued: '2023',
      expires: '',
      credentialId: ''
    };
    const updated = [newCert, ...certifications];
    onUpdateField?.('certifications', updated);
  };

  const handleUpdateItem = (id: string, field: keyof CertificationItem, value: string) => {
    const updated = certifications.map((c) => 
      c.id === id ? { ...c, [field]: value } : c
    );
    onUpdateField?.('certifications', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = certifications.filter((c) => c.id !== id);
    onUpdateField?.('certifications', updated);
  };

  return (
    <section 
      className={`px-6 sm:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className={`w-4 h-4 ${theme.accentText}`} />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.textPrimary} font-mono`}>
            Certifications & Honors
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleAddCert}
            className={`flex items-center gap-1 text-xs font-bold ${theme.accentText} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-1">
          {certifications.length === 0 ? (
            <div className={`p-5 rounded-2xl border border-dashed ${theme.cardBorder} text-center space-y-2`}>
              <p className={`text-xs ${theme.textMuted}`}>No certifications or honors listed yet.</p>
              <button
                type="button"
                onClick={handleAddCert}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.btnPrimary} cursor-pointer`}
              >
                + Add First Certification
              </button>
            </div>
          ) : (
            certifications.map((cert, idx) => (
              <div
                key={cert.id || idx}
                className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} space-y-3 relative group/item shadow-2xs`}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.textMuted}`}>
                    Certification #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(cert.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove this certification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Certification Title
                    </label>
                    <input
                      type="text"
                      value={cert.name || (cert as any).title || ''}
                      onChange={(e) => {
                        handleUpdateItem(cert.id, 'name', e.target.value);
                        handleUpdateItem(cert.id, 'title' as any, e.target.value);
                      }}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => handleUpdateItem(cert.id, 'issuer', e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Issued Date
                    </label>
                    <input
                      type="text"
                      value={cert.issued || ''}
                      onChange={(e) => handleUpdateItem(cert.id, 'issued', e.target.value)}
                      placeholder="e.g. May 2023"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Expires (Optional)
                    </label>
                    <input
                      type="text"
                      value={cert.expires || ''}
                      onChange={(e) => handleUpdateItem(cert.id, 'expires', e.target.value)}
                      placeholder="e.g. May 2026"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[10px] font-bold ${theme.textMuted} uppercase font-mono`}>
                      Credential ID / URL
                    </label>
                    <input
                      type="text"
                      value={cert.credentialId || ''}
                      onChange={(e) => handleUpdateItem(cert.id, 'credentialId', e.target.value)}
                      placeholder="e.g. AWS-12345678"
                      className={`w-full p-2 rounded-xl text-xs font-semibold ${theme.subCardBg} border ${theme.cardBorder} ${theme.textPrimary} focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : hasCerts ? (
        <div className="space-y-2.5">
          {certifications.map((cert) => (
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
                  {cert.issued && <span>Issued {cert.issued}</span>}
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
