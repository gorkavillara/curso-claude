import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { tasksRouter } from './routes/tasks';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'taskmaster-ts' });
  });

  app.use('/api/tasks', tasksRouter);
  app.use('/api/auth', authRouter);

  app.use(errorHandler);

  return app;
}
