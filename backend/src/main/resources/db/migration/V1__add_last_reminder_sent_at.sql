-- Add timestamp column for last reminder sent (used for precise claim and scheduling)
-- Works for Postgres and H2 (uses CAST for portability)

-- Ensure the `customer` table exists (safe on fresh DBs). If it already exists, this is a noop.
CREATE TABLE IF NOT EXISTS customer (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    full_name VARCHAR(255),
    nickname VARCHAR(255),
    shift VARCHAR(255),
    price_per_litre DOUBLE,
    active BOOLEAN DEFAULT TRUE,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_time TIME,
    reminder_shift VARCHAR(255),
    reminder_interval_days INTEGER DEFAULT 1,
    -- Keep previous column if present for safe migration
    last_reminder_sent VARCHAR(255),
    last_reminder_sent_at TIMESTAMP
);

-- Add new column if the table exists (no-op if column already present)
ALTER TABLE customer ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP;

-- Migrate existing date values (preserve previous last_reminder_sent if present)
UPDATE customer
SET last_reminder_sent_at = CAST(last_reminder_sent AS TIMESTAMP)
WHERE last_reminder_sent IS NOT NULL;

-- NOTE: We intentionally keep the old `last_reminder_sent` column for safety.
-- If you want to drop it later, add a separate migration to remove the column after verifying behavior.
