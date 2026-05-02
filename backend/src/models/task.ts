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

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
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

function validateInput(body: unknown, partial: boolean): TaskInput {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body must be a JSON object');
  }
  const candidate = body as Record<string, unknown>;

  if (!partial || candidate.title !== undefined) {
    if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
      throw new ValidationError('Field "title" is required and must be a non-empty string');
    }
  }
  if (candidate.description !== undefined && typeof candidate.description !== 'string') {
    throw new ValidationError('Field "description" must be a string');
  }
  if (candidate.completed !== undefined && typeof candidate.completed !== 'boolean') {
    throw new ValidationError('Field "completed" must be a boolean');
  }

  return {
    title: typeof candidate.title === 'string' ? candidate.title : '',
    description: candidate.description as string | undefined,
    completed: candidate.completed as boolean | undefined,
  };
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Invalid id');
  }
  return id;
}

export const TaskModel = {
  parseId,

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

  create(body: unknown): Task {
    const input = validateInput(body, false);
    const result = getDatabase()
      .prepare('INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)')
      .run(input.title, input.description ?? '', input.completed ? 1 : 0);

    const created = this.get(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to load created task');
    }
    return created;
  },

  update(id: number, body: unknown): Task | null {
    const input = validateInput(body, true);
    const existing = this.get(id);
    if (!existing) return null;

    const next = {
      title: input.title || existing.title,
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
