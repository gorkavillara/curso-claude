import { Router, Request, Response, NextFunction } from 'express';
import { TaskModel, ValidationError } from '../models/task';

export const tasksRouter = Router();

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

tasksRouter.get('/', (_req: Request, res: Response) => {
  const taskList = TaskModel.list();
  res.json(taskList);
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
    const task = TaskModel.create(req.body);
    return res.status(201).json(task);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    return next(err);
  }
});

tasksRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });

    const updated = TaskModel.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    return res.json(updated);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
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
