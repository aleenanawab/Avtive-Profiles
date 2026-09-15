'use client';

import React, { useRef } from 'react';
import { 
  User, 
  Users, 
  Camera, 
  Sparkles, 
  Briefcase, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Plus,
  Trash2,
  Share2
} from 'lucide-react';
import { ProfileData, SocialLink } from '@/types/profile';
import { 
  LinkedInIcon, 
  GithubIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon,
  WhatsAppIcon 
} from '@/components/BrandIcons';

interface ProfileInfoManagerProps {
  profile: Partial<ProfileData>;
  onChange: (patch: Partial<ProfileData>) => void;
}

const SUPPORTED_SOCIAL_PLATFORMS: {
  id: SocialLink['platform'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon, placeholder: 'https://linkedin.com/in/username' },
  { id: 'github', label: 'GitHub', icon: GithubIcon, placeholder: 'https://github.com/username' },
  { id: 'twitter', label: 'Twitter / X', icon: TwitterIcon, placeholder: 'https://x.com/username' },
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, placeholder: 'https://youtube.com/@channel' }
];

export function ProfileInfoManager({ profile, onChange }: ProfileInfoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTeam = profile.profileType === 'team' || profile.type === 'company';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to Data URL for instant live preview and persistence
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onChange({ avatar: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileTypeChange = (type: 'individual' | 'team') => {
    onChange({
      profileType: type,
      type: type === 'team' ? 'company' : 'owner'
    });
  };

  const socials = profile.socials || [];

  const handleUpdateSocial = (platform: SocialLink['platform'], url: string) => {
    const existing = socials.find(s => s.platform === platform);
    let updated: SocialLink[];
    if (url.trim() === '') {
      updated = socials.filter(s => s.platform !== platform);
    } else if (existing) {
      updated = socials.map(s => s.platform === platform ? { ...s, url } : s);
    } else {
      updated = [...socials, { platform, url }];
    }
    onChange({ socials: updated });
  };

  return (
    <div className="w-full space-y-7">
      {/* Section Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Profile Information
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Configure your core identity, role, bio, and social channels.
        </p>
      </div>

      {/* 1. Simplified Profile Type: Individual vs Team */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Profile Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleProfileTypeChange('individual')}
            className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              !isTeam
                ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-slate-700 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Individual</span>
          </button>

          <button
            type="button"
            onClick={() => handleProfileTypeChange('team')}
            className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              isTeam
                ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-slate-700 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Team / Project</span>
          </button>
        </div>
      </div>

      {/* 2. Photo / Avatar */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {isTeam ? 'Team Logo / Avatar' : 'Profile Picture'}
        </label>
        
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-200 dark:ring-zinc-700">
            <img
              src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={profile.name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Recommended square image (JPG, PNG or WebP). Updates preview instantly.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Name & Role */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            {isTeam ? 'Team / Brand Name' : 'Full Name'}
          </label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={isTeam ? 'Avtive Web Development Team' : 'Arshia Khan'}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            {isTeam ? 'Team Tagline / Focus' : 'Professional Title / Role'}
          </label>
          <input
            type="text"
            value={profile.professionalTitle || profile.designation || ''}
            onChange={(e) => onChange({ professionalTitle: e.target.value, designation: e.target.value })}
            placeholder={isTeam ? 'Full-Stack Web & Mobile App Engineers' : 'MERN Developer & Designer'}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Bio / Description
          </label>
          <textarea
            rows={3}
            value={profile.bio || profile.shortBio || ''}
            onChange={(e) => onChange({ bio: e.target.value, shortBio: e.target.value })}
            placeholder="Write a brief, compelling introduction..."
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              Company / Organization
            </label>
            <input
              type="text"
              value={profile.company || ''}
              onChange={(e) => onChange({ company: e.target.value })}
              placeholder="Avtive"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              Location
            </label>
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Social Links */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Social Links & Icons
        </label>
        
        <div className="space-y-2.5">
          {SUPPORTED_SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const currentVal = socials.find(s => s.platform === platform.id)?.url || '';
            return (
              <div key={platform.id} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={currentVal}
                  onChange={(e) => handleUpdateSocial(platform.id, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Contact Channels */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Direct Contact Details
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={profile.phone || profile.whatsapp || ''}
                onChange={(e) => onChange({ phone: e.target.value, whatsapp: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
