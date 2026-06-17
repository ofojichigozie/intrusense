import { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/AppError';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Error]', err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message, data: null });
    return;
  }

  res.status(500).json({ status: 'error', message: 'Internal server error', data: null });
}
