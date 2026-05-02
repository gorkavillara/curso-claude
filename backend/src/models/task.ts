import { getDatabase } from '../db/connection';
import { ValidationError } from './errors';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  tags: string[];
}

export interface TaskInput {
  title: string;
  description?: string;
  completed?: boolean;
  tags?: string[];
}

export const TAG_MAX_LENGTH = 32;
export const TAGS_MAX_PER_TASK = 10;
const TAG_PATTERN = /^[a-z0-9][a-z0-9-_]*$/;

export function normalizeTag(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

export function validateTags(input: unknown): string[] | string {
  if (!Array.isArray(input)) {
    return 'Field "tags" must be an array of strings';
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') {
      return 'Each tag must be a string';
    }
    const tag = normalizeTag(raw);
    if (tag === '') {
      return 'Tags cannot be empty';
    }
    if (tag.length > TAG_MAX_LENGTH) {
      return `Tag "${tag}" exceeds ${TAG_MAX_LENGTH} characters`;
    }
    if (!TAG_PATTERN.test(tag)) {
      return `Tag "${tag}" contains invalid characters (allowed: a-z, 0-9, -, _)`;
    }
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  if (out.length > TAGS_MAX_PER_TASK) {
    return `A task cannot have more than ${TAGS_MAX_PER_TASK} tags`;
  }
  return out;
}

interface TaskRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
}

function rowToTask(row: TaskRow, tags: string[]): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    created_at: row.created_at,
    tags,
  };
}

function attachTags(taskId: number, tags: string[]): void {
  if (tags.length === 0) return;
  const db = getDatabase();
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
  const selectTagId = db.prepare('SELECT id FROM tags WHERE name = ?');
  const linkTag = db.prepare(
    'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
  );
  for (const name of tags) {
    insertTag.run(name);
    const row = selectTagId.get(name) as { id: number } | undefined;
    if (!row) throw new Error(`Tag "${name}" was not found after insert`);
    linkTag.run(taskId, row.id);
  }
}

function tagsForTask(taskId: number): string[] {
  const rows = getDatabase()
    .prepare(
      `SELECT t.name AS name
         FROM task_tags tt
         JOIN tags t ON t.id = tt.tag_id
        WHERE tt.task_id = ?
        ORDER BY t.name`,
    )
    .all(taskId) as Array<{ name: string }>;
  return rows.map((r) => r.name);
}

function tagsForTasks(taskIds: number[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (taskIds.length === 0) return map;
  const placeholders = taskIds.map(() => '?').join(',');
  const rows = getDatabase()
    .prepare(
      `SELECT tt.task_id AS task_id, t.name AS name
         FROM task_tags tt
         JOIN tags t ON t.id = tt.tag_id
        WHERE tt.task_id IN (${placeholders})
        ORDER BY t.name`,
    )
    .all(...taskIds) as Array<{ task_id: number; name: string }>;
  for (const r of rows) {
    const list = map.get(r.task_id) ?? [];
    list.push(r.name);
    map.set(r.task_id, list);
  }
  return map;
}

export const TaskModel = {
  list(): Task[] {
    const rows = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at FROM tasks ORDER BY id DESC')
      .all() as TaskRow[];
    const byTask = tagsForTasks(rows.map((r) => r.id));
    return rows.map((r) => rowToTask(r, byTask.get(r.id) ?? []));
  },

  get(id: number): Task | null {
    const row = getDatabase()
      .prepare('SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?')
      .get(id) as TaskRow | undefined;
    return row ? rowToTask(row, tagsForTask(row.id)) : null;
  },

  create(input: TaskInput): Task {
    const db = getDatabase();
    let tags: string[] = [];
    if (input.tags !== undefined) {
      const validated = validateTags(input.tags);
      if (typeof validated === 'string') {
        throw new ValidationError(validated);
      }
      tags = validated;
    }

    const newId = db.transaction(() => {
      const result = db
        .prepare('INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)')
        .run(input.title, input.description ?? '', input.completed ? 1 : 0);
      const taskId = Number(result.lastInsertRowid);
      attachTags(taskId, tags);
      return taskId;
    })();

    const created = this.get(newId);
    if (!created) {
      throw new Error('Failed to load created task');
    }
    return created;
  },

  update(id: number, input: Partial<TaskInput>): Task | null {
    const existing = this.get(id);
    if (!existing) return null;

    let nextTags: string[] | undefined;
    if (input.tags !== undefined) {
      const validated = validateTags(input.tags);
      if (typeof validated === 'string') {
        throw new ValidationError(validated);
      }
      nextTags = validated;
    }

    const next = {
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      completed: input.completed ?? existing.completed,
    };

    const db = getDatabase();
    db.transaction(() => {
      db.prepare(
        'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
      ).run(next.title, next.description, next.completed ? 1 : 0, id);

      if (nextTags !== undefined) {
        db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id);
        attachTags(id, nextTags);
      }
    })();

    return this.get(id);
  },

  listByTag(rawName: string): Task[] {
    const name = normalizeTag(rawName);
    if (name === '') return [];
    const rows = getDatabase()
      .prepare(
        `SELECT t.id AS id, t.title AS title, t.description AS description,
                t.completed AS completed, t.created_at AS created_at
           FROM tasks t
           JOIN task_tags tt ON tt.task_id = t.id
           JOIN tags g ON g.id = tt.tag_id
          WHERE g.name = ?
          ORDER BY t.id DESC`,
      )
      .all(name) as TaskRow[];
    const byTask = tagsForTasks(rows.map((r) => r.id));
    return rows.map((r) => rowToTask(r, byTask.get(r.id) ?? []));
  },

  remove(id: number): boolean {
    const result = getDatabase().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
