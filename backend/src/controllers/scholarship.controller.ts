import { Request, Response } from 'express';
import * as scholarshipService from '../services/scholarship.service';
import { AuthenticatedRequest } from '../types';

export const getPrograms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await scholarshipService.getPrograms();
    res.json({ success: true, message: 'Daftar program beasiswa berhasil diambil.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await scholarshipService.getProgramById(id);
    res.json({ success: true, message: 'Detail program berhasil diambil.', data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getUserApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await scholarshipService.getUserApplications(userId);
    res.json({ success: true, message: 'Daftar pengajuan berhasil diambil.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = await scholarshipService.getApplicationById(id, userId);
    res.json({ success: true, message: 'Detail pengajuan berhasil diambil.', data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { program_id, ipk, esai_motivasi, prestasi_non_akademik } = req.body;

    if (!program_id || ipk === undefined || !esai_motivasi) {
      res.status(400).json({ success: false, message: 'Program, IPK, dan esai motivasi wajib diisi.' });
      return;
    }

    if (Number(ipk) < 0 || Number(ipk) > 4) {
      res.status(400).json({ success: false, message: 'IPK harus antara 0 dan 4.' });
      return;
    }

    if (esai_motivasi.length < 100) {
      res.status(400).json({ success: false, message: 'Esai motivasi minimal 100 karakter.' });
      return;
    }

    const data = await scholarshipService.createApplication(userId, { program_id, ipk: Number(ipk), esai_motivasi, prestasi_non_akademik });

    res.status(201).json({ success: true, message: 'Pengajuan beasiswa berhasil dibuat!', data });
  } catch (error: any) {
    const status = error.message.includes('sudah mengajukan') ? 409 :
      error.message.includes('Lengkapi biodata') ? 400 :
      error.message.includes('ditutup') || error.message.includes('penuh') ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const data = await scholarshipService.getAllApplications(status as string | undefined);
    res.json({ success: true, message: 'Daftar semua pengajuan berhasil diambil.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, catatan_admin, updated_at } = req.body;
    const adminId = req.user!.userId;

    if (!status) {
      res.status(400).json({ status: 'error', error_code: 'ERR-VAL-01', message: 'Status wajib diisi.' });
      return;
    }

    const data = await scholarshipService.updateApplicationStatus(id, status, adminId, updated_at, catatan_admin);
    res.status(200).json({
      status: 'success',
      data: {
        application_id: data.id,
        old_status: data.old_status,
        new_status: data.status
      },
      message: 'Status pengajuan berhasil diperbarui'
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      error_code: error.code || 'ERR-SYS-01',
      message: error.message
    });
  }
};
