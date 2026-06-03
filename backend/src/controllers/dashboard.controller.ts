import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export const getSuperAdminMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getSuperAdminMetrics();
    sendSuccess(res, data, 'Metrik dashboard berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
