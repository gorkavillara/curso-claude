import { Router, Request, Response, NextFunction } from 'express';
import { TaskModel, TaskInput } from '../models/task';
import { TagModel } from '../models/tag';

export const tasksRouter = Router();

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

  return {
    title: typeof candidate.title === 'string' ? candidate.title : '',
    description: candidate.description as string | undefined,
    completed: candidate.completed as boolean | undefined,
  };
}

tasksRouter.get('/', (_req: Request, res: Response) => {
  res.json(TaskModel.list());
});

tasksRouter.get('/search', (req: Request, res: Response) => {
  try {
    const tag = req.query.tag as string;
    const results = TagModel.searchTasksByTag(tag);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
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
