/**
 * Server Environment Validation
 * Validates critical environment variables at startup/request time.
 * IMPORTANT: Logs ONLY variable names, NEVER secret values or credentials.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateServerEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required database & storage URLs
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  // Required anon key for public read
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Required service role key (SERVER-ONLY)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  // Required session secret (SERVER-ONLY)
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    missing.push('SESSION_SECRET');
  } else if (sessionSecret.length < 32) {
    if (process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)) {
      missing.push('SESSION_SECRET (must be >= 32 characters in production)');
    } else {
      warnings.push('SESSION_SECRET is shorter than 32 characters; insecure for production.');
    }
  }

  // Security Check: Verify server-only secrets are not leaked via NEXT_PUBLIC_
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('CRITICAL: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is set. Remove immediately to prevent client-side credential exposure.');
  }

  if (process.env.NEXT_PUBLIC_SESSION_SECRET) {
    warnings.push('CRITICAL: NEXT_PUBLIC_SESSION_SECRET is set. Remove immediately to prevent client-side secret exposure.');
  }

  if (missing.length > 0) {
    console.error(`[Security Warning] Missing required server environment variables: ${missing.join(', ')}`);
  }

  if (warnings.length > 0) {
    console.warn(`[Security Warning] Environment configuration warnings: ${warnings.join('; ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}
