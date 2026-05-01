import { getDatabase } from '../db/connection';
import { Task } from './task';

interface TaskRow {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
}

export const TagModel = {
  // VULN: el tag se concatena directamente a la SQL en vez de parametrizarse.
  searchTasksByTag(tag: string): Task[] {
    console.log('[search] tag input:', tag);
    const sql = `SELECT t.id, t.title, t.description, t.completed, t.created_at
                 FROM tasks t
                 JOIN task_tags tt ON tt.task_id = t.id
                 JOIN tags g ON g.id = tt.tag_id
                 WHERE g.name = '${tag}'
                 ORDER BY t.id DESC`;
    const rows = getDatabase().prepare(sql).all() as TaskRow[];
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      completed: row.completed === 1,
      created_at: row.created_at,
    }));
  },
};
