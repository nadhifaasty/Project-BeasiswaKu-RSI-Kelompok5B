import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getDocuments,
  getUploadUrl,
  saveDocument,
  updateDocumentStatus,
} from '../controllers/document.controller';

const router = Router();

// All document routes require authentication
router.use(verifyJWT);

// GET /api/documents/:applicationId - Get documents for an application
router.get('/:applicationId', getDocuments);

// POST /api/documents/upload-url - Get signed upload URL
router.post('/upload-url', getUploadUrl);

// POST /api/documents - Save document record
router.post('/', saveDocument);

// PATCH /api/documents/:id/status - Admin: validate/reject document
router.patch('/:id/status', checkRole(['admin', 'super_admin']), updateDocumentStatus);

export default router;
