import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hprlnnbnzomgvscmyane.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallbackKey;
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const SUPABASE_AUTH_STORAGE_KEY = 'sb-avtive-auth-token';

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

// Hybrid cookie + localStorage storage adapter for browser client:
// Ensures OAuth PKCE code_verifier is accessible in document.cookie for SSR route handlers
const hybridStorage = isClient ? {
  getItem: (key: string): string | null => {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${encodeURIComponent(key)}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    } catch {}
    try {
      return window.localStorage.getItem(key);
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      // Mirror PKCE code-verifier to cookies for SSR callback exchange
      if (key.includes('code-verifier')) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax${secure}`;
      }
    } catch {}
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (key.includes('code-verifier')) {
        document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0`;
      }
    } catch {}
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
} : undefined;

// Public client for browser / client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: SUPABASE_AUTH_STORAGE_KEY,
    storage: hybridStorage,
    flowType: 'pkce',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: false,
  }
});

// Admin / Server client with elevated privileges for server route handlers
// Instantiated ONLY on the server to prevent duplicate GoTrueClient instances in the browser
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        storageKey: 'sb-avtive-admin-token',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    })
  : (null as any);

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
    const bucketsToTry = [preferredBucket, ...CANDIDATE_BUCKETS.filter(b => b !== preferredBucket)];

    let lastError: any = null;

    for (const bucket of bucketsToTry) {
      // 1. Try uploading to bucket
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType,
          upsert: true
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

