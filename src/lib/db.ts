import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { ProfileData, UserRecord, ProfileTheme, UserConnection, SharingSettings, normalizeProfileType } from '@/types/profile';
import { founderProfile, teamMemberProfile, companyProfile } from '@/data/mockProfiles';

import {
  DEFAULT_SHARING_SETTINGS,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SECTION_ORDER
} from '@/types/profile';

export {
  DEFAULT_SHARING_SETTINGS,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SECTION_ORDER
};

interface DatabaseSchema {
  users: UserRecord[];
  profiles: Record<string, ProfileData>;
  connections?: UserConnection[];
}

const globalForDb = globalThis as unknown as { __AVTIVE_DB__?: DatabaseSchema };

async function asyncSyncSupabase(action: PromiseLike<any>) {
  try {
    await action;
  } catch {}
}

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

  const leapUser: UserRecord = {
    id: 'user-leap',
    name: 'The Leap Pakistan',
    email: 'theleappakistan22@gmail.com',
    passwordHash: abcdPasswordHash,
    createdAt: new Date().toISOString()
  };

  const aleenaUser: UserRecord = {
    id: 'user-aleena',
    name: 'Aleena Nawab',
    email: 'aleenaknawab@gmail.com',
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
    users: [founderUser, teamUser, abcdUser, leapUser, aleenaUser],
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
    p.type = normalizeProfileType(p.type);
    if (!p.theme || p.theme === 'default') p.theme = 'editorial';
    if (!p.profileName) {
      p.profileName = p.designation || (p.type === 'team' ? 'Team Profile' : 'Primary Profile');
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
    if (!p.username) {
      p.username = p.slug ? p.slug.replace(/^@/, '') : slugify(p.name);
    }
    if (!p.customFields) {
      p.customFields = [];
    }
    if (!p.dynamicSections) {
      p.dynamicSections = [];
    }
    if (!p.sharingSettings) {
      p.sharingSettings = { ...DEFAULT_SHARING_SETTINGS };
    }
    if (!p.sectionOrder || !p.sectionOrder.length) {
      p.sectionOrder = [...DEFAULT_SECTION_ORDER];
    }
    if (!p.sectionVisibility) {
      p.sectionVisibility = {
        ...DEFAULT_SECTION_VISIBILITY,
        ...(p.sharingSettings
          ? {
              about: p.sharingSettings.bio !== false,
              skills: p.sharingSettings.skills !== false,
              services: p.sharingSettings.services !== false,
              projects: p.sharingSettings.projects !== false,
              experience: p.sharingSettings.experience !== false,
              education: p.sharingSettings.education !== false,
              certifications: p.sharingSettings.certifications !== false,
              volunteer: p.sharingSettings.volunteer !== false,
              languages: p.sharingSettings.languages !== false,
              recommendations: p.sharingSettings.recommendations !== false,
              contact: p.sharingSettings.contactInfo !== false,
              'virtual-card': p.sharingSettings.nfcCard !== false,
              company: p.sharingSettings.companySection !== false
            }
          : {})
      };
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
  const user = db.users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);
  if (user) return user;

  // Supabase lookup fallback
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (data && !error) {
      const su: UserRecord = {
        id: data.id,
        name: data.name,
        email: data.email,
        passwordHash: data.password_hash || data.passwordHash,
        resetToken: data.reset_token || data.resetToken,
        resetTokenExpires: data.reset_token_expires || data.resetTokenExpires,
        createdAt: data.created_at || data.createdAt || new Date().toISOString()
      };
      db.users.push(su);
      return su;
    }
  } catch {}

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
  if (user) return user;

  // Supabase lookup fallback
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      const su: UserRecord = {
        id: data.id,
        name: data.name,
        email: data.email,
        passwordHash: data.password_hash || data.passwordHash,
        resetToken: data.reset_token || data.resetToken,
        resetTokenExpires: data.reset_token_expires || data.resetTokenExpires,
        createdAt: data.created_at || data.createdAt || new Date().toISOString()
      };
      db.users.push(su);
      return su;
    }
  } catch {}

  return null;
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

  // Sync user to Supabase
  try {
    asyncSyncSupabase(
      supabaseAdmin.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password_hash: newUser.passwordHash,
        created_at: newUser.createdAt
      })
    );
  } catch {}

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

    // Sync profile to Supabase
    try {
      asyncSyncSupabase(
        supabaseAdmin.from('profiles').upsert({
          id: newProfile.id,
          user_id: newProfile.userId,
          slug: newProfile.slug,
          name: newProfile.name,
          email: newProfile.email,
          type: newProfile.type,
          theme: newProfile.theme,
          created_at: new Date().toISOString()
        })
      );
    } catch {}
  }

  saveDb(db);
  return { user: newUser, profile: newProfile };
}

export async function createPasswordResetToken(email: string): Promise<{ token: string; user: UserRecord } | null> {
  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();
  let user = await getUserByEmail(normalizedEmail);
  if (!user) return null;

  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  user.resetToken = token;
  user.resetTokenExpires = expires;

  // Sync token update to Supabase
  try {
    asyncSyncSupabase(
      supabaseAdmin.from('users').update({
        reset_token: token,
        reset_token_expires: expires
      }).eq('email', normalizedEmail)
    );
  } catch {}

  saveDb(db);
  return { token, user };
}

export async function verifyPasswordResetToken(email: string, token: string): Promise<{ valid: boolean; error?: string; user?: UserRecord }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    return { valid: false, error: 'User not found.' };
  }

  if (!user.resetToken || user.resetToken !== token) {
    return { valid: false, error: 'Invalid or expired password reset token.' };
  }

  if (!user.resetTokenExpires || new Date(user.resetTokenExpires).getTime() < Date.now()) {
    return { valid: false, error: 'Password reset link has expired. Please request a new one.' };
  }

  return { valid: true, user };
}

export async function resetUserPassword(email: string, token: string, newPasswordHash: string): Promise<UserRecord | null> {
  const db = loadDb();
  const normalizedEmail = email.toLowerCase().trim();
  const userIndex = db.users.findIndex((u) => u.email.toLowerCase().trim() === normalizedEmail);

  let user = userIndex !== -1 ? db.users[userIndex] : await getUserByEmail(normalizedEmail);
  if (!user) return null;
  if (!user.resetToken || user.resetToken !== token) return null;
  if (!user.resetTokenExpires || new Date(user.resetTokenExpires).getTime() < Date.now()) return null;

  user.passwordHash = newPasswordHash;
  delete user.resetToken;
  delete user.resetTokenExpires;

  // Sync password reset to Supabase
  try {
    asyncSyncSupabase(
      supabaseAdmin.from('users').update({
        password_hash: newPasswordHash,
        reset_token: null,
        reset_token_expires: null
      }).eq('email', normalizedEmail)
    );
  } catch {}

  saveDb(db);
  return user;
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
    type: normalizeProfileType(data.type),
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
    tagline: data.tagline?.trim() || '',
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
    sectionVisibility: data.sectionVisibility ? { ...DEFAULT_SECTION_VISIBILITY, ...data.sectionVisibility } : { ...DEFAULT_SECTION_VISIBILITY },
    username: (data.username || (data.slug ? data.slug.replace(/^@/, '') : slugBase)).toLowerCase().replace(/[^a-z0-9_-]/g, ''),
    customFields: Array.isArray(data.customFields) ? data.customFields : [],
    dynamicSections: Array.isArray(data.dynamicSections) ? data.dynamicSections : [],
    createdAt: now,
    updatedAt: now
  };

  db.profiles[newProfile.id] = newProfile;
  db.profiles[newProfile.slug] = newProfile;
  if (newProfile.username) {
    db.profiles[newProfile.username] = newProfile;
  }
  saveDb(db);

  // Sync profile to Supabase so it is accessible across serverless lambdas
  try {
    asyncSyncSupabase(
      supabaseAdmin.from('profiles').upsert({
        id: newProfile.id,
        user_id: newProfile.userId,
        slug: newProfile.slug,
        name: newProfile.name,
        email: newProfile.email,
        type: newProfile.type,
        theme: newProfile.theme,
        data: newProfile,
        created_at: newProfile.createdAt
      })
    );
  } catch {}

  return newProfile;
}

export function setProfileResponseCookies(response: any, profile: ProfileData) {
  try {
    if (!response || !response.cookies) return;

    // Proactively delete/expire legacy chunked cookies that cause 494 REQUEST_HEADER_TOO_LARGE
    response.cookies.delete('avtive_prof_count');
    for (let i = 0; i <= 25; i++) {
      response.cookies.delete(`avtive_prof_${i}`);
    }

    const mini = {
      id: profile.id,
      slug: profile.slug,
      userId: profile.userId,
      name: profile.name
    };
    response.cookies.set('avtive_last_profile', encodeURIComponent(JSON.stringify(mini)), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
  } catch (err) {
    console.error('Failed to set response cookie:', err);
  }
}

export async function getProfileByIdOrSlug(idOrSlug: string): Promise<ProfileData | null> {
  const db = loadDb();
  const clean = idOrSlug.toLowerCase().replace(/^@/, '').trim();
  if (db.profiles[idOrSlug]) {
    return db.profiles[idOrSlug];
  }
  if (db.profiles[clean]) {
    return db.profiles[clean];
  }

  // Linear search in case of lowercase/trim difference or username match
  const found = Object.values(db.profiles).find(
    (p) =>
      p.id.toLowerCase() === idOrSlug.toLowerCase() ||
      p.slug.toLowerCase() === idOrSlug.toLowerCase() ||
      p.slug.toLowerCase() === clean ||
      (p.username && p.username.toLowerCase() === clean) ||
      (p.username && p.username.toLowerCase() === idOrSlug.toLowerCase())
  );
  if (found) return found;

  // Fallback: check if idOrSlug matches a userId
  const byUser = Object.values(db.profiles).find((p) => p.userId === idOrSlug);
  if (byUser) return byUser;

  // Supabase lookup fallback across serverless lambdas
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug},slug.eq.${clean},user_id.eq.${idOrSlug}`)
      .maybeSingle();

    if (data && !error) {
      const sp: ProfileData = {
        ...(data.data || {}),
        id: data.id,
        userId: data.user_id,
        slug: data.slug,
        name: data.name,
        email: data.email,
        type: data.type || 'individual',
        theme: data.theme || 'editorial'
      };
      normalizeProfiles({ [sp.id]: sp });
      db.profiles[sp.id] = sp;
      db.profiles[sp.slug] = sp;
      return sp;
    }
  } catch {}

  // Cookie fallback for newly created/updated profiles across serverless lambdas
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const lastProfileRaw = cookieStore.get('avtive_last_profile')?.value;
    if (lastProfileRaw) {
      const p = JSON.parse(decodeURIComponent(lastProfileRaw));
      if (p && (p.id === idOrSlug || p.slug === idOrSlug || p.userId === idOrSlug)) {
        if (db.profiles[p.id]) return db.profiles[p.id];
        if (db.profiles[p.slug]) return db.profiles[p.slug];
      }
    }
  } catch {}

  return null;
}

export async function getProfileByUserId(userId: string): Promise<ProfileData | null> {
  const db = loadDb();
  // Prioritize individual profile if user has multiple (e.g. personal + team)
  const individualProfile = Object.values(db.profiles).find(
    (p) => p.userId === userId && normalizeProfileType(p.type) === 'individual'
  );
  if (individualProfile) return individualProfile;

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
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (data && !error && data.length > 0) {
        for (const item of data) {
          const sp: ProfileData = {
            ...(item.data || {}),
            id: item.id,
            userId: item.user_id,
            slug: item.slug,
            name: item.name,
            email: item.email,
            type: item.type || 'individual',
            theme: item.theme || 'editorial'
          };
          normalizeProfiles({ [sp.id]: sp });
          db.profiles[sp.id] = sp;
          db.profiles[sp.slug] = sp;
          unique.set(sp.id, sp);
        }
      }
    } catch {}

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

    const effectiveUsername = updatedData.username
      ? updatedData.username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : slug;

    const newProfile: ProfileData = {
      id: profileId || `prof-${Date.now()}`,
      userId: sessionUserId,
      slug: slug,
      username: effectiveUsername,
      type: normalizeProfileType(updatedData.type),
      name: updatedData.name || 'Professional',
      email: updatedData.email || '',
      ...updatedData,
      customFields: Array.isArray(updatedData.customFields) ? updatedData.customFields : [],
      dynamicSections: Array.isArray(updatedData.dynamicSections) ? updatedData.dynamicSections : [],
      sectionOrder: (updatedData.sectionOrder && updatedData.sectionOrder.length) ? updatedData.sectionOrder : [...DEFAULT_SECTION_ORDER],
      sectionVisibility: updatedData.sectionVisibility
        ? { ...DEFAULT_SECTION_VISIBILITY, ...updatedData.sectionVisibility }
        : { ...DEFAULT_SECTION_VISIBILITY },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ProfileData;

    db.profiles[newProfile.id] = newProfile;
    db.profiles[newProfile.slug] = newProfile;
    if (newProfile.username) {
      db.profiles[newProfile.username] = newProfile;
    }
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

  // Handle username update if provided
  const effectiveUsername = updatedData.username !== undefined
    ? (updatedData.username ? updatedData.username.toLowerCase().replace(/[^a-z0-9_-]/g, '') : undefined)
    : (target.username || (target.slug ? target.slug.replace(/^@/, '') : undefined));

  // Handle separated sectionVisibility and bidirectional sync with sharingSettings
  const mergedSectionVisibility: Record<string, boolean> = updatedData.sectionVisibility
    ? { ...(target.sectionVisibility || DEFAULT_SECTION_VISIBILITY), ...updatedData.sectionVisibility }
    : (target.sectionVisibility || { ...DEFAULT_SECTION_VISIBILITY });

  const mergedSharingSettings = updatedData.sharingSettings
    ? { ...(target.sharingSettings || DEFAULT_SHARING_SETTINGS), ...updatedData.sharingSettings }
    : { ...(target.sharingSettings || DEFAULT_SHARING_SETTINGS) };

  if (updatedData.sectionVisibility) {
    if (updatedData.sectionVisibility.about !== undefined) mergedSharingSettings.bio = updatedData.sectionVisibility.about;
    if (updatedData.sectionVisibility.skills !== undefined) mergedSharingSettings.skills = updatedData.sectionVisibility.skills;
    if (updatedData.sectionVisibility.services !== undefined) mergedSharingSettings.services = updatedData.sectionVisibility.services;
    if (updatedData.sectionVisibility.projects !== undefined) mergedSharingSettings.projects = updatedData.sectionVisibility.projects;
    if (updatedData.sectionVisibility.experience !== undefined) mergedSharingSettings.experience = updatedData.sectionVisibility.experience;
    if (updatedData.sectionVisibility.education !== undefined) mergedSharingSettings.education = updatedData.sectionVisibility.education;
    if (updatedData.sectionVisibility.certifications !== undefined) mergedSharingSettings.certifications = updatedData.sectionVisibility.certifications;
    if (updatedData.sectionVisibility.volunteer !== undefined) mergedSharingSettings.volunteer = updatedData.sectionVisibility.volunteer;
    if (updatedData.sectionVisibility.languages !== undefined) mergedSharingSettings.languages = updatedData.sectionVisibility.languages;
    if (updatedData.sectionVisibility.recommendations !== undefined) mergedSharingSettings.recommendations = updatedData.sectionVisibility.recommendations;
    if (updatedData.sectionVisibility.contact !== undefined) mergedSharingSettings.contactInfo = updatedData.sectionVisibility.contact;
    if (updatedData.sectionVisibility['virtual-card'] !== undefined) mergedSharingSettings.nfcCard = updatedData.sectionVisibility['virtual-card'];
    if (updatedData.sectionVisibility.company !== undefined) mergedSharingSettings.companySection = updatedData.sectionVisibility.company;
  } else if (updatedData.sharingSettings) {
    if (updatedData.sharingSettings.bio !== undefined) mergedSectionVisibility.about = updatedData.sharingSettings.bio;
    if (updatedData.sharingSettings.skills !== undefined) mergedSectionVisibility.skills = updatedData.sharingSettings.skills;
    if (updatedData.sharingSettings.services !== undefined) mergedSectionVisibility.services = updatedData.sharingSettings.services;
    if (updatedData.sharingSettings.projects !== undefined) mergedSectionVisibility.projects = updatedData.sharingSettings.projects;
    if (updatedData.sharingSettings.experience !== undefined) mergedSectionVisibility.experience = updatedData.sharingSettings.experience;
    if (updatedData.sharingSettings.education !== undefined) mergedSectionVisibility.education = updatedData.sharingSettings.education;
    if (updatedData.sharingSettings.certifications !== undefined) mergedSectionVisibility.certifications = updatedData.sharingSettings.certifications;
    if (updatedData.sharingSettings.volunteer !== undefined) mergedSectionVisibility.volunteer = updatedData.sharingSettings.volunteer;
    if (updatedData.sharingSettings.languages !== undefined) mergedSectionVisibility.languages = updatedData.sharingSettings.languages;
    if (updatedData.sharingSettings.recommendations !== undefined) mergedSectionVisibility.recommendations = updatedData.sharingSettings.recommendations;
    if (updatedData.sharingSettings.contactInfo !== undefined) mergedSectionVisibility.contact = updatedData.sharingSettings.contactInfo;
    if (updatedData.sharingSettings.nfcCard !== undefined) mergedSectionVisibility['virtual-card'] = updatedData.sharingSettings.nfcCard;
    if (updatedData.sharingSettings.companySection !== undefined) mergedSectionVisibility.company = updatedData.sharingSettings.companySection;
  }

  // Merge safe updates
  const merged: ProfileData = {
    ...target,
    ...updatedData,
    username: effectiveUsername,
    customFields: Array.isArray(updatedData.customFields)
      ? updatedData.customFields
      : (target.customFields || []),
    dynamicSections: Array.isArray(updatedData.dynamicSections)
      ? updatedData.dynamicSections
      : (target.dynamicSections || []),
    sectionOrder: (updatedData.sectionOrder && updatedData.sectionOrder.length)
      ? updatedData.sectionOrder
      : (target.sectionOrder || [...DEFAULT_SECTION_ORDER]),
    sectionVisibility: mergedSectionVisibility,
    sharingSettings: mergedSharingSettings,
    type: updatedData.type ? normalizeProfileType(updatedData.type) : normalizeProfileType(target.type),
    id: target.id, // Prevent tampering with immutable ID
    userId: sessionUserId, // Ensure bound to active session user
    slug: target.slug || (updatedData as any)?.slug || profileId,
    updatedAt: new Date().toISOString()
  };

  // Persist to id, slug, and username keys
  db.profiles[merged.id] = merged;
  db.profiles[merged.slug] = merged;
  if (merged.username) {
    db.profiles[merged.username] = merged;
  }
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

  // Handle custom fields visibility
  if (profile.sectionVisibility?.['custom-fields'] === false) {
    sanitized.customFields = [];
  } else if (Array.isArray(sanitized.customFields)) {
    sanitized.customFields = sanitized.customFields.filter(f => f.visible !== false);
  }

  sanitized.username = profile.username || profile.slug;
  sanitized.sectionOrder = profile.sectionOrder || DEFAULT_SECTION_ORDER;
  sanitized.sectionVisibility = profile.sectionVisibility || DEFAULT_SECTION_VISIBILITY;
  sanitized.dynamicSections = profile.dynamicSections || [];

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
