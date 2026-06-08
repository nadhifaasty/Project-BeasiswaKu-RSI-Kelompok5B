import { Response } from 'express';
import { systemService } from '../services/system.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await systemService.getSettings();
    sendSuccess(res, data, 'Konfigurasi sistem berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { min_ipk_sma, min_ipk_pt, max_penghasilan_ortu } = req.body;

    const data = await systemService.updateSettings(adminId, {
      min_ipk_sma: min_ipk_sma !== undefined ? Number(min_ipk_sma) : undefined,
      min_ipk_pt: min_ipk_pt !== undefined ? Number(min_ipk_pt) : undefined,
      max_penghasilan_ortu: max_penghasilan_ortu !== undefined ? Number(max_penghasilan_ortu) : undefined,
    });

    sendSuccess(res, data, 'Konfigurasi aturan kelayakan berhasil diperbarui.');
  } catch (error: any) {
    const status = error.message.includes('tidak valid') ? 422 : 500;
    sendError(res, error.message, status);
  }
};

export const triggerReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const data = await systemService.triggerReminder(adminId);

    if (data.recipients_targeted === 0) {
      sendSuccess(res, data, 'Semua penerima aktif sudah mengirim laporan bulan ini.');
      return;
    }

    sendSuccess(res, data, 'Auto-reminder berhasil dijadwalkan ke antrean pengiriman.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
