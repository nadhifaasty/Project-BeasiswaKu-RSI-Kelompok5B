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

export const getMonitoring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tahun_ajaran, semester } = req.query;
    const data = await dashboardService.getMonitoringMetrics(
      tahun_ajaran as string | undefined,
      semester as string | undefined
    );
    sendSuccess(res, data, 'Monitoring strategis berhasil dimuat.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
