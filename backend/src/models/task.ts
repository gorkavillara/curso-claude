import { getDatabase } from '../db/connection';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
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
  completed_at: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    created_at: row.created_at,
    completed_at: row.completed_at,
  };
}

export const TaskModel = {
  list(): Task[] {
    const rows = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at, completed_at FROM tasks ORDER BY id DESC')
      .all() as TaskRow[];
    return rows.map(rowToTask);
  },

  get(id: number): Task | null {
    const row = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at, completed_at FROM tasks WHERE id = ?')
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
      .prepare('UPDATE tasks SET title = ?, description = ?, completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime(\'now\') ELSE NULL END WHERE id = ?')
      .run(next.title, next.description, next.completed ? 1 : 0, next.completed ? 1 : 0, id);

    return this.get(id);
  },

  remove(id: number): boolean {
    const result = getDatabase().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
