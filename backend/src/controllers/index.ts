import { Request, Response } from 'express';
import { sendSuccess } from '../utils';

export const healthCheck = (_req: Request, res: Response): void => {
  sendSuccess(res, { status: 'OK', timestamp: new Date().toISOString() }, 'Server is running');
};

export * from './admin.controller';
