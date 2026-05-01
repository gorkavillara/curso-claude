import { Task } from '../models/task';

export type SortKey = 'created_at' | 'title' | 'completed';
export type SortDir = 'asc' | 'desc';

export function sortTasks(tasks: Task[], key: SortKey, dir: SortDir = 'asc'): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return copy;
}

export function paginate<T>(items: T[], page: number, size: number): T[] {
  if (page < 1 || size < 1) return [];
  const start = (page - 1) * size;
  return items.slice(start, start + size);
}
