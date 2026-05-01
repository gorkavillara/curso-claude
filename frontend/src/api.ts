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

const API_BASE = (window as unknown as { API_BASE?: string }).API_BASE ?? 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  list: () => request<Task[]>('/tasks'),
  create: (input: TaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  searchByTag: (tag: string) => request<Task[]>(`/tasks/search?tag=${tag}`),
};
