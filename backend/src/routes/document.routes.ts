import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import { getDocuments, getUploadUrl, saveDocument, updateDocumentStatus } from '../controllers/document.controller';

const router = Router();

router.use(verifyJWT);

router.get('/:applicationId/documents', getDocuments);
router.post('/:applicationId/documents', saveDocument);
router.post('/:applicationId/documents/upload-url', getUploadUrl);
router.patch('/:applicationId/documents/:docId/status', (req, res, next) => checkRole(req, res, next, ['admin', 'super_admin']), updateDocumentStatus);

export default router;
