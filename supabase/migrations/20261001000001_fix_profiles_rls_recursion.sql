-- ==============================================================================
-- StockFlow — Fix Profiles RLS Infinite Recursion
-- Migration: 20261001000001_fix_profiles_rls_recursion.sql
-- Date: 2026-10-01
--
-- Root cause:
--   The profiles_select_manager policy created in 20261001000000 reads from
--   public.profiles inside its own USING clause, which causes PostgreSQL to
--   re-enter the same policy set and detect an infinite recursion (42P17).
--
-- Fix:
--   Introduce a SECURITY DEFINER helper function in a private schema.
--   The helper performs the manager-role look-up under the function owner's
--   privileges, completely outside the caller's RLS evaluation context.
--   Replace profiles_select_manager with a version that calls the helper.
--
-- Do NOT modify 20261001000000_backend_security_hardening.sql.
-- Apply only this migration to resolve the recursion.
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Private schema (non-API-facing helper namespace)
-- ─────────────────────────────────────────────────────────────────────────────
create schema if not exists private;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SECURITY DEFINER helper: is_current_user_manager()
--
--    Runs with the function owner's privileges.
--    The inner SELECT on public.profiles is therefore evaluated outside the
--    calling user's RLS context, breaking the recursive policy dependency.
--
--    Security properties:
--    - Returns only true/false — no profile data is returned to the caller.
--    - Does NOT accept a caller-supplied user ID; always uses auth.uid().
--    - set search_path = '' prevents search-path injection.
--    - Fully qualified object references (public.profiles, auth.uid()).
--    - Stable: safe for repeated calls within a single transaction.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function private.is_current_user_manager()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Permission grants
--
--    - Revoke public execute (belt-and-suspenders; PUBLIC has no execute by
--      default on functions in non-public schemas, but be explicit).
--    - Grant schema usage so authenticated callers can resolve the schema name
--      during policy evaluation.
--    - Grant execute to authenticated so RLS policies that call the helper are
--      permitted.
--    - anon is not granted: profiles_select_manager is scoped "to authenticated"
--      so anonymous callers never reach this code path.
--    - service_role bypasses RLS entirely and therefore does not require a grant.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function private.is_current_user_manager() from public;

grant usage on schema private to authenticated;

grant execute on function private.is_current_user_manager()
  to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Replace the recursive profiles_select_manager policy
--
--    The original policy (created in 20261001000000) contained a direct
--    self-referential subquery on public.profiles, causing 42P17.
--    This drop-and-recreate replaces it with a non-recursive equivalent that
--    delegates the manager check to the SECURITY DEFINER helper.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_manager" on public.profiles;

create policy "profiles_select_manager"
  on public.profiles
  for select
  to authenticated
  using (
    (select private.is_current_user_manager())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification notes (do not apply; for manual post-deploy testing only):
--
--   BEFORE (expected error):
--     select * from public.profiles;
--     → ERROR 42P17: infinite recursion detected in policy for relation "profiles"
--
--   AFTER (expected success):
--     -- As a warehouse user:
--     select * from public.profiles;
--     → Returns only the current user's own profile row (via profiles_select_own)
--
--     -- As a manager user:
--     select * from public.profiles;
--     → Returns all profile rows (via profiles_select_manager)
-- ─────────────────────────────────────────────────────────────────────────────
