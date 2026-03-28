import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { STATUS_CODE } from '../shared/constants';

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

  console.error(err);
  return res.status(STATUS_CODE.INTERNAL_ERROR).json({
    status: 'error',
    message: 'Internal Server Error - An unexpected error has occured',
    data: err
  });
};
