import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { tasksRouter } from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  if (!process.env.APP_SECRET) {
    throw new Error(
      'Missing required environment variable APP_SECRET. Copy .env.example to .env and set the value.',
    );
  }

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'taskmaster-ts' });
  });

  app.use('/api/tasks', tasksRouter);

  app.use(errorHandler);

  return app;
}
