import { getDatabase } from '../db/connection';
import { Task } from './task';

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

export const TagModel = {
  // BUG conocido: la búsqueda es case-sensitive porque no normalizamos `tag`.
  // Esto se va a convertir en test de regresión en este vídeo.
  searchTasksByTag(tag: string): Task[] {
    const rows = getDatabase()
      .prepare(
        `SELECT t.id, t.title, t.description, t.completed, t.created_at
         FROM tasks t
         JOIN task_tags tt ON tt.task_id = t.id
         JOIN tags g ON g.id = tt.tag_id
         WHERE g.name = ?
         ORDER BY t.id DESC`,
      )
      .all(tag) as TaskRow[];
    return rows.map(rowToTask);
  },

  addTag(taskId: number, tag: string): void {
    const db = getDatabase();
    db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tag);
    const tagRow = db.prepare('SELECT id FROM tags WHERE name = ?').get(tag) as
      | { id: number }
      | undefined;
    if (!tagRow) return;
    db.prepare('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(
      taskId,
      tagRow.id,
    );
  },
};
