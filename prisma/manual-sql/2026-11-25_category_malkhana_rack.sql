-- Category and Malkhana rack number on MalkhanaEntry.
-- Additive only: adds 2 nullable columns; no existing data is changed.
-- Safe to run more than once.
ALTER TABLE "MalkhanaEntry"
  ADD COLUMN IF NOT EXISTS "category"       TEXT,
  ADD COLUMN IF NOT EXISTS "malkhanaRackNo" INTEGER;
