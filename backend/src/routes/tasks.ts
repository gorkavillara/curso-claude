import { Router, Request, Response, NextFunction } from 'express';
import { TaskModel } from '../models/task';

export const tasksRouter = Router();

tasksRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(TaskModel.list());
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = TaskModel.parseId(req.params.id);
    const task = TaskModel.get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  } catch (err) {
    return next(err);
  }
});

tasksRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = TaskModel.create(req.body);
    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
});

tasksRouter.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = TaskModel.parseId(req.params.id);
    const updated = TaskModel.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

tasksRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = TaskModel.parseId(req.params.id);
    const ok = TaskModel.remove(id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});
