import { Request, Response, NextFunction } from 'express';

export { verifyJWT } from './auth.middleware';
export { checkRole } from './rbac.middleware';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
