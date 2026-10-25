-- Run in a dedicated Cloudflare D1 database for the campaign only.
CREATE TABLE IF NOT EXISTS movement_signups (
 id TEXT PRIMARY KEY,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 country TEXT,
 interests TEXT,
 consent_version TEXT NOT NULL,
 consented_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS movement_signups_created_at ON movement_signups(created_at);
