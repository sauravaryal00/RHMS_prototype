-- ============================================================
-- RHMS Thesis: Fix RLS Policies for Backend API Access
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. consent_tokens: allow anon to insert, select, update
ALTER TABLE consent_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert consent_tokens" ON consent_tokens;
DROP POLICY IF EXISTS "Allow anon select consent_tokens" ON consent_tokens;
DROP POLICY IF EXISTS "Allow anon update consent_tokens" ON consent_tokens;

CREATE POLICY "Allow anon insert consent_tokens"
  ON consent_tokens FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select consent_tokens"
  ON consent_tokens FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon update consent_tokens"
  ON consent_tokens FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 2. audit_logs: allow anon to insert, select
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow anon select audit_logs" ON audit_logs;

CREATE POLICY "Allow anon insert audit_logs"
  ON audit_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select audit_logs"
  ON audit_logs FOR SELECT TO anon USING (true);

-- 3. vitals: allow anon to insert, select
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert vitals" ON vitals;
DROP POLICY IF EXISTS "Allow anon select vitals" ON vitals;

CREATE POLICY "Allow anon insert vitals"
  ON vitals FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select vitals"
  ON vitals FOR SELECT TO anon USING (true);

-- 4. otp_codes: allow anon to insert, select, update
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Allow anon select otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Allow anon update otp_codes" ON otp_codes;

CREATE POLICY "Allow anon insert otp_codes"
  ON otp_codes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select otp_codes"
  ON otp_codes FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon update otp_codes"
  ON otp_codes FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 5. trusted_contexts: allow anon to insert, select, upsert
ALTER TABLE trusted_contexts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert trusted_contexts" ON trusted_contexts;
DROP POLICY IF EXISTS "Allow anon select trusted_contexts" ON trusted_contexts;

CREATE POLICY "Allow anon insert trusted_contexts"
  ON trusted_contexts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select trusted_contexts"
  ON trusted_contexts FOR SELECT TO anon USING (true);

-- Done!
SELECT 'RLS policies applied successfully' AS status;
