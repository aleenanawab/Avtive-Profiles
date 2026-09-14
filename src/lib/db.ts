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

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

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

  return {
    users: [founderUser, teamUser],
    profiles: {
      [seededFounderProfile.id]: seededFounderProfile,
      [seededFounderProfile.slug]: seededFounderProfile,
      [seededTeamProfile.id]: seededTeamProfile,
      [seededTeamProfile.slug]: seededTeamProfile,
      [seededCompanyProfile.id]: seededCompanyProfile,
      [seededCompanyProfile.slug]: seededCompanyProfile
    }
  };
}

let inMemoryDb: DatabaseSchema | null = null;
let lastDbMtime = 0;

function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const stats = fs.statSync(DB_FILE_PATH);
      if (!inMemoryDb || stats.mtimeMs > lastDbMtime) {
        const content = fs.readFileSync(DB_FILE_PATH, 'utf8');
        inMemoryDb = JSON.parse(content);
        if (inMemoryDb && inMemoryDb.profiles) {
          Object.values(inMemoryDb.profiles).forEach((p) => {
            if (!p.theme || p.theme === 'default') p.theme = 'elegant';
            if (p.coverImage && !p.coverImage.startsWith('/uploads/') && !p.coverImage.startsWith('data:')) {
              delete (p as any).coverImage;
            }
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
          });
        }
        lastDbMtime = stats.mtimeMs;
      }
      return inMemoryDb!;
    }

  } catch (e) {
    console.error('Failed to read db.json, checking seed:', e);
  }

  if (!inMemoryDb) {
    inMemoryDb = getInitialSeedData();
    saveDb(inMemoryDb);
  }
  return inMemoryDb;
}

function saveDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    inMemoryDb = data;
    try {
      lastDbMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
    } catch (_) {}
  } catch (e) {
    console.error('Failed to write to db.json:', e);
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
  return user || null;
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
    type: (data.type as any) || 'individual',
    name: name,
    email: (data.email || user?.email || '').toLowerCase().trim(),
    designation: data.designation?.trim() || profession,
    company: data.company?.trim() || 'Avtive Network',
    location: data.location?.trim() || 'Global',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    shortBio: data.shortBio?.trim() || 'Welcome to my digital profile on Avtive.',
    fullBio: data.fullBio?.trim() || 'Connect with me directly via phone, WhatsApp, or email.',
    phone: data.phone?.trim() || '',
    whatsapp: data.whatsapp?.trim() || data.phone?.trim() || '',
    theme: (data.theme && data.theme !== 'default' ? data.theme : 'editorial') as ProfileTheme,
    contactOrder: data.contactOrder || ['whatsapp', 'phone', 'email', 'website', 'location'],
    socials: data.socials || [
      {
        platform: 'website',
        url: 'https://www.avtive.app',
        label: 'Website',
        handle: 'avtive.app'
      }
    ],
    skills: data.skills || [],
    experiences: data.experiences || [],
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
  return found || null;
}

export async function getProfileByUserId(userId: string): Promise<ProfileData | null> {
  const db = loadDb();
  // Prioritize individual profile if user has multiple (e.g. founder with personal + company)
  const individual = Object.values(db.profiles).find(
    (p) => p.userId === userId && p.type === 'individual'
  );
  if (individual) return individual;

  const profile = Object.values(db.profiles).find((p) => p.userId === userId);
  return profile || null;
}

export async function getProfilesByUserId(userId: string): Promise<ProfileData[]> {
  const db = loadDb();
  const unique = new Map<string, ProfileData>();
  for (const p of Object.values(db.profiles)) {
    if (p.userId === userId) {
      unique.set(p.id, p);
    }
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
  const target = await getProfileByIdOrSlug(profileId);

  if (!target) {
    return { success: false, error: 'Profile not found.', status: 404 };
  }

  // Strict ownership check: session.userId === targetProfile.userId
  if (!target.userId || target.userId !== sessionUserId) {
    return {
      success: false,
      error: 'Forbidden: You do not own this profile. Only the verified owner can perform edits.',
      status: 403
    };
  }

  // Merge safe updates
  const merged: ProfileData = {
    ...target,
    ...updatedData,
    id: target.id, // Prevent tampering with immutable ID
    userId: target.userId, // Prevent tampering with owner mapping
    slug: target.slug, // Keep canonical slug intact
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
