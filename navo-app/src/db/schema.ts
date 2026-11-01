// Navo - Database Schema (using raw SQL for SQLite via better-sqlite3)

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS saves (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'other',
  intent TEXT NOT NULL DEFAULT 'someday',
  intent_confirmed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  deadline TEXT,
  deadline_source TEXT,
  deadline_confirmed INTEGER NOT NULL DEFAULT 0,
  source_platform TEXT NOT NULL DEFAULT 'instagram',
  extracted_data TEXT NOT NULL DEFAULT '{}',
  space TEXT,
  project TEXT,
  estimated_minutes INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS action_steps (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  remind_at TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT NOT NULL,
  is_dismissed INTEGER NOT NULL DEFAULT 0,
  response TEXT,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saves_status ON saves(status);
CREATE INDEX IF NOT EXISTS idx_saves_content_type ON saves(content_type);
CREATE INDEX IF NOT EXISTS idx_saves_deadline ON saves(deadline);
CREATE INDEX IF NOT EXISTS idx_action_steps_save_id ON action_steps(save_id);
CREATE INDEX IF NOT EXISTS idx_reminders_save_id ON reminders(save_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
`;
