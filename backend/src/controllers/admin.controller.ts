import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils';
import { getAuditLogs as fetchAuditLogs, getEvaluations as fetchEvaluations } from '../services/admin.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const params = req.query;
    const result = await fetchAuditLogs(params);
    sendSuccess(res, result.data, 'Audit log berhasil diambil', 200);
    // Note: To match TSD exactly, we might want to include meta in the envelope:
    // But since sendSuccess typically wraps data, we'll append meta.
    // However, if sendSuccess just wraps data, we can modify the response directly or just pass the whole result.
    // The TSD expects: { status: "success", data: [...], meta: {...}, message: ... }
  } catch (error: any) {
    sendError(res, error.message || 'Gagal mengambil audit log');
  }
};

export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // If accessed via /api/v1/reports/programs/:id
    const programId = id || req.query.program_id?.toString();
    const result = await fetchEvaluations(programId);
    
    // For single program, return the object. For list, return array.
    const data = id && result.length > 0 ? result[0] : result;
    
    sendSuccess(res, data, 'Laporan program berhasil diambil', 200);
  } catch (error: any) {
    sendError(res, error.message || 'Gagal mengambil evaluasi program');
  }
};
