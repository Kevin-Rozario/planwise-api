import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.util.js';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      status: err.statusCode,
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      status: 400,
      message: err.message,
      errors: err.errors || null,
    });
  }

  console.error('Unexpected error: ', err);

  console.error('Unexpected error: ', err);

  return res.status(500).json({
    success: false,
    status: 500,
    message: 'Internal Server Error',
  });
};
