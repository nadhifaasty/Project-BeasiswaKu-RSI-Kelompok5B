import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { programService } from '../services/program.service';
import { sendSuccess, sendError } from '../utils';
import { createProgramSchema, createDraftProgramSchema, updateProgramSchema, updateProgramStatusSchema } from '../utils/validators';
import { z } from 'zod';
import { logAudit, getProgramNameByProgramId } from '../services/audit.service';

export const getPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeDraft = req.query.include_draft === 'true';
    const data = await programService.getAllPrograms(includeDraft);
    sendSuccess(res, data, 'Daftar program beasiswa berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await programService.getProgramById(id);
    sendSuccess(res, data, 'Detail program berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const createProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const isDraft = req.body.status === 'DRAFT';

    const parsedData = isDraft
      ? createDraftProgramSchema.parse(req.body)
      : createProgramSchema.parse(req.body);

    const data = await programService.createProgram(adminId, parsedData);

    const aksi = isDraft
      ? `CREATE_DRAFT_PROGRAM: Menyimpan draf program beasiswa: ${data.nama}`
      : `CREATE_PROGRAM: Membuka program beasiswa baru: ${data.nama}`;

    await logAudit(req, {
      aksi,
      resourceType: 'scholarship_programs',
      resourceId: data.nama,
      level: 'INFO',
    });

    const message = isDraft ? 'Draf program beasiswa berhasil disimpan!' : 'Program beasiswa berhasil dibuat!';
    sendSuccess(res, data, message, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => e.message).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }
    sendError(res, error.message, 500);
  }
};

export const updateProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validasi Zod
    const parsedData = updateProgramSchema.parse(req.body);
    
    // Pastikan tidak kosong object nya
    if (Object.keys(parsedData).length === 0) {
      sendError(res, 'Tidak ada data untuk diperbarui.', 400);
      return;
    }

    const data = await programService.updateProgram(id, parsedData);

    // Log update action
    const programName = await getProgramNameByProgramId(id);
    await logAudit(req, {
      aksi: `UPDATE_PROGRAM: Memperbarui program beasiswa: ${programName}`,
      resourceType: 'scholarship_programs',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Program beasiswa berhasil diperbarui.');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => e.message).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }
    const status = error.message.includes('tidak dapat diedit') ? 403 : 500;
    sendError(res, error.message, status);
  }
};

export const updateProgramStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validasi Zod
    const parsedData = updateProgramStatusSchema.parse(req.body);

    const data = await programService.updateProgramStatus(id, parsedData.status);

    // Log status update action
    const programName = await getProgramNameByProgramId(id);
    await logAudit(req, {
      aksi: `UPDATE_PROGRAM_STATUS: Mengubah status program beasiswa menjadi ${parsedData.status}`,
      resourceType: 'scholarship_programs',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Status program berhasil diperbarui.');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => e.message).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }
    const statusCode = error.message.includes('tidak dapat diaktifkan') ? 403 : 500;
    sendError(res, error.message, statusCode);
  }
};
