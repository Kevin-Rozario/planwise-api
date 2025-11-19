import type { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/apiError.util.js';

export const validateMiddleware =
  (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = await schema.parseAsync(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ApiError(400, error.message));
      }
      next(new ApiError(500, 'Could not validate request body'));
    }
  };
