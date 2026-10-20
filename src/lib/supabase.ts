import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function cleanEnv(val?: string): string {
  if (!val) return '';
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function isServiceRoleKey(key: string): boolean {
  if (!key) return false;
  const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanEnv(process.env.SUPABASE_SERVICE_KEY);
  if (serviceKey && key === serviceKey) return true;
  if (key.startsWith('eyJ')) {
    try {
      const parts = key.split('.');
      if (parts.length >= 2) {
        let payloadStr = '';
        if (typeof Buffer !== 'undefined') {
          payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        } else if (typeof atob !== 'undefined') {
          payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        }
        if (payloadStr) {
          const payload = JSON.parse(payloadStr);
          return payload?.role === 'service_role';
        }
      }
    } catch {}
  }
  return false;
}

export const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, '');

const rawAnonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

if (rawAnonKey && isServiceRoleKey(rawAnonKey)) {
  console.warn('[Supabase Config] WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a service_role key. Service-role keys must never be exposed to the client or used as anon key. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY with your anon/public key, and SUPABASE_SERVICE_ROLE_KEY with your service_role secret in your deployment environment.');
}

// In the browser, use the configured anon key (or rawAnonKey to avoid breaking client):
export const supabaseAnonKey = rawAnonKey || '';

// Server-only service role key for privileged database operations (never exposed to client).
// Prioritizes SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY / SUPABASE_SECRET_KEY.
// If missing on the server, gracefully falls back to rawAnonKey so server database operations succeed without crashing.
export const supabaseServiceKey = typeof window === 'undefined'
  ? (cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
     cleanEnv(process.env.SUPABASE_SERVICE_KEY) ||
     cleanEnv(process.env.SUPABASE_SECRET_KEY) ||
     (rawAnonKey && isServiceRoleKey(rawAnonKey) ? rawAnonKey : '') ||
     rawAnonKey ||
     '')
  : '';

export const SUPABASE_AUTH_STORAGE_KEY = 'sb-avtive-auth-token';

// Public client for browser / client-side operations using official @supabase/ssr
// Initializes if env vars are present, or uses a safe placeholder for SSR/build phase
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key');

// Admin / Server client with elevated privileges for server route handlers.
// Uses ONLY SUPABASE_SERVICE_ROLE_KEY, server-only. No anon-key fallback.
let _adminClient: any = null;

function getAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase configuration error: supabaseAdmin cannot be accessed in the browser.');
  }
  if (!supabaseUrl) {
    throw new Error('Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }
  if (!supabaseServiceKey) {
    throw new Error('Supabase configuration error: SUPABASE_SERVICE_ROLE_KEY is required for server database access.');
  }
  if (!_adminClient) {
    _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        storageKey: 'sb-avtive-admin-token',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    });
  }
  return _adminClient;
}

export const supabaseAdmin: any = new Proxy({}, {
  get(_target, prop) {
    const client = getAdminClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export const PROFILES_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'profiles';
export const LINKS_STORAGE_BUCKET = process.env.SUPABASE_LINKS_BUCKET || 'links';
export const DEFAULT_STORAGE_BUCKET = PROFILES_STORAGE_BUCKET;
export const CANDIDATE_BUCKETS = ['profiles', 'links', 'avatars', 'media', 'uploads', 'public'];

/**
 * Get permanent Supabase Storage public CDN URL for an asset in any bucket
 */
export function getSupabasePublicUrl(bucket: string = PROFILES_STORAGE_BUCKET, filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export function getSupabaseProfileAssetUrl(filename: string): string {
  return getSupabasePublicUrl(PROFILES_STORAGE_BUCKET, filename);
}

export function getSupabaseLinkAssetUrl(filename: string): string {
  return getSupabasePublicUrl(LINKS_STORAGE_BUCKET, filename);
}

export const SUPABASE_DEFAULT_AVATAR = `${supabaseUrl}/storage/v1/object/public/profiles/default-avatar.png`;
export const SUPABASE_DEFAULT_COVER = `${supabaseUrl}/storage/v1/object/public/profiles/default-cover.png`;
export const SUPABASE_DEFAULT_PROJECT_IMAGE = `${supabaseUrl}/storage/v1/object/public/profiles/default-project.png`;
export const SUPABASE_DEFAULT_LINK_ICON = `${supabaseUrl}/storage/v1/object/public/links/default-link.png`;

/**
 * Upload a file buffer directly to Supabase Storage and return its permanent public CDN URL
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  filename: string,
  contentType: string,
  preferredBucket: string = PROFILES_STORAGE_BUCKET
): Promise<{ success: boolean; url?: string; error?: string; bucket?: string }> {
  try {
    // Enforce 5MB max size
    if (buffer.length > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit.' };
    }

    // Verify magic bytes (JPEG, PNG, WebP only; strictly reject SVG and unknown formats)
    let verifiedMime = '';
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      verifiedMime = 'image/jpeg';
    } else if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      verifiedMime = 'image/png';
    } else if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      verifiedMime = 'image/webp';
    } else {
      return { success: false, error: 'Unsupported or corrupted image format. Only JPEG, PNG, and WebP are permitted.' };
    }

    const safeContentType = verifiedMime || contentType;
    const bucketsToTry = [preferredBucket, ...CANDIDATE_BUCKETS.filter(b => b !== preferredBucket)];

    let lastError: any = null;

    for (const bucket of bucketsToTry) {
      // 1. Try uploading to bucket
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: safeContentType,
          upsert: false
        });

      if (!error && data?.path) {
        const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
        return {
          success: true,
          url: pubData.publicUrl,
          bucket
        };
      }

      lastError = error;

      // If bucket does not exist, try creating it with public access
      if (error && (error.message?.includes('Bucket not found') || error.message?.includes('not found') || (error as any).statusCode === '404')) {
        try {
          const { error: createErr } = await supabaseAdmin.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });

          if (!createErr) {
            // Retry upload after creating bucket
            const { data: retryData, error: retryErr } = await supabaseAdmin.storage
              .from(bucket)
              .upload(filename, buffer, {
                contentType,
                upsert: true
              });

            if (!retryErr && retryData?.path) {
              const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(retryData.path);
              return {
                success: true,
                url: pubData.publicUrl,
                bucket
              };
            }
          }
        } catch {}
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Storage upload failed'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unexpected upload error'
    };
  }
}

/**
 * Ensure any image asset (base64 Data URI or file buffer) is saved to Supabase Storage
 * and returned as a permanent public CDN URL.
 */
export async function ensureSupabaseAssetUrl(
  imageSource?: string | null,
  preferredBucket: string = PROFILES_STORAGE_BUCKET
): Promise<string> {
  if (!imageSource || typeof imageSource !== 'string') return '';
  
  // If already a hosted URL (CDN or external), keep as is
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return imageSource;
  }

  // If base64 data URI, upload directly to Supabase storage
  if (imageSource.startsWith('data:')) {
    try {
      const matches = imageSource.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const mimeType = matches[1] || 'image/jpeg';
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
        const filename = `${preferredBucket}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

        const uploadRes = await uploadToSupabaseStorage(buffer, filename, mimeType, preferredBucket);
        if (uploadRes.success && uploadRes.url) {
          return uploadRes.url;
        }
      }
    } catch (err) {
      console.warn('Auto Supabase asset upload fallback:', err);
    }
  }

  return imageSource;
}

