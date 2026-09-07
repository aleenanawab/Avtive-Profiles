'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ProfileData, 
  ProfileTheme, 
  ProjectItem, 
  ServiceItem, 
  TeamMemberItem,
  UserSession 
} from '@/types/profile';
import { AvtiveDigitalCard, getProfileThemeClasses } from '@/components/AvtiveDigitalCard';
import { getThemeConfig } from '@/components/themeStyles';
import { ShareModal } from '@/components/ShareModal';
import { ExchangeContactModal } from '@/components/ExchangeContactModal';
import { QRFullscreenModal } from '@/components/QRFullscreenModal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { ResumeViewerModal } from '@/components/ResumeViewerModal';
import { NFCTapModal } from '@/components/NFCTapModal';
import { Sun, Moon, LogIn, LogOut, User as UserIcon, Shield, Share2 } from 'lucide-react';

interface PublicProfileClientProps {
  initialProfile: ProfileData;
  session: UserSession | null;
  isOwner: boolean;
}

export function PublicProfileClient({
  initialProfile,
  session,
  isOwner
}: PublicProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ProfileTheme>(
    initialProfile.theme && initialProfile.theme !== 'default' ? initialProfile.theme : 'elegant'
  );
  const [isDark, setIsDark] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const activeThemeConfig = getThemeConfig(activeTheme);

  // Check connection status on mount if authenticated and not owner
  useEffect(() => {
    if (session && !isOwner) {
      fetch(`/api/profile/connect?profileId=${encodeURIComponent(profile.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.connected) setIsConnected(true);
        })
        .catch(() => {});
    }
  }, [session, isOwner, profile.id]);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isNFCTapModalOpen, setIsNFCTapModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check URL parameters for ?edit=true and ?connect=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('edit') === 'true' && isOwner) {
        setIsEditing(true);
      }
      if (searchParams.get('connect') === 'true' && session && !isOwner) {
        setIsConnectModalOpen(true);
      }
    }
  }, [isOwner, session]);

  const handleOpenConnect = () => {
    if (!session) {
      showToast(`Please sign in to connect with ${profile.name}`);
      const returnUrl = `/profile/${profile.slug || profile.id}?connect=true`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    setIsConnectModalOpen(true);
  };

  useEffect(() => {
    const hasDark = document.documentElement.classList.contains('dark');
    setIsDark(hasDark);
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // vCard download
  const handleDownloadVCard = () => {
    const p = profile;
    const nameParts = p.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${p.name}`,
      `N:${lastName};${firstName};;;`,
      `ORG:${p.company || 'Avtive'};${p.department || ''}`,
      `TITLE:${p.designation || ''}`,
      p.phone ? `TEL;TYPE=CELL,VOICE:${p.phone}` : '',
      p.email ? `EMAIL;TYPE=PREF,INTERNET:${p.email}` : '',
      `URL;TYPE=WORK:${p.website || 'https://www.avtive.app'}`,
      `ADR;TYPE=WORK:;;${p.officeAddress || p.location};Islamabad;;;Pakistan`,
      `NOTE:${p.shortBio || ''}`,
      'END:VCARD'
    ].filter(Boolean);

    const vCardString = vCardLines.join('\r\n');
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.slug || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`✓ Digital Card saved: ${p.name} (.vcf downloaded)`);
  };

  // Inline Save handler (Owner only)
  const handleSaveEdits = async (updatedData: ProfileData) => {
    if (!isOwner) {
      showToast('Forbidden: You do not have permission to edit this profile.');
      return;
    }

    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: profile.id,
        updatedData
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save profile changes.');
    }

    setProfile(data.updatedProfile);
    setActiveTheme(
      data.updatedProfile.theme && data.updatedProfile.theme !== 'default'
        ? data.updatedProfile.theme
        : 'elegant'
    );
    setIsEditing(false);
    showToast('✓ Profile updated successfully!');
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${activeThemeConfig.pageBg} ${activeThemeConfig.textPrimary} transition-colors duration-200`}>
      {/* Top Bar for Public View */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md ${activeThemeConfig.headerBg}`}>
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/images/avtive-symbol.png" alt="Avtive" className="h-7 w-auto object-contain" />
            <span className={`font-bold text-sm ${activeThemeConfig.accentText}`}>Avtive</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeThemeConfig.badgeBg} ${activeThemeConfig.badgeText} font-bold font-mono`}>
              Public Profile
            </span>
          </Link>

          {/* Right Controls: Theme + Auth State + Share */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-xl ${activeThemeConfig.textPrimary} ${activeThemeConfig.cardBg} border ${activeThemeConfig.cardBorder} hover:opacity-90 transition-colors shadow-2xs font-bold text-xs`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#475569]" />}
            </button>

            {/* Share Profile Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${activeThemeConfig.btnPrimary} font-bold text-xs shadow-2xs transition-all active:scale-95`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Auth Indicator */}
            {session ? (
              <div className="flex items-center gap-2 pl-1">
                {isOwner && (
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${activeThemeConfig.badgeBg} ${activeThemeConfig.badgeText}`}>
                    Owner
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl ${activeThemeConfig.cardBg} hover:opacity-90 text-xs font-bold ${activeThemeConfig.textSecondary} border ${activeThemeConfig.cardBorder} transition-colors`}
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${activeThemeConfig.cardBg} hover:opacity-90 ${activeThemeConfig.textPrimary} border ${activeThemeConfig.cardBorder} text-xs font-bold transition-colors shadow-2xs`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Viewport */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8 flex justify-center">
        <div className="w-full">
          <AvtiveDigitalCard
            profile={{ ...profile, theme: activeTheme }}
            canEdit={isOwner}
            isEditing={isEditing}
            isConnected={isConnected}
            onOpenEdit={() => {
              if (isOwner) setIsEditing(true);
            }}
            onSaveEdits={handleSaveEdits}
            onCancelEdit={() => {
              setIsEditing(false);
              setActiveTheme(
                profile.theme && profile.theme !== 'default' ? profile.theme : 'elegant'
              );
            }}
            onThemePreview={(theme) => setActiveTheme(theme)}
            onSaveContact={handleDownloadVCard}
            onOpenShare={() => setIsShareModalOpen(true)}
            onOpenConnect={handleOpenConnect}
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onInquireService={handleOpenConnect}
            onSendMessage={() => showToast('✓ Message sent successfully')}
            onViewCompany={() => {
              router.push(`/profile/${profile.companyInfo?.id || profile.companyId || 'avtive'}`);
            }}
            onSelectTeamMember={(member) => {
              const target = member.profileId || (member.name.toLowerCase().includes('mesum') ? 'syedmesumraza' : 'hamza-malik');
              router.push(`/profile/${target}`);
            }}
            isDark={isDark}
          />
        </div>
      </main>

      {/* Modals Container */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onCopySuccess={() => showToast('✓ Canonical profile link copied to clipboard')}
      />

      <ExchangeContactModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        profile={profile}
        session={session}
        onSuccess={() => {
          setIsConnected(true);
          showToast(`✓ Contact details sent & connected with ${profile.name}`);
        }}
      />

      <QRFullscreenModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profile={profile}
      />

      <ProjectDetailModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        profile={{ ...profile, theme: activeTheme }}
      />

      <ResumeViewerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
      />

      <NFCTapModal
        isOpen={isNFCTapModalOpen}
        onClose={() => setIsNFCTapModalOpen(false)}
        profile={profile}
        onSaveContact={handleDownloadVCard}
        onExchangeContact={() => {
          setIsNFCTapModalOpen(false);
          setIsConnectModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl ${activeThemeConfig.btnPrimary} text-xs font-bold shadow-2xl border ${activeThemeConfig.cardBorder} animate-in fade-in slide-in-from-bottom-3 duration-200`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
