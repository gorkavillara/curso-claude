import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

function resolveDbPath(): string {
  const configured = process.env.DB_PATH;
  if (configured) return configured;

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'taskmaster.db');
}

export function initDatabase(dbPath?: string): Database.Database {
  const target = dbPath ?? resolveDbPath();
  db = new Database(target);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const col = db
    .prepare(`SELECT COUNT(*) as n FROM pragma_table_info('tasks') WHERE name = 'due_date'`)
    .get() as { n: number };
  if (col.n === 0) {
    db.exec(`ALTER TABLE tasks ADD COLUMN due_date TEXT;`);
  }

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
