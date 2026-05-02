import { initDatabase, closeDatabase } from '../backend/src/db/connection';
import { TaskModel } from '../backend/src/models/task';
import { cleanupCompletedTasks } from '../backend/src/models/cleanup';

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

    const updated = TaskModel.update(created.id, { completed: true });
    expect(updated?.completed).toBe(true);

    const removed = TaskModel.remove(created.id);
    expect(removed).toBe(true);

    expect(TaskModel.get(created.id)).toBeNull();
  });

  it('sets completed_at when a task is marked as completed', () => {
    const task = TaskModel.create({ title: 'Check timestamp' });
    expect(task.completed_at).toBeNull();

    const completed = TaskModel.update(task.id, { completed: true });
    expect(completed?.completed_at).not.toBeNull();

    const uncompleted = TaskModel.update(task.id, { completed: false });
    expect(uncompleted?.completed_at).toBeNull();
  });

  it('cleanupCompletedTasks only removes tasks completed more than 24h ago, not recently completed ones', () => {
    // Tarea completada ahora — NO debe borrarse
    const recent = TaskModel.create({ title: 'Recent', completed: true });
    TaskModel.update(recent.id, { completed: true });

    // Tarea completada hace 25h — SÍ debe borrarse
    const old = TaskModel.create({ title: 'Old' });
    TaskModel.update(old.id, { completed: true });
    // Retrocedemos completed_at manualmente para simular 25h en el pasado
    const { getDatabase } = require('../backend/src/db/connection');
    getDatabase()
      .prepare("UPDATE tasks SET completed_at = datetime('now', '-25 hours') WHERE id = ?")
      .run(old.id);

    // Tarea creada hace mucho pero completada ahora — NO debe borrarse (era el bug)
    const createdLongAgoCompletedNow = TaskModel.create({ title: 'Old creation, new completion' });
    getDatabase()
      .prepare("UPDATE tasks SET created_at = datetime('now', '-48 hours') WHERE id = ?")
      .run(createdLongAgoCompletedNow.id);
    TaskModel.update(createdLongAgoCompletedNow.id, { completed: true });

    const deleted = cleanupCompletedTasks();
    expect(deleted).toBe(1);

    expect(TaskModel.get(old.id)).toBeNull();
    expect(TaskModel.get(recent.id)).not.toBeNull();
    expect(TaskModel.get(createdLongAgoCompletedNow.id)).not.toBeNull();
  });
});
