import { getDatabase } from '../db/connection';

export interface User {
  id: number;
  email: string;
  password_hash: string;
}

const SEED_USERS: Array<Omit<User, 'id'>> = [
  { email: 'ada@example.com', password_hash: 'hash::lovelace' },
  { email: 'linus@example.com', password_hash: 'hash::torvalds' },
];

function ensureTable() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
  `);
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    for (const u of SEED_USERS) insert.run(u.email, u.password_hash);
  }
}

export const UserModel = {
  findByEmail(email: string): User | undefined {
    ensureTable();
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },
};
