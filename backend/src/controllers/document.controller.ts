import { Response } from 'express';
import * as documentService from '../services/document.service';
import { DocumentType } from '../services/document.service';
import { AuthenticatedRequest } from '../types';

const VALID_TYPES: DocumentType[] = ['foto', 'ktp', 'kartu_keluarga', 'transkrip', 'sktm', 'sertifikat_prestasi'];

export const getDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { applicationId } = req.params;
    const data = await documentService.getByApplication(applicationId, userId);
    res.json({ success: true, message: 'Dokumen berhasil diambil.', data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getUploadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, jenis, file_name } = req.body;

    if (!application_id || !jenis || !file_name) {
      res.status(400).json({ success: false, message: 'application_id, jenis, dan file_name wajib diisi.' });
      return;
    }

    if (!VALID_TYPES.includes(jenis)) {
      res.status(400).json({ success: false, message: `Jenis dokumen tidak valid. Pilihan: ${VALID_TYPES.join(', ')}` });
      return;
    }

    const data = await documentService.getUploadUrl(userId, application_id, jenis, file_name);
    res.json({ success: true, message: 'Upload URL berhasil dibuat.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { application_id, jenis, file_url } = req.body;

    if (!application_id || !jenis || !file_url) {
      res.status(400).json({ success: false, message: 'application_id, jenis, dan file_url wajib diisi.' });
      return;
    }

    if (!VALID_TYPES.includes(jenis)) {
      res.status(400).json({ success: false, message: `Jenis dokumen tidak valid. Pilihan: ${VALID_TYPES.join(', ')}` });
      return;
    }

    const data = await documentService.saveDocument(userId, { application_id, jenis, file_url });
    res.status(201).json({ success: true, message: 'Dokumen berhasil disimpan.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocumentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['tervalidasi', 'ditolak'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status harus "tervalidasi" atau "ditolak".' });
      return;
    }

    const data = await documentService.updateDocumentStatus(id, status);
    res.json({ success: true, message: 'Status dokumen berhasil diperbarui.', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
