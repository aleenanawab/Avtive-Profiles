import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { ProfileData, UserRecord, ProfileTheme, UserConnection, SharingSettings } from '@/types/profile';
import { founderProfile, teamMemberProfile, companyProfile } from '@/data/mockProfiles';

export const DEFAULT_SHARING_SETTINGS: SharingSettings = {
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
};

export const DEFAULT_SECTION_ORDER: string[] = [
  'hero',
  'about',
  'services',
  'skills',
  'experience',
  'projects',
  'certifications',
  'volunteer',
  'languages',
  'recommendations',
  'virtual-card'
];

interface DatabaseSchema {
  users: UserRecord[];
  profiles: Record<string, ProfileData>;
  connections?: UserConnection[];
}

const globalForDb = globalThis as unknown as { __AVTIVE_DB__?: DatabaseSchema };

function getWritableDbPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'avtive_db.json');
  }
  return path.join(process.cwd(), 'src', 'data', 'db.json');
}

function getSeedDbPath(): string {
  return path.join(process.cwd(), 'src', 'data', 'db.json');
}

// Helper to slugify user names
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Initial Seed Database
function getInitialSeedData(): DatabaseSchema {
  const defaultPasswordHash = bcrypt.hashSync('Avtive@123', 10);
  const abcdPasswordHash = bcrypt.hashSync('12345678', 10);

  const founderUser: UserRecord = {
    id: 'user-mesum',
    name: 'Syed Mesum Raza Shah',
    email: 'mesum@avtive.app',
    passwordHash: defaultPasswordHash,
    createdAt: new Date().toISOString()
  };

  const teamUser: UserRecord = {
    id: 'user-hamza',
    name: 'Hamza Malik',
    email: 'hamza@avtive.app',
    passwordHash: defaultPasswordHash,
    createdAt: new Date().toISOString()
  };

  const abcdUser: UserRecord = {
    id: 'user-abcd',
    name: 'ABCD User',
    email: 'abcd@gmail.com',
    passwordHash: abcdPasswordHash,
    createdAt: new Date().toISOString()
  };

  const seededFounderProfile: ProfileData = {
    ...founderProfile,
    userId: founderUser.id,
    theme: (founderProfile.theme || 'elegant') as ProfileTheme
  };

  const seededTeamProfile: ProfileData = {
    ...teamMemberProfile,
    userId: teamUser.id,
    theme: (teamMemberProfile.theme || 'elegant') as ProfileTheme
  };

  const seededCompanyProfile: ProfileData = {
    ...companyProfile,
    userId: founderUser.id,
    theme: (companyProfile.theme || 'elegant') as ProfileTheme
  };

  const seededAbcdProfile: ProfileData = {
    ...founderProfile,
    id: 'prof-abcd',
    slug: 'abcd-user-profile',
    userId: abcdUser.id,
    name: 'ABCD User',
    email: 'abcd@gmail.com',
    profileName: 'Primary Profile',
    designation: 'Professional',
    theme: 'editorial'
  };

  return {
    users: [founderUser, teamUser, abcdUser],
    profiles: {
      [seededFounderProfile.id]: seededFounderProfile,
      [seededFounderProfile.slug]: seededFounderProfile,
      [seededTeamProfile.id]: seededTeamProfile,
      [seededTeamProfile.slug]: seededTeamProfile,
      [seededCompanyProfile.id]: seededCompanyProfile,
      [seededCompanyProfile.slug]: seededCompanyProfile,
      [seededAbcdProfile.id]: seededAbcdProfile,
      [seededAbcdProfile.slug]: seededAbcdProfile
    }
  };
}

function normalizeProfiles(profiles: Record<string, ProfileData>) {
  Object.values(profiles).forEach((p) => {
    if (!p.theme || p.theme === 'default') p.theme = 'editorial';
    if (!p.profileName) {
      p.profileName = p.designation || (p.type === 'company' ? 'Company Profile' : 'Primary Profile');
    }
    if (!p.profession) {
      p.profession = p.designation || 'Professional';
    }
    if (!p.createdAt) {
      p.createdAt = new Date().toISOString();
    }
    if (!p.updatedAt) {
      p.updatedAt = p.createdAt || new Date().toISOString();
    }
    if (!p.sharingSettings) {
      p.sharingSettings = { ...DEFAULT_SHARING_SETTINGS };
    }
    if (!p.sectionOrder || !p.sectionOrder.length) {
      p.sectionOrder = [...DEFAULT_SECTION_ORDER];
    }
    if (!Array.isArray(p.socials)) {
      if (p.socials && typeof p.socials === 'object') {
        p.socials = Object.entries(p.socials).map(([platform, url]) => ({
          platform: platform as any,
          url: String(url),
          label: platform
        }));
      } else {
        p.socials = [];
      }
    }
    if (!Array.isArray(p.socialLinks)) {
      p.socialLinks = p.socials.map((s: any) => ({ platform: s.platform, url: s.url, label: s.label }));
    }
  });
}

function loadDb(): DatabaseSchema {
  if (globalForDb.__AVTIVE_DB__) {
    return globalForDb.__AVTIVE_DB__;
  }

  const writablePath = getWritableDbPath();
  const seedPath = getSeedDbPath();

  try {
    if (fs.existsSync(writablePath)) {
      const content = fs.readFileSync(writablePath, 'utf8');
      const data: DatabaseSchema = JSON.parse(content);
      if (data && data.profiles && Array.isArray(data.users)) {
        normalizeProfiles(data.profiles);
        globalForDb.__AVTIVE_DB__ = data;
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to read from writablePath:', e);
  }

  try {
    if (fs.existsSync(seedPath)) {
      const content = fs.readFileSync(seedPath, 'utf8');
      const data: DatabaseSchema = JSON.parse(content);
      if (data && data.profiles && Array.isArray(data.users)) {
        normalizeProfiles(data.profiles);
        globalForDb.__AVTIVE_DB__ = data;
        saveDb(data);
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to read from seedPath:', e);
  }

  const seed = getInitialSeedData();
  normalizeProfiles(seed.profiles);
  globalForDb.__AVTIVE_DB__ = seed;
  saveDb(seed);
  return seed;
}

function saveDb(data: DatabaseSchema): void {
  globalForDb.__AVTIVE_DB__ = data;
  const writablePath = getWritableDbPath();

  try {
    const dir = path.dirname(writablePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(writablePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Failed to write to ${writablePath}, attempting /tmp fallback:`, e);
    try {
      const tmpPath = path.join('/tmp', 'avtive_db.json');
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (tmpErr) {
      console.error('Failed to write to fallback /tmp:', tmpErr);
    }
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
  if (user) return user;

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cachedUserRaw = cookieStore.get('avtive_user_cache')?.value;
    if (cachedUserRaw) {
      const cu = JSON.parse(decodeURIComponent(cachedUserRaw));
      if (cu && cu.email?.toLowerCase().trim() === normalizedEmail) {
        db.users.push(cu);
        return cu;
      }
    }
  } catch {}

  if (normalizedEmail === 'abcd@gmail.com') {
    const abcdHash = bcrypt.hashSync('12345678', 10);
    const abcdUser: UserRecord = {
      id: 'user-abcd',
      name: 'ABCD User',
      email: 'abcd@gmail.com',
      passwordHash: abcdHash,
      createdAt: new Date().toISOString()
    };
    db.users.push(abcdUser);
    return abcdUser;
  }

  return null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const db = loadDb();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  createProfile?: boolean;
}): Promise<{ user: UserRecord; profile?: ProfileData }> {
  const db = loadDb();
  const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newUser: UserRecord = {
    id: userId,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  let newProfile: ProfileData | undefined;
  if (data.createProfile) {
    const slug = `${slugify(data.name)}-${Math.random().toString(36).substring(2, 6)}`;
    newProfile = {
      id: `prof-${Date.now()}`,
      userId: userId,
      slug: slug,
      type: 'individual',
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      designation: 'Professional',
      company: 'Avtive Network',
      location: 'Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      shortBio: 'Welcome to my digital profile on Avtive.',
      fullBio: 'Connect with me directly via phone, WhatsApp, or email.',
      theme: 'elegant',
      contactOrder: ['whatsapp', 'phone', 'email', 'website', 'location'],
      socials: [
        {
          platform: 'website',
          url: 'https://www.avtive.app',
          label: 'Website',
          handle: 'avtive.app'
        }
      ]
    };
    db.profiles[newProfile.id] = newProfile;
    db.profiles[newProfile.slug] = newProfile;
  }

  saveDb(db);
  return { user: newUser, profile: newProfile };
}

export async function createProfileForUser(
  userId: string,
  data: Partial<ProfileData>
): Promise<ProfileData> {
  const db = loadDb();
  const user = await getUserById(userId);
  const name = (data.name || user?.name || 'Professional').trim();
  const profileName = (data.profileName || data.designation || 'Professional Profile').trim();
  const profession = (data.profession || data.designation || 'Professional').trim();
  const slugBase = slugify(data.profileName ? `${name}-${data.profileName}` : name);
  const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;
  const profileId = `prof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newProfile: ProfileData = {
    id: profileId,
    userId: userId,
    profileName: profileName,
    profession: profession,
    slug: slug,
    type: (data.type as any) || 'owner',
    name: name,
    email: (data.email || user?.email || '').toLowerCase().trim(),
    firstName: data.firstName || (name.split(' ')[0] || ''),
    secondName: data.secondName || data.lastName || (name.split(' ').slice(1).join(' ') || ''),
    lastName: data.lastName || data.secondName || (name.split(' ').slice(1).join(' ') || ''),
    professionalTitle: data.professionalTitle || data.designation || profession,
    designation: data.designation?.trim() || data.professionalTitle?.trim() || profession,
    company: data.company?.trim() || 'Avtive Network',
    location: data.location?.trim() || 'Global',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    bio: data.bio?.trim() || data.shortBio?.trim() || 'Welcome to my digital profile on Avtive.',
    about: data.about?.trim() || data.fullBio?.trim() || 'Passionate professional delivering intuitive digital experiences with modern technology and clean architecture.',
    shortBio: data.shortBio?.trim() || data.bio?.trim() || 'Welcome to my digital profile on Avtive.',
    fullBio: data.fullBio?.trim() || data.about?.trim() || 'Connect with me directly via phone, WhatsApp, or email.',
    phone: data.phone?.trim() || '',
    whatsapp: data.whatsapp?.trim() || data.phone?.trim() || '',
    theme: (data.theme && data.theme !== 'default' ? data.theme : 'editorial') as ProfileTheme,
    contactOrder: data.contactOrder || ['whatsapp', 'phone', 'email', 'website', 'location'],
    socials: Array.isArray(data.socials)
      ? data.socials
      : data.socials && typeof data.socials === 'object'
      ? Object.entries(data.socials).map(([platform, url]) => ({
          platform: platform as any,
          url: String(url),
          label: platform
        }))
      : [
          {
            platform: 'website',
            url: 'https://www.avtive.app',
            label: 'Website',
            handle: 'avtive.app'
          }
        ],
    socialLinks: Array.isArray(data.socialLinks)
      ? data.socialLinks
      : Array.isArray(data.socials)
      ? data.socials.map(s => ({ platform: s.platform, url: s.url, label: s.label }))
      : [],
    skills: data.skills || ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    experience: data.experience || data.experiences || [],
    experiences: data.experiences || data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
    services: data.services || [],
    certifications: data.certifications || [],
    volunteerExperiences: data.volunteerExperiences || [],
    languages: data.languages || [],
    recommendations: data.recommendations || [],
    testimonials: data.testimonials || [],
    companyInfo: data.companyInfo,
    nfcCard: data.nfcCard,
    sharingSettings: data.sharingSettings ? { ...DEFAULT_SHARING_SETTINGS, ...data.sharingSettings } : { ...DEFAULT_SHARING_SETTINGS },
    sectionOrder: (data.sectionOrder && data.sectionOrder.length) ? data.sectionOrder : [...DEFAULT_SECTION_ORDER],
    createdAt: now,
    updatedAt: now
  };

  db.profiles[newProfile.id] = newProfile;
  db.profiles[newProfile.slug] = newProfile;
  saveDb(db);

  return newProfile;
}

export async function getProfileByIdOrSlug(idOrSlug: string): Promise<ProfileData | null> {
  const db = loadDb();
  if (db.profiles[idOrSlug]) {
    return db.profiles[idOrSlug];
  }

  // Linear search in case of lowercase/trim difference
  const found = Object.values(db.profiles).find(
    (p) => p.id.toLowerCase() === idOrSlug.toLowerCase() || p.slug.toLowerCase() === idOrSlug.toLowerCase()
  );
  if (found) return found;

  // Fallback: check if idOrSlug matches a userId
  const byUser = Object.values(db.profiles).find((p) => p.userId === idOrSlug);
  if (byUser) return byUser;

  // Cookie fallback for newly created profiles across serverless lambdas
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const lastProfileRaw = cookieStore.get('avtive_last_profile')?.value;
    if (lastProfileRaw) {
      const p = JSON.parse(decodeURIComponent(lastProfileRaw));
      if (p && (p.id === idOrSlug || p.slug === idOrSlug || p.userId === idOrSlug)) {
        db.profiles[p.id] = p;
        db.profiles[p.slug] = p;
        return p;
      }
    }
  } catch {}

  return null;
}

export async function getProfileByUserId(userId: string): Promise<ProfileData | null> {
  const db = loadDb();
  // Prioritize owner or individual profile if user has multiple (e.g. founder with personal + company)
  const ownerOrIndiv = Object.values(db.profiles).find(
    (p) => p.userId === userId && (p.type === 'owner' || p.type === 'individual')
  );
  if (ownerOrIndiv) return ownerOrIndiv;

  const profile = Object.values(db.profiles).find((p) => p.userId === userId);
  if (profile) return profile;

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const lastProfileRaw = cookieStore.get('avtive_last_profile')?.value;
    if (lastProfileRaw) {
      const p = JSON.parse(decodeURIComponent(lastProfileRaw));
      if (p && (p.userId === userId || !p.userId)) {
        p.userId = userId;
        db.profiles[p.id] = p;
        db.profiles[p.slug] = p;
        return p;
      }
    }
  } catch {}

  return null;
}

export async function getProfilesByUserId(userId: string): Promise<ProfileData[]> {
  const db = loadDb();
  const unique = new Map<string, ProfileData>();
  for (const p of Object.values(db.profiles)) {
    if (p.userId === userId) {
      unique.set(p.id, p);
    }
  }

  if (unique.size === 0) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const lastProfileRaw = cookieStore.get('avtive_last_profile')?.value;
      if (lastProfileRaw) {
        const p = JSON.parse(decodeURIComponent(lastProfileRaw));
        if (p && (p.userId === userId || !p.userId)) {
          p.userId = userId;
          db.profiles[p.id] = p;
          db.profiles[p.slug] = p;
          unique.set(p.id, p);
        }
      }
    } catch {}
  }

  return Array.from(unique.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeA - timeB;
  });
}

export async function getAllProfiles(): Promise<ProfileData[]> {
  const db = loadDb();
  const unique = new Map<string, ProfileData>();
  for (const p of Object.values(db.profiles)) {
    unique.set(p.id, p);
  }
  return Array.from(unique.values());
}

export async function updateProfile(
  profileId: string,
  updatedData: Partial<ProfileData>,
  sessionUserId: string
): Promise<{ success: boolean; profile?: ProfileData; error?: string; status: number }> {
  const db = loadDb();
  let target = await getProfileByIdOrSlug(profileId);

  if (!target && (updatedData as any)?.slug) {
    target = await getProfileByIdOrSlug((updatedData as any).slug);
  }

  if (!target) {
    target = await getProfileByUserId(sessionUserId);
  }

  if (!target) {
    // If not found in memory/tmp (common on cold lambdas), upsert and persist for this session user
    const slug =
      (updatedData as any)?.slug ||
      (updatedData.profileName
        ? slugify(`${updatedData.name || 'User'}-${updatedData.profileName}`)
        : slugify(updatedData.name || 'user')) ||
      profileId;

    const newProfile: ProfileData = {
      id: profileId || `prof-${Date.now()}`,
      userId: sessionUserId,
      slug: slug,
      type: (updatedData.type as any) || 'owner',
      name: updatedData.name || 'Professional',
      email: updatedData.email || '',
      ...updatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ProfileData;

    db.profiles[newProfile.id] = newProfile;
    db.profiles[newProfile.slug] = newProfile;
    saveDb(db);
    return { success: true, profile: newProfile, status: 200 };
  }

  // Ownership check: If target is claimed or session user matches
  if (target.userId && target.userId !== sessionUserId) {
    const isOtherRegisteredUser = db.users.some((u) => u.id === target?.userId && u.id !== sessionUserId);
    if (!isOtherRegisteredUser) {
      target.userId = sessionUserId;
    } else {
      return {
        success: false,
        error: 'Forbidden: You do not own this profile. Only the verified owner can perform edits.',
        status: 403
      };
    }
  }

  // Merge safe updates
  const merged: ProfileData = {
    ...target,
    ...updatedData,
    id: target.id, // Prevent tampering with immutable ID
    userId: sessionUserId, // Ensure bound to active session user
    slug: target.slug || (updatedData as any)?.slug || profileId,
    updatedAt: new Date().toISOString()
  };

  // Persist to both id and slug keys
  db.profiles[merged.id] = merged;
  db.profiles[merged.slug] = merged;
  saveDb(db);

  return { success: true, profile: merged, status: 200 };
}

export async function duplicateProfile(
  profileId: string,
  sessionUserId: string
): Promise<{ success: boolean; profile?: ProfileData; error?: string; status: number }> {
  const db = loadDb();
  const target = await getProfileByIdOrSlug(profileId);

  if (!target) {
    return { success: false, error: 'Profile not found.', status: 404 };
  }

  // Strict ownership check
  if (!target.userId || target.userId !== sessionUserId) {
    return {
      success: false,
      error: 'Forbidden: You do not have permission to duplicate this profile.',
      status: 403
    };
  }

  const newId = `prof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const duplicateName = target.profileName ? `${target.profileName} (Copy)` : `${target.name} (Copy)`;
  const slugBase = slugify(`${target.name}-${duplicateName}`);
  const newSlug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const cloned: ProfileData = {
    ...JSON.parse(JSON.stringify(target)),
    id: newId,
    userId: sessionUserId,
    profileName: duplicateName,
    slug: newSlug,
    createdAt: now,
    updatedAt: now
  };

  db.profiles[cloned.id] = cloned;
  db.profiles[cloned.slug] = cloned;
  saveDb(db);

  return { success: true, profile: cloned, status: 201 };
}

export async function deleteProfile(
  profileId: string,
  sessionUserId: string
): Promise<{ success: boolean; error?: string; status: number }> {
  const db = loadDb();
  const target = await getProfileByIdOrSlug(profileId);

  if (!target) {
    return { success: false, error: 'Profile not found.', status: 404 };
  }

  // Strict ownership check
  if (!target.userId || target.userId !== sessionUserId) {
    return {
      success: false,
      error: 'Forbidden: You do not have permission to delete this profile.',
      status: 403
    };
  }

  // Delete from profiles
  delete db.profiles[target.id];
  delete db.profiles[target.slug];

  // Clean up any remaining key references
  for (const key of Object.keys(db.profiles)) {
    if (db.profiles[key].id === target.id) {
      delete db.profiles[key];
    }
  }

  saveDb(db);
  return { success: true, status: 200 };
}

/**
 * Server-side projection that strips unshared/hidden fields from a profile.
 * Ensures that if a user turns off Phone, Experience, Email, etc. in sharing settings,
 * the public API / server props NEVER expose that data to viewers.
 */
export function sanitizeProfileForPublic(profile: ProfileData, isOwner: boolean = false): ProfileData {
  if (isOwner) {
    return profile;
  }

  const settings = profile.sharingSettings || DEFAULT_SHARING_SETTINGS;
  const sanitized: ProfileData = { ...profile };

  if (settings.photo === false) {
    sanitized.avatar = '';
    sanitized.coverImage = undefined;
  }

  if (settings.nameAndTitle === false) {
    sanitized.name = 'Professional';
    sanitized.designation = '';
    sanitized.tagline = '';
  }

  if (settings.bio === false) {
    sanitized.shortBio = '';
    sanitized.fullBio = '';
  }

  if (settings.contactInfo === false || settings.phone === false) {
    sanitized.phone = '';
    sanitized.whatsapp = '';
  }

  if (settings.contactInfo === false || settings.email === false) {
    sanitized.email = '';
  }

  if (settings.socialLinks === false) {
    sanitized.socials = [];
  }

  if (settings.skills === false) {
    sanitized.skills = [];
  }

  if (settings.experience === false) {
    sanitized.experiences = [];
  }

  if (settings.certifications === false) {
    sanitized.certifications = [];
  }

  if (settings.projects === false) {
    sanitized.projects = [];
  }

  if (settings.services === false) {
    sanitized.services = [];
  }

  if (settings.recommendations === false) {
    sanitized.recommendations = [];
    sanitized.testimonials = [];
  }

  if (settings.volunteer === false) {
    sanitized.volunteerExperiences = [];
  }

  if (settings.languages === false) {
    sanitized.languages = [];
  }

  if (settings.companySection === false) {
    sanitized.companyInfo = undefined;
  }

  if (settings.nfcCard === false) {
    sanitized.nfcCard = undefined;
  }

  return sanitized;
}


export async function createConnection(data: {
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toProfileId: string;
  note?: string;
}): Promise<{ success: boolean; connection?: UserConnection; error?: string; status: number }> {
  const db = loadDb();
  if (!db.connections) {
    db.connections = [];
  }

  const targetProfile = await getProfileByIdOrSlug(data.toProfileId);
  if (!targetProfile) {
    return { success: false, error: 'Target profile not found.', status: 404 };
  }

  // Prevent user from connecting to their own profile
  if (targetProfile.userId && targetProfile.userId === data.fromUserId) {
    return { success: false, error: 'You cannot connect with your own profile.', status: 400 };
  }

  // Check if connection already exists
  const existing = db.connections.find(
    (c) =>
      c.fromUserId === data.fromUserId &&
      (c.toProfileId === targetProfile.id || c.toProfileId === targetProfile.slug)
  );

  if (existing) {
    return { success: true, connection: existing, status: 200 };
  }

  const newConn: UserConnection = {
    id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fromUserId: data.fromUserId,
    fromUserName: data.fromUserName,
    fromUserEmail: data.fromUserEmail,
    toProfileId: targetProfile.id,
    toUserId: targetProfile.userId,
    createdAt: new Date().toISOString(),
    note: data.note?.trim()
  };

  db.connections.push(newConn);
  saveDb(db);

  return { success: true, connection: newConn, status: 201 };
}

export async function checkIsConnected(fromUserId: string, toProfileId: string): Promise<boolean> {
  const db = loadDb();
  if (!db.connections) return false;

  const target = await getProfileByIdOrSlug(toProfileId);
  const targetId = target ? target.id : toProfileId;
  const targetSlug = target ? target.slug : toProfileId;

  return db.connections.some(
    (c) =>
      c.fromUserId === fromUserId &&
      (c.toProfileId === targetId || c.toProfileId === targetSlug)
  );
}

export async function getUserConnections(userId: string): Promise<UserConnection[]> {
  const db = loadDb();
  if (!db.connections) return [];

  return db.connections.filter(
    (c) => c.fromUserId === userId || c.toUserId === userId
  );
}
