import { Response } from 'express';
import { fundReportService } from '../services/fund-report.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, bulan, kategori, jumlah, keterangan, bukti_url } = req.body;

    if (!application_id || !bulan || !kategori || jumlah === undefined || !keterangan) {
      sendError(res, 'Semua parameter laporan wajib diisi.', 400);
      return;
    }

    const data = await fundReportService.createReport(userId, {
      application_id,
      bulan,
      kategori,
      jumlah: Number(jumlah),
      keterangan,
      bukti_url,
    });

    sendSuccess(res, data, 'Laporan penggunaan dana berhasil dikirim.', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getUserReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await fundReportService.getUserReports(userId);
    sendSuccess(res, data, 'Daftar laporan dana berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getAllReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const data = await fundReportService.getAllReports(status as string | undefined);
    sendSuccess(res, data, 'Daftar semua laporan dana berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const updateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    if (!status || !['terverifikasi', 'ditolak'].includes(status)) {
      sendError(res, 'Status tidak valid. Harus terverifikasi atau ditolak.', 400);
      return;
    }

    const data = await fundReportService.updateReportStatus(id, status, catatan_admin);
    sendSuccess(res, data, 'Status verifikasi laporan dana berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};
