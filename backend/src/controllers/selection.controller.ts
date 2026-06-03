import { Response } from 'express';
import { selectionService } from '../services/selection.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export const runSelection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const actorId = req.user!.userId;
    const { bobot_akademik, bobot_ekonomi, bobot_prestasi, bobot_dokumen } = req.body;

    if (!programId) {
      sendError(res, 'Program ID wajib diisi.', 400);
      return;
    }

    if (bobot_akademik !== undefined || bobot_ekonomi !== undefined || bobot_prestasi !== undefined || bobot_dokumen !== undefined) {
      const total = Number(bobot_akademik || 0) + Number(bobot_ekonomi || 0) + Number(bobot_prestasi || 0) + Number(bobot_dokumen || 0);
      if (total !== 100) {
        sendError(res, 'Total keempat bobot seleksi harus berjumlah tepat 100%.', 400);
        return;
      }
    }

    const data = await selectionService.runSelection(programId, actorId, {
      bobot_akademik: bobot_akademik ? Number(bobot_akademik) : undefined,
      bobot_ekonomi: bobot_ekonomi ? Number(bobot_ekonomi) : undefined,
      bobot_prestasi: bobot_prestasi ? Number(bobot_prestasi) : undefined,
      bobot_dokumen: bobot_dokumen ? Number(bobot_dokumen) : undefined,
    });
    sendSuccess(res, data, 'Kalkulasi skor kelayakan selesai.');
  } catch (error: any) {
    const status = error.message.includes('Tidak ada pengajuan') ? 400 : 500;
    sendError(res, error.message, status);
  }
};

export const getSelectionResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;

    if (!programId) {
      sendError(res, 'Program ID wajib diisi.', 400);
      return;
    }

    const data = await selectionService.getSelectionResults(programId);
    sendSuccess(res, data, 'Hasil pemeringkatan seleksi berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const finalizeSelection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const actorId = req.user!.userId;

    if (!programId) {
      sendError(res, 'Program ID wajib diisi.', 400);
      return;
    }

    const data = await selectionService.finalizeSelection(programId, actorId);
    sendSuccess(res, data, 'Hasil seleksi berhasil disahkan dan bersifat final.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const rollbackSelection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const actorId = req.user!.userId;

    if (!programId) {
      sendError(res, 'Program ID wajib diisi.', 400);
      return;
    }

    const data = await selectionService.rollbackSelection(programId, actorId);
    sendSuccess(res, data, 'Pengesahan hasil seleksi berhasil dibatalkan.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};
