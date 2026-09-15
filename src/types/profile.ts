export type ProfileType = 'owner' | 'employee' | 'company' | 'individual' | 'team-member';

export function normalizeProfileType(type?: string): 'owner' | 'employee' | 'company' {
  if (!type || type === 'individual' || type === 'owner') return 'owner';
  if (type === 'team-member' || type === 'employee') return 'employee';
  if (type === 'company') return 'company';
  return 'owner';
}

export type ProfileTheme = 
  | 'editorial' 
  | 'cyber' 
  | 'luxe' 
  | 'default' 
  | 'dark' 
  | 'minimal' 
  | 'professional' 
  | 'elegant' 
  | 'modern'
  | 'gradient'
  | 'soft';

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  visible?: boolean;
  order?: number;
}

export interface SharingSettings {
  photo?: boolean;
  nameAndTitle?: boolean;
  bio?: boolean;
  contactInfo?: boolean;
  email?: boolean;
  phone?: boolean;
  links?: boolean;
  socialLinks?: boolean;
  skills?: boolean;
  experience?: boolean;
  education?: boolean;
  certifications?: boolean;
  projects?: boolean;
  services?: boolean;
  recommendations?: boolean;
  volunteer?: boolean;
  languages?: boolean;
  companySection?: boolean;
  nfcCard?: boolean;
}


export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserConnection {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toProfileId: string;
  toUserId?: string;
  createdAt: string;
  note?: string;
}

export type UserRole = 'owner' | 'team_member' | 'company_admin' | 'visitor';

export type NavigationOrigin = 'company' | 'my_card' | 'direct' | 'team';

export interface SocialLink {
  platform: 'linkedin' | 'instagram' | 'twitter' | 'github' | 'website' | 'email' | 'facebook' | 'dribbble' | 'behance' | 'youtube' | 'whatsapp' | 'phone' | 'other';
  url: string;
  label?: string;
  handle?: string;
}

export interface MetricHighlight {
  label: string;
  value: string;
  description?: string;
}

export interface SkillItem {
  name: string;
  category?: string;
  level?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  coverImage?: string;
  image?: string;
  category?: string;
  technology?: string;
  tags?: string[];
  liveUrl?: string;
  link?: string;
  imagePosition?: string;
  imageFit?: 'cover' | 'contain';
  client?: string;
  year?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  period?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  role?: string;
  company: string;
  period?: string;
  location?: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
  credentialId?: string;
  url?: string;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  category?: string;
}

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export interface RecommendationItem {
  id: string;
  author: string;
  designation?: string;
  company?: string;
  summary: string;
  fullText?: string;
  avatar?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  designation: string;
  company: string;
  avatar: string;
  rating?: number;
  date?: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  bio: string;
  email?: string;
  phone?: string;
  profileId?: string;
  socials?: SocialLink[];
}

export interface CompanyInfo {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  employeeCount?: string;
  profileId: string;
}

export interface CustomCta {
  label: string;
  url: string;
  active: boolean;
}

export interface DirectContactItem {
  id: string;
  type: 'whatsapp' | 'phone' | 'email' | 'website' | 'location' | 'telegram' | 'booking' | 'custom';
  label: string;
  value: string;
  url?: string;
  active?: boolean;
}

export interface ProfileData {
  id: string;
  userId?: string;
  theme?: ProfileTheme;
  type: ProfileType;
  profileType?: 'individual' | 'team';
  slug: string;
  companyId?: string;
  companyName?: string;
  
  // Linktree-Style Links and Button Styling
  links?: ProfileLink[];
  buttonRadius?: 'square' | 'rounded' | 'pill';
  buttonStyle?: 'solid' | 'outline' | 'soft';
  customThemeColors?: {
    background?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  
  // Identity
  name: string;
  firstName?: string;
  secondName?: string;
  lastName?: string;
  designation?: string;
  professionalTitle?: string;
  department?: string;
  company?: string;
  companyLogo?: string;
  companyInfo?: CompanyInfo;
  tagline?: string;
  coverSlogan?: string;
  avatar: string;
  coverImage?: string;
  verified?: boolean;
  pronouns?: string;
  location: string;
  bio?: string;
  about?: string;
  shortBio?: string;
  fullBio?: string;
  statusBadge?: string;
  customCta?: CustomCta;
  followersCount?: string;
  connectionsCount?: string;

  // Contact Channels
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  bookingUrl?: string;
  officeAddress?: string;
  googleMapsUrl?: string;
  contactOrder?: string[];
  customContacts?: DirectContactItem[];

  // NFC Pass
  nfcCard?: {
    cardNumber: string;
    chipId: string;
    finish?: 'obsidian' | 'white' | 'emerald' | 'gold';
  };

  // Highlights & Sections
  highlights?: MetricHighlight[];
  skills?: (string | SkillItem)[];
  services?: ServiceItem[];
  experience?: ExperienceItem[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  volunteerExperiences?: VolunteerItem[];
  languages?: LanguageItem[];
  recommendations?: RecommendationItem[];
  testimonials?: TestimonialItem[];
  resumeUrl?: string;
  resumeFileName?: string;
  
  // For Company Profiles
  teamMembers?: TeamMemberItem[];

  // Socials
  socials: SocialLink[];
  socialLinks?: { platform: string; url: string; label?: string }[];

  // Multi-Profile Identity & Metadata
  profileName?: string;
  profession?: string;
  createdAt?: string;
  updatedAt?: string;

  // Sharing Configuration & Order
  sharingSettings?: SharingSettings;
  sectionOrder?: string[];
}

export function ensureProfileLinks(profile?: Partial<ProfileData> | null): ProfileLink[] {
  if (profile?.links && Array.isArray(profile.links) && profile.links.length > 0) {
    return profile.links.map((link, idx) => ({
      ...link,
      id: link.id || `link-${idx + 1}`,
      order: typeof link.order === 'number' ? link.order : idx + 1,
      visible: link.visible !== false
    }));
  }

  // Derive initial links gracefully from projects and website if links not yet populated
  const derived: ProfileLink[] = [];
  let order = 1;

  if (profile?.website) {
    derived.push({
      id: 'link-website',
      title: 'Official Website / Portfolio',
      url: profile.website,
      icon: 'website',
      visible: true,
      order: order++
    });
  }

  if (profile?.projects && Array.isArray(profile.projects)) {
    profile.projects.forEach((proj, idx) => {
      const url = proj.liveUrl || proj.link;
      if (url) {
        derived.push({
          id: proj.id || `link-proj-${idx + 1}`,
          title: proj.title || `Project ${idx + 1}`,
          url: url,
          icon: 'portfolio',
          visible: true,
          order: order++
        });
      }
    });
  }

  // If still empty, provide clean default showcase links
  if (derived.length === 0) {
    derived.push(
      {
        id: 'link-portfolio',
        title: 'Portfolio & Case Studies',
        url: 'https://github.com',
        icon: 'portfolio',
        visible: true,
        order: 1
      },
      {
        id: 'link-github',
        title: 'GitHub Repositories & Code',
        url: 'https://github.com',
        icon: 'github',
        visible: true,
        order: 2
      },
      {
        id: 'link-linkedin',
        title: 'Connect on LinkedIn',
        url: 'https://linkedin.com',
        icon: 'linkedin',
        visible: true,
        order: 3
      }
    );
  }

  return derived;
}


