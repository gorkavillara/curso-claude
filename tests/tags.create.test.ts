import { initDatabase, closeDatabase, getDatabase } from '../backend/src/db/connection';
import { TaskModel } from '../backend/src/models/task';

describe('TaskModel.create with tags', () => {
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

  it('still works without tags (backwards compatible)', () => {
    const task = TaskModel.create({ title: 'no tags' });
    expect(task.tags).toEqual([]);
  });

  it('persists normalized, deduplicated tags', () => {
    const task = TaskModel.create({
      title: 'with tags',
      tags: ['Urgent', 'urgent', 'home'],
    });
    expect(task.tags).toEqual(['home', 'urgent']);
  });

  it('reuses existing tag rows instead of duplicating them', () => {
    const db = getDatabase();
    TaskModel.create({ title: 'one', tags: ['shared', 'a'] });
    TaskModel.create({ title: 'two', tags: ['SHARED', 'b'] });

    const tagCount = (
      db.prepare('SELECT COUNT(*) AS n FROM tags').get() as { n: number }
    ).n;
    expect(tagCount).toBe(3); // shared, a, b
  });

  it('throws on invalid tags and rolls back the task insert', () => {
    const db = getDatabase();
    expect(() =>
      TaskModel.create({ title: 'bad', tags: ['ok', 'has space'] }),
    ).toThrow();
    const taskCount = (
      db.prepare('SELECT COUNT(*) AS n FROM tasks').get() as { n: number }
    ).n;
    expect(taskCount).toBe(0);
  });

  it('accepts an explicit empty array', () => {
    const task = TaskModel.create({ title: 'empty tags', tags: [] });
    expect(task.tags).toEqual([]);
  });
});
