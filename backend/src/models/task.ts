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

// Converts a row to a Task
function rowToTask(row: TaskRow): Task {
  // Build the task
  return {
    // id field
    id: row.id,
    // title field
    title: row.title,
    // description field
    description: row.description,
    // SQLite stores booleans as integers (0/1)
    completed: row.completed === 1,
    // created_at field
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
    const existing = this.get(id);
    if (!existing) return null;

    const next = {
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      completed: input.completed ?? existing.completed,
    };

    getDatabase()
      .prepare('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?')
      .run(next.title, next.description, next.completed ? 1 : 0, id);

    return this.get(id);
  },

  remove(id: number): boolean {
    const result = getDatabase().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
