import { initDatabase, closeDatabase } from '../backend/src/db/connection';
import { TaskModel } from '../backend/src/models/task';

describe('TaskModel (SQLite)', () => {
  beforeAll(() => {
    initDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  it('creates, updates and removes a task', () => {
    const created = TaskModel.create({ title: 'First', description: 'one' });
    expect(created.id).toBeGreaterThan(0);
    expect(created.completed).toBe(false);
    expect(created.priority).toBe('medium');

    const updated = TaskModel.update(created.id, { completed: true, priority: 'high' });
    expect(updated?.completed).toBe(true);
    expect(updated?.priority).toBe('high');

    const removed = TaskModel.remove(created.id);
    expect(removed).toBe(true);

    expect(TaskModel.get(created.id)).toBeNull();
  });
});
