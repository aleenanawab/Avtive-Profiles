'use client';

import React from 'react';
import { Award, Plus, X, ExternalLink } from 'lucide-react';
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
  const certs: CertificationItem[] = profile.certifications || [];
  const hasCerts = certs.length > 0;

  if (!hasCerts && !canEdit && !isEditing) {
    return null;
  }

  const handleAddCert = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issued: new Date().getFullYear().toString(),
      expires: '',
      credentialId: '',
      url: ''
    };
    const updated = [newCert, ...certs];
    onUpdateField?.('certifications', updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<CertificationItem>) => {
    const updated = certs.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onUpdateField?.('certifications', updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = certs.filter((c) => c.id !== id);
    onUpdateField?.('certifications', updated);
  };

  return (
    <section 
      onClick={() => canEdit && !isEditing && onSelectSection?.('certifications')}
      className={`px-4 sm:px-6 md:px-8 py-5 space-y-3.5 text-left ${theme.cardBg} border-b ${theme.divider} transition-colors ${
        canEdit && !isEditing && onSelectSection ? 'cursor-pointer hover:bg-accent/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-bold tracking-tight ${theme.textPrimary}`}>
          Certifications
        </h2>
        {isEditing ? (
          <button
            type="button"
            onClick={handleAddCert}
            className={`flex items-center gap-1 text-[11px] font-bold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        ) : (
          canEdit && onSelectSection && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
              Click to edit
            </span>
          )
        )}
      </div>

      {hasCerts ? (
        <div className="space-y-3">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-2xs relative`}
            >
              {isEditing ? (
                /* Editable Certification Card */
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Certification Title / Name
                        </label>
                        <input
                          type="text"
                          value={cert.name || (cert as any).title || ''}
                          onChange={(e) => handleUpdateItem(cert.id, { name: e.target.value })}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className={`w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                          Issuer / Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => handleUpdateItem(cert.id, { issuer: e.target.value })}
                          placeholder="e.g. Amazon Web Services"
                          className={`w-full text-xs font-bold p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textPrimary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(cert.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      title="Remove certification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Issued Date
                      </label>
                      <input
                        type="text"
                        value={cert.issued || ''}
                        onChange={(e) => handleUpdateItem(cert.id, { issued: e.target.value })}
                        placeholder="e.g. 2023"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Expiration (Optional)
                      </label>
                      <input
                        type="text"
                        value={cert.expires || ''}
                        onChange={(e) => handleUpdateItem(cert.id, { expires: e.target.value })}
                        placeholder="e.g. 2026 / Never"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Credential ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={cert.credentialId || ''}
                        onChange={(e) => handleUpdateItem(cert.id, { credentialId: e.target.value })}
                        placeholder="e.g. AWS-12345"
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase font-mono ${theme.textMuted}`}>
                        Credential URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={cert.url || ''}
                        onChange={(e) => handleUpdateItem(cert.id, { url: e.target.value })}
                        placeholder="https://..."
                        className={`w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 ${theme.textSecondary} placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-slate-400`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View Certification Card */
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl ${theme.badgeBg} ${theme.accentText} flex items-center justify-center shrink-0 border ${theme.cardBorder} shadow-2xs`}>
                    <Award className="w-4.5 h-4.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                        {cert.name || (cert as any).title}
                      </h3>
                      {cert.url && (
                        <a
                          href={cert.url.startsWith('http://') || cert.url.startsWith('https://') ? cert.url : `https://${cert.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline shrink-0 ${theme.accentText}`}
                          title="Verify credential"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
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
              )}
            </div>
          ))}

          {isEditing && (
            <button
              type="button"
              onClick={handleAddCert}
              className={`w-full py-2 border border-dashed border-cyan-500/30 rounded-xl text-xs font-semibold ${theme.accentText} hover:bg-cyan-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Certificate</span>
            </button>
          )}
        </div>
      ) : (
        isEditing ? (
          <div className={`p-5 rounded-2xl ${theme.cardBg} border border-dashed border-cyan-500/30 text-center space-y-2.5`}>
            <p className={`text-xs ${theme.textMuted}`}>
              No certifications added yet.
            </p>
            <button
              type="button"
              onClick={handleAddCert}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Certificate</span>
            </button>
          </div>
        ) : (
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>
              No certifications added yet.
            </p>
          </div>
        )
      )}
    </section>
  );
}
