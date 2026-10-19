-- ==============================================================================
-- AVTIVE PROFILES: EMERGENCY SECURITY & RLS LOCKDOWN MIGRATION
-- Migration Date: 2026-10-19
-- File: supabase/migrations/20261019_lockdown.sql
-- ==============================================================================
-- IMPORTANT:
-- This migration is strictly ADDITIVE and HARDENING:
-- 1. Revokes unauthenticated/anon access to sensitive tables (users, company_members).
-- 2. Revokes public write (INSERT/UPDATE/DELETE) access to profiles.
-- 3. Enables Row Level Security (RLS) on all app tables.
-- 4. Locks down storage to public read for images only; all mutations require service_role.
-- 5. Adds missing columns (recovery_code_hash, reset_token_hash, reset_token_expires, preferred_theme) using IF NOT EXISTS.
-- 6. Adds missing tables (companies, company_members, connections) using IF NOT EXISTS with constraints.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD MISSING COLUMNS TO USERS TABLE (IF NOT EXISTS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS recovery_code_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'editorial';

-- ------------------------------------------------------------------------------
-- 2. ENSURE REQUIRED TABLES EXIST WITH CONSTRAINTS
-- ------------------------------------------------------------------------------

-- Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  size TEXT DEFAULT '',
  website TEXT DEFAULT '',
  location TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  theme TEXT DEFAULT 'editorial',
  visibility JSONB DEFAULT '{"about": true, "team": true, "services": true, "projects": true, "contact": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Members Table
CREATE TABLE IF NOT EXISTS public.company_members (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  department TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'REMOVED')),
  invite_token TEXT,
  invite_expires_at TIMESTAMPTZ,
  invited_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_company_member_email UNIQUE (company_id, email)
);

-- User Connections Table (Digital Card Connects / Exchanges)
CREATE TABLE IF NOT EXISTS public.connections (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performant lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_profile ON public.connections(profile_id);

-- ------------------------------------------------------------------------------
-- 3. REVOKE UNPRIVILEGED GRANTS ON SENSITIVE TABLES
-- ------------------------------------------------------------------------------

-- Users table: Never allow anon or public direct SQL access (must go via server/service_role)
REVOKE ALL ON TABLE public.users FROM anon;
REVOKE ALL ON TABLE public.users FROM public;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO postgres;

-- Company Members table: Never allow anon direct access
REVOKE ALL ON TABLE public.company_members FROM anon;
REVOKE ALL ON TABLE public.company_members FROM public;
GRANT ALL ON TABLE public.company_members TO service_role;
GRANT ALL ON TABLE public.company_members TO postgres;

-- Profiles table: Revoke public write grants
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM public;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO postgres;

-- Companies table: Revoke public write grants
REVOKE INSERT, UPDATE, DELETE ON TABLE public.companies FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.companies FROM public;
GRANT SELECT ON TABLE public.companies TO anon;
GRANT ALL ON TABLE public.companies TO service_role;
GRANT ALL ON TABLE public.companies TO postgres;

-- Connections table: Server mediated access only
REVOKE ALL ON TABLE public.connections FROM anon;
REVOKE ALL ON TABLE public.connections FROM public;
GRANT ALL ON TABLE public.connections TO service_role;
GRANT ALL ON TABLE public.connections TO postgres;

-- ------------------------------------------------------------------------------
-- 4. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. DROP INSECURE / PERMISSIVE POLICIES
-- ------------------------------------------------------------------------------

-- Drop insecure public policies on users
DROP POLICY IF EXISTS "Public select users" ON public.users;
DROP POLICY IF EXISTS "Public insert users" ON public.users;
DROP POLICY IF EXISTS "Public update users" ON public.users;
DROP POLICY IF EXISTS "Public delete users" ON public.users;

-- Drop insecure public write policies on profiles
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public delete profiles" ON public.profiles;

-- Drop insecure storage write policies
DROP POLICY IF EXISTS "Public storage insert" ON storage.objects;
DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;

-- ------------------------------------------------------------------------------
-- 6. RE-ESTABLISH HARDENED, LEAST-PRIVILEGE RLS POLICIES
-- ------------------------------------------------------------------------------

-- Service Role Full Access Policies (Server API handlers with service key have full access)
DROP POLICY IF EXISTS "Allow service role full access to users" ON public.users;
CREATE POLICY "Allow service role full access to users" 
  ON public.users 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to profiles" ON public.profiles;
CREATE POLICY "Allow service role full access to profiles" 
  ON public.profiles 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to companies" ON public.companies;
CREATE POLICY "Allow service role full access to companies" 
  ON public.companies 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to company_members" ON public.company_members;
CREATE POLICY "Allow service role full access to company_members" 
  ON public.company_members 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to connections" ON public.connections;
CREATE POLICY "Allow service role full access to connections" 
  ON public.connections 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Profiles: Public can only SELECT profiles (filtered server-side by sharing/visibility settings)
DROP POLICY IF EXISTS "Public select profiles" ON public.profiles;
CREATE POLICY "Public select profiles" 
  ON public.profiles 
  FOR SELECT 
  TO public 
  USING (true);

-- Companies: Public can only SELECT companies
DROP POLICY IF EXISTS "Public select companies" ON public.companies;
CREATE POLICY "Public select companies" 
  ON public.companies 
  FOR SELECT 
  TO public 
  USING (true);

-- Company Members: Public can only view ACTIVE team members
DROP POLICY IF EXISTS "Public select company_members" ON public.company_members;
CREATE POLICY "Public select company_members" 
  ON public.company_members 
  FOR SELECT 
  TO public 
  USING (status = 'ACTIVE');

-- ------------------------------------------------------------------------------
-- 7. STORAGE RLS POLICIES: PUBLIC READ FOR IMAGES ONLY; SERVICE ROLE FOR WRITES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow service role full access to storage" ON storage.objects;
CREATE POLICY "Allow service role full access to storage" 
  ON storage.objects 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
DROP POLICY IF EXISTS "Public storage read images only" ON storage.objects;
CREATE POLICY "Public storage read images only" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id IN ('profiles', 'avatars', 'links'));

-- End of 20261019_lockdown.sql
