import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getReceiptUploadUrl,
} from '../controllers/fund-report.controller';

const router = Router();

// Siswa endpoints
router.post('/upload-url', verifyJWT, checkRole(['siswa']), getReceiptUploadUrl);
router.post('/', verifyJWT, createReport);
router.get('/', verifyJWT, getUserReports);

// Admin endpoints
router.get('/admin', verifyJWT, checkRole(['admin', 'super_admin']), getAllReports);
router.patch('/admin/:id/status', verifyJWT, checkRole(['admin', 'super_admin']), updateReportStatus);

export default router;
