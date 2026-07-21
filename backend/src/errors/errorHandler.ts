import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error('[Error Handler]', err);
  return res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
};
