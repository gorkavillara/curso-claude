import { Router, Request, Response, NextFunction } from 'express';
import { TaskModel, TaskInput, TASK_PRIORITIES, TaskPriority } from '../models/task';

export const tasksRouter = Router();

tasksRouter.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log(`[tasks] -> ${req.method} ${req.originalUrl}`);
  _res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[tasks] <- ${req.method} ${req.originalUrl} ${_res.statusCode} (${ms}ms)`);
  });
  next();
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateInput(body: unknown, partial = false): TaskInput | string {
  if (!body || typeof body !== 'object') {
    return 'Body must be a JSON object';
  }
  const candidate = body as Record<string, unknown>;

  if (!partial || candidate.title !== undefined) {
    if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
      return 'Field "title" is required and must be a non-empty string';
    }
  }
  if (candidate.description !== undefined && typeof candidate.description !== 'string') {
    return 'Field "description" must be a string';
  }
  if (candidate.completed !== undefined && typeof candidate.completed !== 'boolean') {
    return 'Field "completed" must be a boolean';
  }
  if (
    candidate.priority !== undefined &&
    (typeof candidate.priority !== 'string' ||
      !TASK_PRIORITIES.includes(candidate.priority as TaskPriority))
  ) {
    return `Field "priority" must be one of: ${TASK_PRIORITIES.join(', ')}`;
  }

  return {
    title: typeof candidate.title === 'string' ? candidate.title : '',
    description: candidate.description as string | undefined,
    completed: candidate.completed as boolean | undefined,
    priority: candidate.priority as TaskPriority | undefined,
  };
}

tasksRouter.get('/', (_req: Request, res: Response) => {
  res.json(TaskModel.list());
});

tasksRouter.get('/stats', (_req: Request, res: Response) => {
  res.json(TaskModel.stats());
});

tasksRouter.get('/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  const task = TaskModel.get(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json(task);
});

tasksRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = validateInput(req.body);
    if (typeof parsed === 'string') {
      return res.status(400).json({ error: parsed });
    }
    const task = TaskModel.create(parsed);
    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
});

tasksRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });

    const parsed = validateInput(req.body, true);
    if (typeof parsed === 'string') {
      return res.status(400).json({ error: parsed });
    }

    const updated = TaskModel.update(id, parsed);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

tasksRouter.delete('/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  const ok = TaskModel.remove(id);
  if (!ok) return res.status(404).json({ error: 'Task not found' });
  return res.status(204).send();
});
