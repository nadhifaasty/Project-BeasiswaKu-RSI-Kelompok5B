import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message = 'Success', status = 200): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(status).json(response);
};

export const sendError = (res: Response, error: string, status = 500): void => {
  const response: ApiResponse = { success: false, message: error, error };
  res.status(status).json(response);
};
