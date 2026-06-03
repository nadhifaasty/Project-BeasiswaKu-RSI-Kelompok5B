import { Request, Response } from 'express';
import { scholarshipService } from '../services/scholarship.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// ============ APPLICATIONS (User) ============

export const getUserApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await scholarshipService.getUserApplications(userId);
    sendSuccess(res, data, 'Daftar pengajuan berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = await scholarshipService.getApplicationById(id, userId);
    sendSuccess(res, data, 'Detail pengajuan berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const createApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { program_id, ipk, esai_motivasi, prestasi_non_akademik } = req.body;

    // Validation
    if (!program_id || ipk === undefined || !esai_motivasi) {
      sendError(res, 'Program, IPK, dan esai motivasi wajib diisi.', 400);
      return;
    }

    if (Number(ipk) < 0 || Number(ipk) > 4) {
      sendError(res, 'IPK harus antara 0 dan 4.', 400);
      return;
    }

    if (esai_motivasi.length < 100) {
      sendError(res, 'Esai motivasi minimal 100 karakter.', 400);
      return;
    }

    const data = await scholarshipService.createApplication(userId, {
      program_id,
      ipk: Number(ipk),
      esai_motivasi,
      prestasi_non_akademik,
    });

    sendSuccess(res, data, 'Pengajuan beasiswa berhasil dibuat!', 201);
  } catch (error: any) {
    const status = error.message.includes('sudah mengajukan') ? 409 :
                   error.message.includes('Lengkapi biodata') ? 400 :
                   error.message.includes('ditutup') || error.message.includes('penuh') ? 400 : 500;
    sendError(res, error.message, status);
  }
};

// ============ ADMIN ============

export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const data = await scholarshipService.getAllApplications(status as string | undefined);
    sendSuccess(res, data, 'Daftar semua pengajuan berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getApplicationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = await scholarshipService.getApplicationHistory(id, userId);
    sendSuccess(res, data, 'Riwayat status pengajuan berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    if (!status) {
      sendError(res, 'Status wajib diisi.', 400);
      return;
    }

    const data = await scholarshipService.updateApplicationStatus(id, status, catatan_admin);
    sendSuccess(res, data, 'Status pengajuan berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};
