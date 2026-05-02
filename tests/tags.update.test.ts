import { initDatabase, closeDatabase, getDatabase } from '../backend/src/db/connection';
import { TaskModel } from '../backend/src/models/task';

describe('TaskModel.update with tags', () => {
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

  it('does not touch tags when "tags" is omitted', () => {
    const created = TaskModel.create({ title: 't', tags: ['a', 'b'] });
    const updated = TaskModel.update(created.id, { title: 'renamed' });
    expect(updated?.title).toBe('renamed');
    expect(updated?.tags).toEqual(['a', 'b']);
  });

  it('replaces tags when given a new array', () => {
    const created = TaskModel.create({ title: 't', tags: ['a', 'b'] });
    const updated = TaskModel.update(created.id, { tags: ['c', 'a'] });
    expect(updated?.tags).toEqual(['a', 'c']);
  });

  it('clears all tags when given []', () => {
    const created = TaskModel.create({ title: 't', tags: ['a', 'b'] });
    const updated = TaskModel.update(created.id, { tags: [] });
    expect(updated?.tags).toEqual([]);
  });

  it('throws on invalid tags and leaves the task unchanged', () => {
    const created = TaskModel.create({
      title: 'orig',
      description: 'd',
      tags: ['a'],
    });
    expect(() =>
      TaskModel.update(created.id, { title: 'new', tags: ['ok', 'has space'] }),
    ).toThrow();
    const after = TaskModel.get(created.id);
    expect(after?.title).toBe('orig');
    expect(after?.tags).toEqual(['a']);
  });

  it('returns null and does not mutate when the task does not exist', () => {
    const db = getDatabase();
    const before = (
      db.prepare('SELECT COUNT(*) AS n FROM task_tags').get() as { n: number }
    ).n;
    const result = TaskModel.update(9999, { tags: ['x'] });
    expect(result).toBeNull();
    const after = (
      db.prepare('SELECT COUNT(*) AS n FROM task_tags').get() as { n: number }
    ).n;
    expect(after).toBe(before);
  });
});
