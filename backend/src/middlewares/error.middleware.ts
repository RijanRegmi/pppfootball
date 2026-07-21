import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errors/errorHandler';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorHandler(err, req, res, next);
};
