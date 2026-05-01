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
  searchTasksByTag(tag: string): Task[] {
    const normalized = tag.trim().toLowerCase();
    const rows = getDatabase()
      .prepare(
        `SELECT t.id, t.title, t.description, t.completed, t.created_at
         FROM tasks t
         JOIN task_tags tt ON tt.task_id = t.id
         JOIN tags g ON g.id = tt.tag_id
         WHERE g.name = ?
         ORDER BY t.id DESC`,
      )
      .all(normalized) as TaskRow[];
    return rows.map(rowToTask);
  },
};
