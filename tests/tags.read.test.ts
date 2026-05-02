import { initDatabase, closeDatabase, getDatabase } from '../backend/src/db/connection';
import { TaskModel } from '../backend/src/models/task';

function seedTaskWithTags(title: string, tags: string[]): number {
  const db = getDatabase();
  const taskId = Number(
    db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title).lastInsertRowid,
  );
  for (const name of tags) {
    db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(name);
    const tagId = Number(
      (db.prepare('SELECT id FROM tags WHERE name = ?').get(name) as { id: number }).id,
    );
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
  }
  return taskId;
}

describe('TaskModel read-side: tags', () => {
  beforeAll(() => {
    initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    const db = getDatabase();
    db.exec('DELETE FROM task_tags; DELETE FROM tags; DELETE FROM tasks;');
  });

  it('get() returns sorted tags for a task', () => {
    const id = seedTaskWithTags('with tags', ['urgent', 'home', 'shopping']);
    const task = TaskModel.get(id);
    expect(task?.tags).toEqual(['home', 'shopping', 'urgent']);
  });

  it('get() returns [] for a task without tags', () => {
    const id = seedTaskWithTags('no tags', []);
    const task = TaskModel.get(id);
    expect(task?.tags).toEqual([]);
  });

  it('list() attaches tags to each task without duplicates', () => {
    const a = seedTaskWithTags('A', ['x', 'y']);
    const b = seedTaskWithTags('B', ['y']);
    const c = seedTaskWithTags('C', []);

    const all = TaskModel.list();
    const byId = new Map(all.map((t) => [t.id, t]));
    expect(byId.get(a)?.tags).toEqual(['x', 'y']);
    expect(byId.get(b)?.tags).toEqual(['y']);
    expect(byId.get(c)?.tags).toEqual([]);
    expect(all.length).toBe(3);
  });

  it('list() returns [] tags when there are no tag rows at all', () => {
    seedTaskWithTags('solo', []);
    const all = TaskModel.list();
    expect(all[0].tags).toEqual([]);
  });
});
