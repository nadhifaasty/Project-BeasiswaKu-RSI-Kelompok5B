import { Response } from 'express';
import { disbursementService } from '../services/disbursement.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

export const createDisbursement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { bank_name, account_no, account_holder, cabang_bank, receipt_book_file, ktp_file } = req.body;

    const data = await disbursementService.createDisbursement(userId, {
      bank_name,
      account_no,
      account_holder,
      cabang_bank,
      receipt_book_file,
      ktp_file,
    });

    sendSuccess(res, data, 'Data rekening tersimpan dan menunggu verifikasi.', 201);
  } catch (error: any) {
    const status = error.message.includes('sudah tersimpan') ? 409 :
                   error.message.includes('boleh berisi angka') ? 400 :
                   error.message.includes('penerima beasiswa') ? 403 : 400;
    sendError(res, error.message, status);
  }
};

export const getMyDisbursement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await disbursementService.getMyDisbursement(userId);

    if (!data) {
      sendSuccess(res, null, 'Belum ada data rekening. Silakan lengkapi data pencairan.');
      return;
    }

    sendSuccess(res, data, 'Data pencairan berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const updateDisbursement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { bank_name, account_no, account_holder, cabang_bank, receipt_book_file, ktp_file } = req.body;

    const data = await disbursementService.updateDisbursement(userId, id, {
      bank_name,
      account_no,
      account_holder,
      cabang_bank,
      receipt_book_file,
      ktp_file,
    });

    sendSuccess(res, data, 'Data rekening berhasil diperbarui.');
  } catch (error: any) {
    const status = error.message.includes('tidak ditemukan') ? 404 :
                   error.message.includes('tidak berhak') ? 403 :
                   error.message.includes('sudah diverifikasi') ? 423 : 400;
    sendError(res, error.message, status);
  }
};

export const verifyDisbursement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const { id } = req.params;
    const { is_verified, catatan } = req.body;

    if (is_verified === undefined || is_verified === null) {
      sendError(res, 'Status verifikasi wajib diisi.', 400);
      return;
    }

    const data = await disbursementService.verifyDisbursement(adminId, id, is_verified, catatan);
    const message = data.is_verified
      ? 'Data rekening telah diverifikasi dan dikunci.'
      : 'Data rekening ditolak. Siswa diminta melengkapi ulang.';

    sendSuccess(res, data, message);
  } catch (error: any) {
    const status = error.message.includes('tidak ditemukan') ? 404 : 400;
    sendError(res, error.message, status);
  }
};

export const getBankAccountByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requestorId = req.user!.userId;
    const requestorRole = req.user!.role;
    const { id: targetUserId } = req.params;

    const data = await disbursementService.getBankAccountByUserId(requestorId, requestorRole, targetUserId);

    if (!data) {
      sendSuccess(res, null, 'Belum ada data rekening tersimpan.');
      return;
    }

    sendSuccess(res, data, 'Data rekening berhasil diambil.');
  } catch (error: any) {
    const status = error.message.includes('tidak berhak') ? 403 : 500;
    sendError(res, error.message, status);
  }
};
