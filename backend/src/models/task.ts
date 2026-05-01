import { getDatabase } from '../db/connection';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  completed?: boolean;
}

interface TaskRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    created_at: row.created_at,
  };
}

export const TaskModel = {
  list(): Task[] {
    const rows = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at FROM tasks ORDER BY id DESC')
      .all() as TaskRow[];
    return rows.map(rowToTask);
  },

  get(id: number): Task | null {
    const row = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?')
      .get(id) as TaskRow | undefined;
    return row ? rowToTask(row) : null;
  },

  create(input: TaskInput): Task {
    const result = getDatabase()
      .prepare('INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)')
      .run(input.title, input.description ?? '', input.completed ? 1 : 0);

    const created = this.get(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to load created task');
    }
    return created;
  },

  update(id: number, input: Partial<TaskInput>): Task | null {
    if (input.title !== undefined) {
      if (typeof input.title !== 'string') {
        throw new Error('title must be a string');
      }
      if (input.title.trim().length === 0) {
        throw new Error('title cannot be empty');
      }
      if (input.title.length > 200) {
        throw new Error('title too long');
      }
    }
    if (input.description !== undefined && typeof input.description !== 'string') {
      throw new Error('description must be a string');
    }
    if (input.completed !== undefined && typeof input.completed !== 'boolean') {
      throw new Error('completed must be a boolean');
    }

    const existing = this.get(id);
    if (!existing) return null;

    const nextTitle = input.title !== undefined ? input.title.trim() : existing.title;
    const nextDescription =
      input.description !== undefined ? input.description.trim() : existing.description;
    const wasCompleted = existing.completed;
    const nextCompleted = input.completed !== undefined ? input.completed : existing.completed;

    if (!wasCompleted && nextCompleted) {
      console.log(`[task] task ${id} marked completed (was: pending)`);
    }
    if (wasCompleted && !nextCompleted) {
      console.log(`[task] task ${id} reopened`);
    }

    getDatabase()
      .prepare('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?')
      .run(nextTitle, nextDescription, nextCompleted ? 1 : 0, id);

    const row = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?')
      .get(id) as TaskRow | undefined;
    if (!row) return null;
    return rowToTask(row);
  },

  remove(id: number): boolean {
    const result = getDatabase().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
