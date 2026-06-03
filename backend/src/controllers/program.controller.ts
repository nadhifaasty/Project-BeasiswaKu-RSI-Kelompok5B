import { Request, Response } from 'express';
import { programService } from '../services/program.service';
import { sendSuccess, sendError } from '../utils';
import { createProgramSchema, updateProgramSchema, updateProgramStatusSchema } from '../utils/validators';
import { z } from 'zod';

export const getPrograms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await programService.getAllPrograms();
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

export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi Zod
    const parsedData = createProgramSchema.parse(req.body);

    const data = await programService.createProgram(parsedData);
    sendSuccess(res, data, 'Program beasiswa berhasil dibuat!', 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => e.message).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }
    sendError(res, error.message, 500);
  }
};

export const updateProgram = async (req: Request, res: Response): Promise<void> => {
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

export const updateProgramStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validasi Zod
    const parsedData = updateProgramStatusSchema.parse(req.body);

    const data = await programService.updateProgramStatus(id, parsedData.status);
    sendSuccess(res, data, 'Status program berhasil diperbarui.');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => e.message).join(', ');
      sendError(res, errorMessages, 400);
      return;
    }
    sendError(res, error.message, 500);
  }
};
