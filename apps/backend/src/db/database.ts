import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import initDb from './init';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/pharmacy.db');

// Auto-init DB if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  initDb();
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export default db;
