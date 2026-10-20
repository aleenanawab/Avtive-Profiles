-- ==============================================================================
-- AVTIVE PROFILES: ONBOARDING STEP COMPLETION & PERSISTENCE MIGRATION
-- Migration Date: 2026-10-20
-- File: supabase/migrations/20261020_onboarding_flags.sql
-- ==============================================================================
-- IMPORTANT:
-- This migration is strictly ADDITIVE:
-- 1. Adds explicit step completion boolean flags to public.users (IF NOT EXISTS).
-- 2. Adds role and preferred_theme columns to public.users if missing.
-- 3. Non-destructively backfills onboarding_completed = TRUE ONLY for existing
--    users with saved, non-empty profile records, preserving existing accounts.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD ONBOARDING STEP FLAGS & PREFERENCES TO USERS TABLE (IF NOT EXISTS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS script_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'editorial';

-- ------------------------------------------------------------------------------
-- 2. NON-DESTRUCTIVE BACKFILL FOR EXISTING USERS WITH SAVED PROFILES
-- ------------------------------------------------------------------------------
-- Backfill onboarding_completed = TRUE only for users who already have a saved profile.
-- Uses explicit ::text casts to safely match UUID and TEXT id columns.
UPDATE public.users u
SET 
  onboarding_completed = TRUE,
  role_completed = TRUE,
  theme_completed = TRUE,
  script_completed = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id::text = u.id::text
);
