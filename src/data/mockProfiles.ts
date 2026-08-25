import { ProfileData } from '../types/profile';

/**
 * Real profile for Syed Mesum Raza Shah
 * Source: Public LinkedIn profile (https://www.linkedin.com/in/syedmesumraza/)
 * Real photo asset served from /images/syed-mesum-raza.png
 */
export const founderProfile: ProfileData = {
  id: 'mesum-raza',
  slug: 'syedmesumraza',
  type: 'individual',
  companyId: 'avtive-company',
  companyName: 'Avtive',
  
  // Identity
  name: 'Syed Mesum Raza Shah',
  designation: 'Strategy-based Artist & Creative Director',
  company: 'Avtive',
  location: 'Islamabad, Pakistan',
  officeAddress: 'NSTP, Islamabad, Pakistan',
  avatar: '/images/syed-mesum-raza.png',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  coverSlogan: 'STRATEGY • DESIGN • DIRECTION',
  verified: false,
  followersCount: '2K+',
  connectionsCount: '500+',
  
  // Real LinkedIn positioning
  shortBio: 'Strategy-based artist with over 10 years of experience creating compelling design solutions that help brands stand out.',
  fullBio: 'Strategy-based artist with over 10 years of experience focusing on creating compelling design solutions that help brands stand out. Specialized in brand identity, visual communication design, animation, photography, video production, and design strategy.',

  // Direct Contact items
  whatsapp: '+92 300 1234567',
  phone: '+92 300 1234567',
  email: 'mesum@avtive.app',
  website: 'https://www.avtive.app',
  googleMapsUrl: 'https://maps.google.com/?q=NSTP+Islamabad+Pakistan',
  contactOrder: ['whatsapp', 'phone', 'email', 'website', 'location'],
  customContacts: [],

  companyInfo: {
    id: 'avtive-company',
    name: 'Avtive',
    tagline: 'Smart Contactless NFC & Cloud Identity Solutions',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
    industry: 'SaaS • NFC Hardware • Digital Identity',
    location: 'NSTP, Islamabad, Pakistan',
    website: 'https://www.avtive.app',
    employeeCount: '11-50',
    profileId: 'company'
  },

  // NFC Pass metadata
  nfcCard: {
    cardNumber: 'AVTIVE • SYED MESUM RAZA SHAH',
    chipId: 'NTAG216-7EC384',
    finish: 'obsidian'
  },

  // Publicly Listed Services / Expertise on LinkedIn
  services: [
    { id: 'srv-1', title: 'Ad Design' },
    { id: 'srv-2', title: '3D Design' },
    { id: 'srv-3', title: 'Animation' },
    { id: 'srv-4', title: 'Brand Design' },
    { id: 'srv-5', title: 'Print Design' },
    { id: 'srv-6', title: 'Visual Design' },
    { id: 'srv-7', title: 'Video Editing' },
    { id: 'srv-8', title: 'Graphic Design' },
    { id: 'srv-9', title: 'Brand Marketing' },
    { id: 'srv-10', title: 'Presentation Design' }
  ],

  // Real Public Professional Experience
  experiences: [
    {
      id: 'exp-1',
      company: 'Avtive',
      role: 'Creative Direction & Strategy',
      location: 'NSTP, Islamabad, Pakistan'
    },
    {
      id: 'exp-2',
      company: 'Financial Monitoring Unit (FMU)',
      role: 'Multimedia Designer',
      period: 'Nov 2021 – Jun 2022'
    },
    {
      id: 'exp-3',
      company: 'USAID – Pakistan',
      role: 'Multimedia Designer',
      period: 'Feb 2021 – Aug 2021'
    }
  ],

  // Real Public Selected Projects
  projects: [
    {
      id: 'proj-1',
      title: 'DIFC | Gate Avenue | Dubai Big Bus Tours Campaign',
      category: 'Campaign & Advertising Design',
      client: 'DIFC Gate Avenue',
      description: 'Offline marketing and advertising campaign design for the Dubai double big bus tours campaign for the client, DIFC Gate Avenue.',
      coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      technology: 'Offline Marketing • Out-of-Home (OOH) Advertising',
      tags: ['Offline Marketing', 'Advertising', 'Campaign Design', 'DIFC Gate Avenue']
    },
    {
      id: 'proj-2',
      title: 'Then Apprentice – Donut Trump Story',
      category: 'Creative Design & Video Production',
      description: 'Creative design and video production services supporting the film’s marketing and advertising.',
      coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
      technology: 'Creative Design • Video Production • Film Marketing',
      tags: ['Creative Design', 'Video Production', 'Film Marketing', 'Advertising']
    }
  ],

  // Real Public Certifications
  certifications: [
    {
      id: 'cert-1',
      name: 'LinkedIn Content and Creative Design Certification',
      issuer: 'LinkedIn',
      issued: 'August 2025',
      expires: 'August 2027',
      credentialId: '5naai9rhydco'
    }
  ],

  // Real Public Volunteer Experience
  volunteerExperiences: [
    {
      id: 'vol-1',
      role: 'Medical Assistant',
      organization: 'Anjuman Janisaran-E-Ahlebait (A.S), Pakistan',
      period: 'Feb 2018 – Present',
      category: 'Social Services'
    }
  ],

  // Real Languages
  languages: [
    {
      language: 'English',
      proficiency: 'Full professional proficiency'
    },
    {
      language: 'Urdu',
      proficiency: 'Native or bilingual proficiency'
    }
  ],

  // Real Public Recommendation
  recommendations: [
    {
      id: 'rec-1',
      author: 'Sehrish Kanwal',
      summary: 'Hard working, cooperative, innovative, strong in creativity and strategic thinking, capable of conceptualizing and executing campaigns, effective in leading brainstorming, and a visionary creative professional.',
      fullText: 'Syed Mesum Raza Shah is exceptionally hardworking, cooperative, and innovative with profound strength in strategic thinking and creative execution. Capable of conceptualizing high-impact campaigns and leading productive brainstorming sessions.'
    }
  ],

  // Real Public Social/Professional Links
  socials: [
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/syedmesumraza/',
      label: 'LinkedIn',
      handle: 'in/syedmesumraza'
    },
    {
      platform: 'website',
      url: 'https://www.avtive.app',
      label: 'Avtive.app',
      handle: 'avtive.app'
    }
  ]
};

/**
 * Team Member Profile (Hamza Malik)
 */
export const teamMemberProfile: ProfileData = {
  id: 'hamza-malik',
  slug: 'hamza-malik',
  type: 'team-member',
  companyId: 'avtive-company',
  companyName: 'Avtive',
  
  name: 'Hamza Malik',
  designation: 'Lead Mobile & NFC Systems Engineer',
  department: 'Hardware Interop & Mobile Engineering',
  company: 'Avtive',
  location: 'Islamabad, Pakistan',
  officeAddress: 'NSTP, Islamabad, Pakistan',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
  coverSlogan: 'NFC ARCHITECTURE • SECURE PROTOCOLS',
  verified: false,
  
  shortBio: 'Specializing in contactless NFC hardware firmware, mobile card readers, and instant vCard synchronization across iOS and Android platforms.',
  fullBio: 'Hamza leads the core mobile and embedded systems engineering at Avtive, architecting ultra-fast NTAG216 chip programming pipelines and native contactless readers.',

  whatsapp: '+92 300 7654321',
  phone: '+92 300 7654321',
  email: 'hamza@avtive.app',
  website: 'https://www.avtive.app',
  contactOrder: ['whatsapp', 'phone', 'email', 'website', 'location'],

  companyInfo: {
    id: 'avtive-company',
    name: 'Avtive',
    tagline: 'Smart Contactless NFC & Cloud Identity Solutions',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
    industry: 'SaaS • NFC Hardware • Digital Identity',
    location: 'NSTP, Islamabad, Pakistan',
    website: 'https://www.avtive.app',
    profileId: 'company'
  },

  services: [
    { id: 'srv-m1', title: 'Mobile NFC Development' },
    { id: 'srv-m2', title: 'Embedded Firmware Engineering' },
    { id: 'srv-m3', title: 'Contactless Protocols' }
  ],

  experiences: [
    {
      id: 'exp-h1',
      company: 'Avtive',
      role: 'Lead Mobile & NFC Systems Engineer',
      location: 'NSTP, Islamabad, Pakistan'
    }
  ],

  languages: [
    { language: 'English', proficiency: 'Full professional proficiency' },
    { language: 'Urdu', proficiency: 'Native or bilingual proficiency' }
  ],

  socials: [
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/avtive',
      label: 'LinkedIn',
      handle: 'company/avtive'
    },
    {
      platform: 'website',
      url: 'https://www.avtive.app',
      label: 'Avtive Platform',
      handle: 'avtive.app'
    }
  ]
};

/**
 * Avtive Company Profile
 */
export const companyProfile: ProfileData = {
  id: 'avtive-company',
  slug: 'avtive',
  type: 'company',
  
  name: 'Avtive',
  designation: 'Smart Contactless NFC & Corporate Identity Platform',
  company: 'Avtive SaaS & Hardware Systems',
  location: 'NSTP, Islamabad, Pakistan',
  officeAddress: 'National Science & Technology Park (NSTP), Islamabad, Pakistan',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  coverSlogan: 'THE DIGITAL IDENTITY STANDARD',
  verified: false,
  
  shortBio: 'Building next-generation smart NFC business cards, enterprise employee directories, and seamless digital identity platforms for forward-thinking organizations.',
  fullBio: 'Avtive is a technology company based at NSTP, Islamabad, specializing in contactless NFC hardware, digital business cards, and scalable organization identity infrastructure.',

  whatsapp: '+92 300 1234567',
  phone: '+92 300 1234567',
  email: 'contact@avtive.app',
  website: 'https://www.avtive.app',
  contactOrder: ['whatsapp', 'phone', 'email', 'website', 'location'],

  services: [
    { id: 'srv-c1', title: 'Smart NFC Digital Cards' },
    { id: 'srv-c2', title: 'Corporate Identity Infrastructure' },
    { id: 'srv-c3', title: 'Team Directory Management' }
  ],

  teamMembers: [
    {
      id: 'tm-1',
      name: 'Syed Mesum Raza Shah',
      role: 'Founder & Creative Director',
      department: 'Executive Strategy & Design',
      avatar: '/images/syed-mesum-raza.png',
      bio: 'Strategy-based artist with over 10 years of experience creating compelling design solutions that help brands stand out.',
      profileId: 'individual'
    },
    {
      id: 'tm-2',
      name: 'Hamza Malik',
      role: 'Lead Mobile & NFC Systems',
      department: 'Hardware Interop & Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      bio: 'Specializing in contactless NFC hardware firmware and instant vCard synchronization.',
      profileId: 'team-member'
    }
  ],

  socials: [
    {
      platform: 'website',
      url: 'https://www.avtive.app',
      label: 'Official Website',
      handle: 'www.avtive.app'
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/avtive',
      label: 'LinkedIn',
      handle: 'company/avtive'
    }
  ]
};
