-- Licensed weapon (लाइसेंसी शस्त्र) fields on MalkhanaEntry.
-- Additive only: adds 8 nullable TEXT columns; no existing data is changed.
-- Safe to run more than once.
ALTER TABLE "MalkhanaEntry"
  ADD COLUMN IF NOT EXISTS "receiptNo"     TEXT,
  ADD COLUMN IF NOT EXISTS "licenseNo"     TEXT,
  ADD COLUMN IF NOT EXISTS "ownerName"     TEXT,
  ADD COLUMN IF NOT EXISTS "weaponName"    TEXT,
  ADD COLUMN IF NOT EXISTS "weaponNo"      TEXT,
  ADD COLUMN IF NOT EXISTS "depositDate"   TEXT,
  ADD COLUMN IF NOT EXISTS "depositReason" TEXT,
  ADD COLUMN IF NOT EXISTS "rackNo"        TEXT;
