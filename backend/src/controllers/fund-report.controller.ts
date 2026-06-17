import { Response } from 'express';
import { fundReportService } from '../services/fund-report.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';
import { logAudit, getProgramNameByApplicationId, getProgramNameByReportId } from '../services/audit.service';

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

    // Log report creation action
    const programName = await getProgramNameByApplicationId(application_id);
    await logAudit(req, {
      aksi: `KIRIM_LAPORAN_DANA: Mengirim laporan dana bulan ${bulan}`,
      resourceType: 'fund_reports',
      resourceId: programName,
      level: 'INFO'
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

    // Log verification action
    const programName = await getProgramNameByReportId(id);
    const actionLabel = status === 'terverifikasi' ? 'MEMVERIFIKASI' : 'MENOLAK';
    await logAudit(req, {
      aksi: `VERIFIKASI_LAPORAN_DANA: ${actionLabel} laporan dana`,
      resourceType: 'fund_reports',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Status verifikasi laporan dana berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getReceiptUploadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, file_name } = req.body;

    if (!application_id || !file_name) {
      sendError(res, 'application_id dan file_name wajib diisi.', 400);
      return;
    }

    const data = await fundReportService.getReceiptUploadUrl(userId, application_id, file_name);
    sendSuccess(res, data, 'Upload URL kuitansi berhasil dibuat.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const updateReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { kategori, jumlah, keterangan, bukti_url } = req.body;

    if (!kategori || jumlah === undefined || !keterangan) {
      sendError(res, 'Kategori, jumlah, dan keterangan wajib diisi.', 400);
      return;
    }

    const data = await fundReportService.updateReport(userId, id, {
      kategori,
      jumlah: Number(jumlah),
      keterangan,
      bukti_url,
    });

    // Log update action
    const programName = await getProgramNameByReportId(id);
    await logAudit(req, {
      aksi: `UPDATE_LAPORAN_DANA: Memperbarui laporan dana`,
      resourceType: 'fund_reports',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Laporan penggunaan dana berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};
