import { getDatabase } from '../db/connection';

export type TaskPriority = 'low' | 'medium' | 'high';

export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'] as const;

export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  created_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
}

interface TaskRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  priority: TaskPriority;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    priority: row.priority,
    created_at: row.created_at,
  };
}

export const TaskModel = {
  list(): Task[] {
    const rows = getDatabase()
      .prepare(
        'SELECT id, title, description, completed, priority, created_at FROM tasks ORDER BY id DESC',
      )
      .all() as TaskRow[];
    return rows.map(rowToTask);
  },

  get(id: number): Task | null {
    const row = getDatabase()
      .prepare(
        'SELECT id, title, description, completed, priority, created_at FROM tasks WHERE id = ?',
      )
      .get(id) as TaskRow | undefined;
    return row ? rowToTask(row) : null;
  },

  create(input: TaskInput): Task {
    const result = getDatabase()
      .prepare(
        'INSERT INTO tasks (title, description, completed, priority) VALUES (?, ?, ?, ?)',
      )
      .run(
        input.title,
        input.description ?? '',
        input.completed ? 1 : 0,
        input.priority ?? DEFAULT_TASK_PRIORITY,
      );

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
      priority: input.priority ?? existing.priority,
    };

    getDatabase()
      .prepare(
        'UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ? WHERE id = ?',
      )
      .run(next.title, next.description, next.completed ? 1 : 0, next.priority, id);

    return this.get(id);
  },

  remove(id: number): boolean {
    const result = getDatabase().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },

  stats(): { total: number; completed: number; pending: number } {
    const row = getDatabase()
      .prepare('SELECT COUNT(*) AS total, COALESCE(SUM(completed), 0) AS completed FROM tasks')
      .get() as { total: number; completed: number };

    const total = Number(row.total);
    const completed = Number(row.completed);
    return { total, completed, pending: total - completed };
  },
};
