import { Response } from 'express';
import { documentService, DocumentType } from '../services/document.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';
import { logAudit, getProgramNameByApplicationId } from '../services/audit.service';

const VALID_TYPES: DocumentType[] = ['foto', 'ktp', 'kartu_keluarga', 'transkrip', 'sktm', 'sertifikat_prestasi'];

/**
 * GET /api/documents/:applicationId
 * Get all documents for an application
 */
export const getDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { applicationId } = req.params;
    const data = await documentService.getByApplication(applicationId, userId, userRole);
    sendSuccess(res, data, 'Dokumen berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

/**
 * POST /api/documents/upload-url
 * Get a signed upload URL for Supabase Storage
 */
export const getUploadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, jenis, file_name } = req.body;

    if (!application_id || !jenis || !file_name) {
      sendError(res, 'application_id, jenis, dan file_name wajib diisi.', 400);
      return;
    }

    if (!VALID_TYPES.includes(jenis)) {
      sendError(res, `Jenis dokumen tidak valid. Pilihan: ${VALID_TYPES.join(', ')}`, 400);
      return;
    }

    const data = await documentService.getUploadUrl(userId, application_id, jenis, file_name);
    const publicUrl = documentService.getPublicUrl(data.path);
    sendSuccess(res, { ...data, publicUrl }, 'Upload URL berhasil dibuat.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

/**
 * POST /api/documents
 * Save document record after successful upload
 */
export const saveDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, jenis, file_url } = req.body;

    if (!application_id || !jenis || !file_url) {
      sendError(res, 'application_id, jenis, dan file_url wajib diisi.', 400);
      return;
    }

    if (!VALID_TYPES.includes(jenis)) {
      sendError(res, `Jenis dokumen tidak valid. Pilihan: ${VALID_TYPES.join(', ')}`, 400);
      return;
    }

    const data = await documentService.saveDocument(userId, { application_id, jenis, file_url });

    // Log upload action
    const programName = await getProgramNameByApplicationId(application_id);
    await logAudit(req, {
      aksi: `UPLOAD_DOCUMENT: Mengunggah dokumen ${jenis}`,
      resourceType: 'documents',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Dokumen berhasil disimpan.', 201);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

/**
 * PATCH /api/documents/:id/status (Admin)
 * Validate or reject a document
 */
export const updateDocumentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['tervalidasi', 'ditolak'].includes(status)) {
      sendError(res, 'Status harus "tervalidasi" atau "ditolak".', 400);
      return;
    }

    const data = await documentService.updateDocumentStatus(id, status);

    // Log verification action
    const programName = await getProgramNameByApplicationId(data.application_id);
    await logAudit(req, {
      aksi: `VERIFIKASI_DOKUMEN: Memverifikasi dokumen ${data.jenis} menjadi ${status}`,
      resourceType: 'documents',
      resourceId: programName,
      level: 'INFO'
    });

    sendSuccess(res, data, 'Status dokumen berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
