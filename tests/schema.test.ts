import Database from 'better-sqlite3';
import { initDatabase, closeDatabase } from '../backend/src/db/connection';

describe('schema: tags + task_tags', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  it('has foreign_keys enabled', () => {
    const row = db.pragma('foreign_keys', { simple: true });
    expect(row).toBe(1);
  });

  it('creates the tags and task_tags tables', () => {
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as Array<{ name: string }>;
    const tables = rows.map((r) => r.name);
    expect(tables).toEqual(expect.arrayContaining(['tags', 'task_tags', 'tasks']));
  });

  it('enforces UNIQUE on tag name (case-insensitive)', () => {
    db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run();
    expect(() => db.prepare("INSERT INTO tags (name) VALUES ('urgent')").run()).toThrow();
    expect(() => db.prepare("INSERT INTO tags (name) VALUES ('URGENT')").run()).toThrow();
  });

  it('cascades task_tags rows when a task is deleted', () => {
    const taskId = Number(
      db.prepare("INSERT INTO tasks (title) VALUES ('demo')").run().lastInsertRowid,
    );
    const tagId = Number(
      db.prepare("INSERT INTO tags (name) VALUES ('demo-tag')").run().lastInsertRowid,
    );
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);

    expect(
      db.prepare('SELECT COUNT(*) AS n FROM task_tags WHERE task_id = ?').get(taskId),
    ).toEqual({ n: 1 });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    expect(
      db.prepare('SELECT COUNT(*) AS n FROM task_tags WHERE task_id = ?').get(taskId),
    ).toEqual({ n: 0 });
  });

  it('rejects duplicate (task_id, tag_id) pairs via composite PK', () => {
    const taskId = Number(
      db.prepare("INSERT INTO tasks (title) VALUES ('dup')").run().lastInsertRowid,
    );
    const tagId = Number(
      db.prepare("INSERT INTO tags (name) VALUES ('dup-tag')").run().lastInsertRowid,
    );
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
    expect(() =>
      db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId),
    ).toThrow();
  });
});
