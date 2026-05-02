import { ErrorRequestHandler } from 'express';
import { ValidationError } from '../models/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[taskmaster]', err);
  let status = 500;
  if (err instanceof ValidationError) status = 400;
  else if (typeof err?.status === 'number') status = err.status;
  res.status(status).json({
    error: err?.message ?? 'Internal Server Error',
  });
};
