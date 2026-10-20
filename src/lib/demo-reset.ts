import { hashPassword } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// In-memory rate limiting map: key -> { count, resetAt }
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * Check and record an attempt for an IP or email key.
 */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return true;
  }
  entry.count++;
  return false;
}

/**
 * Reset rate limits (for testing purposes)
 */
export function resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

/**
 * Returns whether demo password reset is globally enabled via environment variables.
 * Refuses execution if running in production without explicit enablement.
 */
export function isDemoResetEnabled(): boolean {
  const enabled = process.env.DEMO_PASSWORD_RESET_ENABLED?.trim();
  if (enabled !== 'true') {
    return false;
  }

  // Refuse to run when VERCEL_ENV === "production" unless DEMO_PASSWORD_RESET_ENABLED is explicitly "true"
  if (process.env.VERCEL_ENV === 'production' && enabled !== 'true') {
    return false;
  }

  return true;
}

/**
 * Normalizes email by trimming and converting to lowercase.
 */
export function normalizeResetEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Returns the list of normalized allowed demo emails from env.
 */
export function getAllowedDemoEmails(): string[] {
  const raw = process.env.DEMO_RESET_ALLOWED_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifies if a given email is present in DEMO_RESET_ALLOWED_EMAILS.
 */
export function isEmailAllowedForDemoReset(email: string): boolean {
  const normalized = normalizeResetEmail(email);
  if (!normalized) return false;
  const allowed = getAllowedDemoEmails();
  return allowed.includes(normalized);
}

/**
 * Validates new and confirm passwords according to project rules:
 * - string type
 * - min length 8 (matching registration)
 * - newPassword === confirmPassword
 * - max 72 bytes (bcrypt limitation)
 */
export function validateResetPassword(newPassword: unknown, confirmPassword: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return { valid: false, error: 'Password must be provided as text.' };
  }

  if (newPassword.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match. Please verify both passwords.' };
  }

  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return { valid: false, error: 'Password exceeds maximum length limit of 72 bytes.' };
  }

  return { valid: true };
}

export interface DemoResetOptions {
  supabaseClient?: any;
  inMemoryDb?: any;
}

export interface DemoResetResult {
  success: boolean;
  error?: string;
  rowsUpdated?: number;
}

/**
 * Executes demo password reset restricted strictly to the normalized email.
 * Updates password_hash (and clears reset tokens) only. Never touches profile or other columns.
 * Returns success only if exactly one row was updated.
 */
export async function executeDemoPasswordReset(
  email: string,
  newPassword: string,
  options?: DemoResetOptions
): Promise<DemoResetResult> {
  const normalized = normalizeResetEmail(email);

  // Hard safety check: flag and email must both be permitted before touching DB
  if (!isDemoResetEnabled() || !isEmailAllowedForDemoReset(normalized)) {
    return { success: false, error: 'Password reset is forbidden or disabled.' };
  }

  // 1. Hash password with project's existing bcrypt helper
  const newHash = await hashPassword(newPassword);

  let rowsUpdated = 0;
  let supabaseError: any = null;

  // 2. Perform UPDATE restricted strictly to exact email in Supabase
  const client = options?.supabaseClient ?? supabaseAdmin;
  const hasSupabaseConfigured = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || options?.supabaseClient) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || options?.supabaseClient)
  );

  if (hasSupabaseConfigured && client && typeof client.from === 'function') {
    try {
      const { data, error } = await client
        .from('users')
        .update({
          password_hash: newHash,
          reset_token: null,
          reset_token_expires: null
        })
        .eq('email', normalized)
        .select('id, email');

      if (error) {
        supabaseError = error;
        console.error('[Demo Reset Database Error]:', error.message || error);
      } else if (Array.isArray(data)) {
        rowsUpdated = data.length;
      }
    } catch (err: any) {
      supabaseError = err;
      console.error('[Demo Reset Database Exception]:', err?.message || err);
    }
  }

  // 3. Keep local in-memory/fallback database in sync (if present or in test environment)
  const db = options?.inMemoryDb ?? (globalThis as any).__AVTIVE_DB__;
  if (db && Array.isArray(db.users)) {
    const userIndex = db.users.findIndex(
      (u: any) => u.email && u.email.toLowerCase().trim() === normalized
    );
    if (userIndex !== -1) {
      db.users[userIndex].passwordHash = newHash;
      delete db.users[userIndex].resetToken;
      delete db.users[userIndex].resetTokenExpires;
      if (!hasSupabaseConfigured) {
        rowsUpdated = 1;
      }
    }
  }

  // 4. Handle DB errors
  if (supabaseError) {
    return { success: false, error: 'Reset failed, please try again.' };
  }

  // 5. Require exactly one row to be updated
  if (rowsUpdated !== 1) {
    console.error(`[Demo Reset Error] Expected exactly 1 row updated for email ${normalized}, but got ${rowsUpdated}`);
    return { success: false, error: 'Reset failed, please try again.', rowsUpdated };
  }

  // 6. Log server-side success (email and timestamp only, no passwords)
  console.log(`[Demo Reset] Success: Password reset completed for email=${normalized} timestamp=${new Date().toISOString()}`);

  return { success: true, rowsUpdated: 1 };
}
