-- Add timestamp column for last reminder sent (used for precise claim and scheduling)
-- Works for Postgres and H2 (uses CAST for portability)

ALTER TABLE customer ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP;

-- Migrate existing date values (preserve previous last_reminder_sent if present)
UPDATE customer
SET last_reminder_sent_at = CAST(last_reminder_sent AS TIMESTAMP)
WHERE last_reminder_sent IS NOT NULL;

-- NOTE: We intentionally keep the old `last_reminder_sent` column for safety.
-- If you want to drop it later, add a separate migration to remove the column after verifying behavior.
