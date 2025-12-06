import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    const { message, statusCode } = err;
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
};
