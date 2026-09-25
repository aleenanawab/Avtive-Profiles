import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hprlnnbnzomgvscmyane.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallbackKey;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Public client for browser / client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin / Server client with elevated privileges for server route handlers
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export const DEFAULT_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'profiles';
const CANDIDATE_BUCKETS = [DEFAULT_STORAGE_BUCKET, 'avatars', 'media', 'uploads', 'public'];

/**
 * Upload a file buffer directly to Supabase Storage and return its permanent public CDN URL
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  filename: string,
  contentType: string,
  preferredBucket: string = DEFAULT_STORAGE_BUCKET
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
      error: lastError?.message || 'Failed to upload to Supabase Storage bucket.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error communicating with Supabase Storage.'
    };
  }
}

