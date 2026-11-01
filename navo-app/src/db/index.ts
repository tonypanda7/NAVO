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
  }
  return db;
}

export default getDb;
