'use client';

import React from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Globe, 
  ArrowUpRight,
  Send,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { ProfileData } from '../types/profile';
import { LinkedInIcon, TwitterXIcon, GithubIcon, InstagramIcon, FacebookIcon } from './BrandIcons';

interface DirectContactSectionProps {
  profile: ProfileData;
}

export function DirectContactSection({ profile }: DirectContactSectionProps) {
  const contactOrder = profile.contactOrder || ['whatsapp', 'phone', 'email', 'linkedin', 'website', 'location'];

  // Map of available direct contact channels
  const contactMap: Record<string, {
    label: string;
    value: string;
    href: string;
    target?: string;
    iconBg: string;
    iconColor: string;
    icon: React.ReactNode;
  } | null> = {
    whatsapp: profile.whatsapp ? {
      label: 'WhatsApp',
      value: profile.whatsapp,
      href: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(profile.name)}`,
      target: '_blank',
      iconBg: 'bg-[#25D366]/10 dark:bg-[#25D366]/20',
      iconColor: 'text-[#25D366]',
      icon: <MessageSquare className="w-4 h-4 text-[#25D366]" />
    } : null,

    phone: profile.phone ? {
      label: 'Mobile',
      value: profile.phone,
      href: `tel:${profile.phone.replace(/[^0-9+]/g, '')}`,
      iconBg: 'bg-[#0284C7]/10 dark:bg-[#0284C7]/20',
      iconColor: 'text-[#0284C7]',
      icon: <Phone className="w-4 h-4 text-[#0284C7]" />
    } : null,

    email: profile.email ? {
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      iconBg: 'bg-[#EA4335]/10 dark:bg-[#EA4335]/20',
      iconColor: 'text-[#EA4335]',
      icon: <Mail className="w-4 h-4 text-[#EA4335]" />
    } : null,

    website: profile.website ? {
      label: 'Website',
      value: profile.website.replace(/^https?:\/\//, ''),
      href: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
      target: '_blank',
      iconBg: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/20',
      iconColor: 'text-[#2563EB]',
      icon: <Globe className="w-4 h-4 text-[#2563EB]" />
    } : null,

    location: (profile.location || profile.officeAddress) ? {
      label: 'Location',
      value: profile.officeAddress || profile.location,
      href: profile.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(profile.officeAddress || profile.location)}`,
      target: '_blank',
      iconBg: 'bg-[#EF4444]/10 dark:bg-[#EF4444]/20',
      iconColor: 'text-[#EF4444]',
      icon: <MapPin className="w-4 h-4 text-[#EF4444]" />
    } : null,
  };

  // Add social platforms into the direct contact channels (e.g. LinkedIn, Instagram, etc.)
  if (profile.socials && profile.socials.length > 0) {
    profile.socials.forEach((soc) => {
      if (soc.url) {
        let iconBg = 'bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20';
        let iconColor = 'text-[#0A66C2]';
        let icon = <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />;
        let label = soc.label || 'LinkedIn';

        if (soc.platform === 'instagram') {
          iconBg = 'bg-[#E4405F]/10 dark:bg-[#E4405F]/20';
          iconColor = 'text-[#E4405F]';
          icon = <InstagramIcon className="w-4 h-4 text-[#E4405F]" />;
          label = soc.label || 'Instagram';
        } else if (soc.platform === 'twitter') {
          iconBg = 'bg-slate-900/10 dark:bg-white/20';
          iconColor = 'text-[#0A1128] dark:text-white';
          icon = <TwitterXIcon className="w-4 h-4 text-[#0A1128] dark:text-white" />;
          label = soc.label || 'X / Twitter';
        } else if (soc.platform === 'github') {
          iconBg = 'bg-slate-900/10 dark:bg-white/20';
          iconColor = 'text-[#24292F] dark:text-white';
          icon = <GithubIcon className="w-4 h-4 text-[#24292F] dark:text-white" />;
          label = soc.label || 'GitHub';
        } else if (soc.platform === 'facebook') {
          iconBg = 'bg-[#1877F2]/10 dark:bg-[#1877F2]/20';
          iconColor = 'text-[#1877F2]';
          icon = <FacebookIcon className="w-4 h-4 text-[#1877F2]" />;
          label = soc.label || 'Facebook';
        }

        const socialKey = soc.platform;
        contactMap[socialKey] = {
          label,
          value: soc.handle || soc.url.replace(/^https?:\/\/(www\.)?/, ''),
          href: soc.url.startsWith('http') ? soc.url : `https://${soc.url}`,
          target: '_blank',
          iconBg,
          iconColor,
          icon
        };
      }
    });
  }

  // Add custom contacts to the map
  if (profile.customContacts && profile.customContacts.length > 0) {
    profile.customContacts.forEach((custom) => {
      if (custom.value) {
        let href = custom.url || custom.value;
        if (custom.type === 'phone' && !href.startsWith('tel:')) href = `tel:${custom.value.replace(/[^0-9+]/g, '')}`;
        if (custom.type === 'email' && !href.startsWith('mailto:')) href = `mailto:${custom.value}`;
        if (custom.type === 'whatsapp' && !href.startsWith('https:')) href = `https://wa.me/${custom.value.replace(/[^0-9]/g, '')}`;
        if (custom.type === 'telegram' && !href.startsWith('http')) href = `https://t.me/${custom.value.replace(/^@/, '')}`;
        if (custom.type === 'custom' && !href.startsWith('http') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
          href = `https://${custom.value}`;
        }

        let iconBg = 'bg-[#6366F1]/10 dark:bg-[#6366F1]/20';
        let icon = <LinkIcon className="w-4 h-4 text-[#6366F1]" />;

        if (custom.type === 'telegram') {
          iconBg = 'bg-[#229ED9]/10 dark:bg-[#229ED9]/20';
          icon = <Send className="w-4 h-4 text-[#229ED9]" />;
        } else if (custom.type === 'booking') {
          iconBg = 'bg-[#10B981]/10 dark:bg-[#10B981]/20';
          icon = <Calendar className="w-4 h-4 text-[#10B981]" />;
        }

        contactMap[custom.id] = {
          label: custom.label,
          value: custom.value,
          href,
          target: href.startsWith('tel:') || href.startsWith('mailto:') ? undefined : '_blank',
          iconBg,
          iconColor: 'text-[#6366F1]',
          icon
        };
      }
    });
  }

  // Filter items in custom saved order
  const activeItems = contactOrder
    .map(key => contactMap[key])
    .filter((item): item is NonNullable<typeof item> => item !== null && item !== undefined);

  if (activeItems.length === 0) return null;

  return (
    <div className="pt-4 space-y-2">
      <div className="space-y-1.5">
        {activeItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            target={item.target}
            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0F172A] dark:hover:bg-[#152238] border border-[#E2E8F0] dark:border-white/10 transition-all group shadow-2xs hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-white/10 shadow-2xs`}>
                {item.icon}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                  {item.label}
                </p>
                <p className="text-xs font-semibold text-[#0A1128] dark:text-white truncate">
                  {item.value}
                </p>
              </div>
            </div>

            <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0A1128] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
          </a>
        ))}
      </div>
    </div>
  );
}
