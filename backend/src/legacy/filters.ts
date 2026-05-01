import { Task } from '../models/task';

export type TaskFilter = 'all' | 'pending' | 'completed';

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === 'all') return tasks;
  if (filter === 'pending') return tasks.filter((t) => !t.completed);
  return tasks.filter((t) => t.completed);
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (q === '') return tasks;
  return tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
  );
}

export function groupByCompletion(tasks: Task[]): { pending: Task[]; completed: Task[] } {
  return {
    pending: tasks.filter((t) => !t.completed),
    completed: tasks.filter((t) => t.completed),
  };
}
