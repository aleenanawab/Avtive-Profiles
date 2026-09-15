'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Globe, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  FileText, 
  Code2, 
  Briefcase, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  Users, 
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  ProfileData, 
  ProfileTheme, 
  ProfileLink, 
  ensureProfileLinks 
} from '@/types/profile';
import { 
  getThemeConfig, 
  getButtonRadiusClass, 
  getButtonStyleClass 
} from '@/components/themeStyles';
import { 
  LinkedInIcon, 
  GithubIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon,
  WhatsAppIcon 
} from '@/components/BrandIcons';

interface LiveProfileRendererProps {
  profile: Partial<ProfileData>;
  isLiveInteractive?: boolean;
}

export function LiveProfileRenderer({
  profile,
  isLiveInteractive = true
}: LiveProfileRendererProps) {
  const activeTheme = (profile.theme || 'editorial') as ProfileTheme;
  const theme = getThemeConfig(activeTheme);
  const sharing = profile.sharingSettings || {};
  const isTeam = profile.profileType === 'team' || profile.type === 'company';

  // Visibility flags (defaults to true if undefined)
  const showAvatar = sharing.photo !== false;
  const showNameAndTitle = sharing.nameAndTitle !== false;
  const showBio = sharing.bio !== false;
  const showLinks = sharing.links !== false;
  const showSocialLinks = sharing.socialLinks !== false;
  const showContact = sharing.contactInfo !== false;

  const links = ensureProfileLinks(profile).filter(l => l.visible !== false);
  const radiusClass = getButtonRadiusClass(profile.buttonRadius || 'rounded');
  const buttonStyleClass = getButtonStyleClass(profile.buttonStyle || 'solid', activeTheme);

  // Helper for icon rendering
  const renderLinkIcon = (iconKey?: string) => {
    const key = (iconKey || '').toLowerCase();
    const className = "w-4 h-4 shrink-0";
    if (key.includes('github')) return <GithubIcon className={className} />;
    if (key.includes('linkedin')) return <LinkedInIcon className={className} />;
    if (key.includes('instagram')) return <InstagramIcon className={className} />;
    if (key.includes('twitter') || key.includes('x')) return <TwitterIcon className={className} />;
    if (key.includes('youtube')) return <YoutubeIcon className={className} />;
    if (key.includes('whatsapp')) return <WhatsAppIcon className={className} />;
    if (key.includes('store') || key.includes('shop')) return <ShoppingBag className={className} />;
    if (key.includes('doc') || key.includes('resume')) return <FileText className={className} />;
    if (key.includes('code') || key.includes('dev')) return <Code2 className={className} />;
    if (key.includes('calendar') || key.includes('book')) return <Calendar className={className} />;
    if (key.includes('portfolio') || key.includes('work')) return <Briefcase className={className} />;
    return <Globe className={className} />;
  };

  const displayName = profile.name || (profile.firstName ? `${profile.firstName} ${profile.secondName || ''}`.trim() : 'Your Name');
  const displayRole = profile.professionalTitle || profile.designation || (isTeam ? 'Creative Development Team' : 'Product Designer & Engineer');
  const displayBio = profile.bio || profile.shortBio || (isTeam ? 'Building modern digital experiences, applications, and web services.' : 'Creating remarkable digital experiences with precision, craft, and care.');
  const avatarUrl = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  return (
    <div 
      className={`min-h-full w-full flex flex-col justify-between py-6 px-4 transition-colors duration-300 ${theme.pageBg} ${theme.fontFamily}`}
    >
      <div className="w-full flex flex-col items-center max-w-sm mx-auto">
        
        {/* Top Floating Mini Bar */}
        <div className="w-full flex items-center justify-between pb-4 opacity-80">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
              {isTeam ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isTeam ? 'Team' : 'Individual'}
            </span>
          </div>
          <div className={`p-1.5 rounded-full ${theme.badgeBg} ${theme.textPrimary}`}>
            <Share2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Profile Avatar */}
        {showAvatar && (
          <div className="relative mb-3 group">
            <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full overflow-hidden p-1 ring-2 ring-white/30 shadow-lg bg-neutral-100 dark:bg-neutral-800">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            {profile.verified !== false && (
              <div className="absolute bottom-1 right-1 p-1 rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white dark:ring-neutral-900">
                <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
              </div>
            )}
          </div>
        )}

        {/* Name, Handle, and Title */}
        {showNameAndTitle && (
          <div className="text-center mb-2 px-2">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${theme.textPrimary} flex items-center justify-center gap-1.5`}>
              <span>{displayName}</span>
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${theme.accentText}`}>
              {displayRole}
            </p>
            {profile.company && (
              <p className={`text-[11px] mt-0.5 opacity-75 ${theme.textSecondary}`}>
                @{profile.company} {profile.location ? `• ${profile.location}` : ''}
              </p>
            )}
          </div>
        )}

        {/* Bio */}
        {showBio && displayBio && (
          <p className={`text-center text-xs leading-relaxed max-w-xs mb-5 px-1 ${theme.textSecondary}`}>
            {displayBio}
          </p>
        )}

        {/* Social Icons Strip */}
        {showSocialLinks && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {profile.socials && profile.socials.length > 0 ? (
              profile.socials.map((s, idx) => (
                <a
                  key={idx}
                  href={isLiveInteractive ? s.url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs ${theme.badgeBg} ${theme.textPrimary}`}
                  title={s.platform}
                >
                  {renderLinkIcon(s.platform)}
                </a>
              ))
            ) : (
              // Default social handles fallback
              <>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.badgeBg} ${theme.textPrimary}`}>
                  <LinkedInIcon className="w-3.5 h-3.5" />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.badgeBg} ${theme.textPrimary}`}>
                  <GithubIcon className="w-3.5 h-3.5" />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.badgeBg} ${theme.textPrimary}`}>
                  <TwitterIcon className="w-3.5 h-3.5" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Link Cards List (Drag & Drop Reordered) */}
        {showLinks && (
          <div className="w-full space-y-2.5 mb-6">
            {links.length > 0 ? (
              links.map((link) => (
                <a
                  key={link.id}
                  href={isLiveInteractive ? link.url : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className={`group w-full py-3.5 px-4 flex items-center justify-between transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm font-medium ${radiusClass} ${buttonStyleClass}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="opacity-90">{renderLinkIcon(link.icon || link.title)}</span>
                    <span className="truncate font-semibold tracking-tight">{link.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>
              ))
            ) : (
              <div className={`w-full py-6 text-center text-xs opacity-60 border border-dashed rounded-xl ${theme.cardBorder}`}>
                No links added yet.
              </div>
            )}
          </div>
        )}

        {/* Direct Contact Action Row */}
        {showContact && (profile.email || profile.phone || profile.whatsapp) && (
          <div className={`w-full p-3 mb-6 rounded-xl border flex items-center justify-around gap-2 text-xs ${theme.subCardBg} ${theme.subCardBorder}`}>
            {profile.email && (
              <a 
                href={`mailto:${profile.email}`} 
                className={`flex flex-col items-center gap-1 ${theme.textSecondary} hover:${theme.accentText}`}
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px]">Email</span>
              </a>
            )}
            {profile.phone && (
              <a 
                href={`tel:${profile.phone}`} 
                className={`flex flex-col items-center gap-1 ${theme.textSecondary} hover:${theme.accentText}`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px]">Call</span>
              </a>
            )}
            {profile.whatsapp && (
              <a 
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex flex-col items-center gap-1 ${theme.textSecondary} hover:${theme.accentText}`}
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span className="text-[10px]">WhatsApp</span>
              </a>
            )}
          </div>
        )}

      </div>

      {/* Powered by Avtive Footer */}
      <div className="w-full text-center pt-4 pb-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase opacity-50 ${theme.textMuted}`}>
          <Sparkles className="w-3 h-3 text-amber-500" />
          Avtive Digital Profile
        </span>
      </div>
    </div>
  );
}
