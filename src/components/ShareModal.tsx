'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  QrCode, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Loader2, 
  Smartphone, 
  Mail, 
  FileText, 
  Code, 
  Briefcase, 
  FolderGit2, 
  Award, 
  Heart, 
  Languages as LanguagesIcon, 
  MessageSquare, 
  Building2, 
  CreditCard,
  Sliders,
  ListOrdered,
  Sparkles
} from 'lucide-react';
import { ProfileData, SharingSettings } from '../types/profile';
import { getThemeConfig } from './themeStyles';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onCopySuccess?: () => void;
  isOwner?: boolean;
  onUpdateProfile?: (updatedProfile: ProfileData) => void;
}

type TabKey = 'share' | 'visibility' | 'reorder' | 'preview';

interface SectionMeta {
  key: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  settingKey?: keyof SharingSettings;
}

const ALL_SECTIONS: SectionMeta[] = [
  { key: 'company', name: 'Company Affiliation', desc: 'Organization badge & details', icon: Building2, settingKey: 'companySection' },
  { key: 'about', name: 'About & Bio', desc: 'Summary story and headline', icon: FileText, settingKey: 'bio' },
  { key: 'services', name: 'Services & Skills', desc: 'Capabilities and tags', icon: Code, settingKey: 'skills' },
  { key: 'experience', name: 'Work Experience', desc: 'Career history and roles', icon: Briefcase, settingKey: 'experience' },
  { key: 'projects', name: 'Portfolio Projects', desc: 'Case studies and works', icon: FolderGit2, settingKey: 'projects' },
  { key: 'certifications', name: 'Certifications', desc: 'Credentials and licenses', icon: Award, settingKey: 'certifications' },
  { key: 'volunteer', name: 'Volunteer Experience', desc: 'Causes and community roles', icon: Heart, settingKey: 'volunteer' },
  { key: 'languages', name: 'Languages', desc: 'Spoken and written proficiencies', icon: LanguagesIcon, settingKey: 'languages' },
  { key: 'recommendations', name: 'Recommendations', desc: 'Endorsements and testimonials', icon: MessageSquare, settingKey: 'recommendations' },
  { key: 'virtual-card', name: 'Virtual Identity Card', desc: 'Interactive NFC card pass', icon: CreditCard, settingKey: 'nfcCard' }
];

export function ShareModal({
  isOpen,
  onClose,
  profile,
  onCopySuccess,
  isOwner = false,
  onUpdateProfile
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('share');
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Local mutable state for owner settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>(
    profile.sharingSettings || {
      photo: true,
      nameAndTitle: true,
      bio: true,
      contactInfo: true,
      email: true,
      phone: true,
      socialLinks: true,
      skills: true,
      experience: true,
      education: true,
      certifications: true,
      projects: true,
      services: true,
      volunteer: true,
      languages: true,
      recommendations: true,
      companySection: true,
      nfcCard: true
    }
  );

  const [sectionOrder, setSectionOrder] = useState<string[]>(
    profile.sectionOrder && profile.sectionOrder.length > 0
      ? profile.sectionOrder.filter((k) => k !== 'hero')
      : ALL_SECTIONS.map((s) => s.key)
  );

  const theme = getThemeConfig(profile.theme || 'elegant');
  const identifier = profile.slug || profile.id;
  const canonicalPublicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${identifier}`
    : `https://www.avtive.app/profile/${identifier}`;

  // Sync state whenever profile changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (profile.sharingSettings) {
        setSharingSettings(profile.sharingSettings);
      }
      if (profile.sectionOrder && profile.sectionOrder.length > 0) {
        setSectionOrder(profile.sectionOrder.filter((k) => k !== 'hero'));
      }
      setSaveMessage(null);
    }
  }, [isOpen, profile]);

  // Generate QR Code
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(canonicalPublicUrl, {
        width: 340,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, canonicalPublicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalPublicUrl);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${identifier}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Avtive Digital Identity`,
          text: `Connect with ${profile.name} (${profile.designation || 'Professional'}) on Avtive`,
          url: canonicalPublicUrl
        });
      } catch (err) {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  const handleToggleSetting = (key: keyof SharingSettings) => {
    setSharingSettings((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }));
  };

  // Reordering helpers
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSectionOrder(updated);
  };

  const handleToggleSectionVisibility = (sectionKey: string) => {
    const meta = ALL_SECTIONS.find((s) => s.key === sectionKey);
    if (meta && meta.settingKey) {
      handleToggleSetting(meta.settingKey);
    }
  };

  // Save changes to backend
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/profile/share-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          sharingSettings,
          sectionOrder: ['hero', ...sectionOrder]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSaveMessage('✓ Sharing settings & section order saved successfully!');
      if (onUpdateProfile && data.profile) {
        onUpdateProfile(data.profile);
      }
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving share settings:', err);
      setSaveMessage(`Error: ${err.message || 'Failed to save.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[28px] sm:rounded-[36px] ${theme.cardBg} border ${theme.cardBorder} shadow-2xl overflow-hidden transition-colors`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b ${theme.divider} flex items-center justify-between gap-3 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl overflow-hidden border ${theme.cardBorder} shrink-0 bg-slate-100 dark:bg-zinc-800`}>
              <img
                src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-sm sm:text-base font-bold truncate ${theme.textPrimary}`}>
                  {profile.name}
                </h3>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${theme.badgeBg} ${theme.badgeText} font-bold font-mono shrink-0`}>
                  {theme.name}
                </span>
              </div>
              <p className={`text-xs ${theme.textSecondary} truncate`}>
                {profile.designation || 'Professional Profile'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full ${theme.textMuted} hover:${theme.textPrimary} ${theme.subCardBg} transition-colors shrink-0`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Owner gets full controls) */}
        {isOwner && (
          <div className={`px-4 pt-2 border-b ${theme.divider} flex items-center gap-1 overflow-x-auto shrink-0`}>
            <button
              onClick={() => setActiveTab('share')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'share'
                  ? `border-current ${theme.accentText}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Share & QR</span>
            </button>

            <button
              onClick={() => setActiveTab('visibility')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'visibility'
                  ? `border-current ${theme.accentText}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visibility</span>
            </button>

            <button
              onClick={() => setActiveTab('reorder')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'reorder'
                  ? `border-current ${theme.accentText}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Section Order</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? `border-current ${theme.accentText}`
                  : `border-transparent ${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: SHARE & QR CODE */}
          {activeTab === 'share' && (
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-150">
              <div className={`p-4 rounded-3xl ${theme.subCardBg} border ${theme.subCardBorder} shadow-inner inline-block`}>
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Profile QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-2xl shadow-xs"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center text-xs text-slate-400">
                    <QrCode className="w-10 h-10 animate-pulse text-slate-400" />
                  </div>
                )}
                <p className={`text-[11px] font-semibold ${theme.textMuted} mt-2.5 font-mono`}>
                  Scan to view digital profile & save contact
                </p>
              </div>

              {/* Public URL Box */}
              <div className="w-full flex items-center gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300">
                <span className="truncate flex-1 px-2">{canonicalPublicUrl}</span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shrink-0 transition-all active:scale-95 shadow-xs`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <button
                  onClick={handleNativeShare}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-xs transition-all active:scale-95`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Profile</span>
                </button>

                <button
                  onClick={handleDownloadQR}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl ${theme.btnSecondary} font-bold text-xs transition-all active:scale-95`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VISIBILITY TOGGLES (Zero-Tolerance Public Hiding) */}
          {activeTab === 'visibility' && isOwner && (
            <div className="space-y-3 animate-in fade-in duration-150 text-left">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Toggle which fields & sections are visible to public visitors. Disabled fields are filtered out server-side for complete privacy.
              </div>

              <div className="space-y-2">
                {[
                  { key: 'phone', label: 'Phone Number & WhatsApp', desc: 'Direct calling & messaging buttons', icon: Smartphone },
                  { key: 'email', label: 'Email Address', desc: 'Public email contact link', icon: Mail },
                  { key: 'bio', label: 'Bio & About Headline', desc: 'Short headline and about story', icon: FileText },
                  { key: 'skills', label: 'Skills & Capabilities', desc: 'Skill pills and tags', icon: Code },
                  { key: 'services', label: 'Services Offered', desc: 'Service offerings & inquiry', icon: Sparkles },
                  { key: 'experience', label: 'Work Experience', desc: 'Employment history and roles', icon: Briefcase },
                  { key: 'projects', label: 'Portfolio Projects', desc: 'Featured projects and works', icon: FolderGit2 },
                  { key: 'certifications', label: 'Certifications', desc: 'Licenses and certifications', icon: Award },
                  { key: 'volunteer', label: 'Volunteer Experience', desc: 'Community and non-profit roles', icon: Heart },
                  { key: 'languages', label: 'Languages', desc: 'Spoken and written proficiencies', icon: LanguagesIcon },
                  { key: 'recommendations', label: 'Recommendations', desc: 'Endorsements and testimonials', icon: MessageSquare },
                  { key: 'companySection', label: 'Company Affiliation', desc: 'Connected organization card', icon: Building2 },
                  { key: 'nfcCard', label: 'Virtual Card (NFC)', desc: 'Interactive 3D digital pass preview', icon: CreditCard }
                ].map(({ key, label, desc, icon: Icon }) => {
                  const isVisible = sharingSettings[key as keyof SharingSettings] !== false;
                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleSetting(key as keyof SharingSettings)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isVisible
                          ? `${theme.cardBg} ${theme.cardBorder} hover:opacity-90`
                          : 'bg-slate-50 dark:bg-zinc-900/40 border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isVisible ? `${theme.badgeBg} ${theme.accentText}` : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isVisible ? theme.textPrimary : 'text-slate-500'}`}>
                            {label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {desc}
                          </p>
                        </div>
                      </div>

                      {/* Switch Pill */}
                      <button
                        type="button"
                        aria-pressed={isVisible}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          isVisible ? theme.btnPrimary : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-xs ${
                          isVisible ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SECTION REORDERING */}
          {activeTab === 'reorder' && isOwner && (
            <div className="space-y-4 animate-in fade-in duration-150 text-left">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Use the <span className="font-bold">▲</span> and <span className="font-bold">▼</span> arrows to customize the order sections appear on your public card.
              </div>

              <div className="space-y-2">
                {sectionOrder.map((sectionKey, index) => {
                  const meta = ALL_SECTIONS.find((s) => s.key === sectionKey);
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const isVisible = meta.settingKey ? sharingSettings[meta.settingKey] !== false : true;

                  return (
                    <div
                      key={sectionKey}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isVisible
                          ? `${theme.cardBg} ${theme.cardBorder}`
                          : 'bg-slate-50/60 dark:bg-zinc-900/30 border-dashed border-slate-200 dark:border-zinc-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-400 w-4 text-center shrink-0">
                          {index + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isVisible ? `${theme.badgeBg} ${theme.accentText}` : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isVisible ? theme.textPrimary : 'text-slate-500'}`}>
                            {meta.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                            {isVisible ? 'Active & Visible' : 'Hidden from public'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSectionVisibility(sectionKey)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            isVisible 
                              ? `${theme.subCardBg} ${theme.textSecondary} ${theme.subCardBorder} hover:opacity-80`
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 border-slate-300 dark:border-zinc-700'
                          }`}
                          title={isVisible ? 'Hide Section' : 'Show Section'}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, 'up')}
                          className={`p-1.5 rounded-lg border text-xs transition-colors disabled:opacity-30 ${theme.subCardBg} ${theme.textSecondary} ${theme.subCardBorder} hover:opacity-80`}
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={index === sectionOrder.length - 1}
                          onClick={() => handleMoveSection(index, 'down')}
                          className={`p-1.5 rounded-lg border text-xs transition-colors disabled:opacity-30 ${theme.subCardBg} ${theme.textSecondary} ${theme.subCardBorder} hover:opacity-80`}
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: REAL-TIME THEME LIVE PREVIEW */}
          {activeTab === 'preview' && isOwner && (
            <div className="space-y-4 animate-in fade-in duration-150 text-left">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${theme.accentText}`}>
                  Theme Preview ({theme.name})
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Reflects active visibility & sequence
                </span>
              </div>

              {/* Scaled-down interactive visual simulation */}
              <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${theme.container}`}>
                {/* Simulated Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-inherit">
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden border shrink-0 ${theme.cardBorder}`}>
                    <img
                      src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${theme.textPrimary}`}>
                      {profile.name}
                    </h4>
                    <p className={`text-xs ${theme.accentText} truncate`}>
                      {profile.designation}
                    </p>
                    <p className={`text-[11px] ${theme.textSecondary} truncate`}>
                      {profile.company || 'Avtive'}
                    </p>
                  </div>
                </div>

                {/* Simulated Active Sections */}
                <div className="space-y-2 pt-1">
                  {sectionOrder.map((sectionKey) => {
                    const meta = ALL_SECTIONS.find((s) => s.key === sectionKey);
                    if (!meta) return null;
                    const isVisible = meta.settingKey ? sharingSettings[meta.settingKey] !== false : true;
                    if (!isVisible) return null;

                    const Icon = meta.icon;
                    return (
                      <div
                        key={sectionKey}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${theme.subCardBg} ${theme.subCardBorder}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${theme.accentText}`} />
                          <span className={`text-xs font-semibold ${theme.textPrimary}`}>
                            {meta.name}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                          Visible
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        {isOwner && (activeTab === 'visibility' || activeTab === 'reorder') && (
          <div className={`p-4 border-t ${theme.divider} flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30`}>
            {saveMessage ? (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate flex-1">
                {saveMessage}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 truncate flex-1">
                Changes take effect immediately upon saving.
              </p>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0`}
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Share Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
