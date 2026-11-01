// Navo - Database Connection
import Database from 'better-sqlite3';
import path from 'path';
import { CREATE_TABLES_SQL } from './schema';

const DB_PATH = path.join(process.cwd(), 'navo.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    db.exec(CREATE_TABLES_SQL);

    // Safe column migrations
    try {
      db.exec("ALTER TABLE saves ADD COLUMN analysis_cost_usd REAL DEFAULT 0.00003;");
    } catch {
      // Column already exists
    }
    try {
      db.exec("ALTER TABLE saves ADD COLUMN model_name TEXT DEFAULT 'meta-llama/Llama-3.3-70B-Instruct-Turbo';");
    } catch {
      // Column already exists
    }
  }
  return db;
}

export default getDb;
