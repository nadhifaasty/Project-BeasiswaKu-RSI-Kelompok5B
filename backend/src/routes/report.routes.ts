import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import { exportExcel } from '../controllers/report.controller';
import { getEvaluations } from '../controllers/admin.controller';
import {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
} from '../controllers/fund-report.controller';

const router = Router();

// ==========================================
// TSD 6.b: Laporan Program Beasiswa
// ==========================================
router.get('/programs', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);
router.get('/programs/:id', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);

// ==========================================
// TSD 6.c: Export Excel Laporan Pendaftar
// ==========================================
router.get('/export', verifyJWT, checkRole(['admin', 'super_admin']), exportExcel);

// ==========================================
// TSD 6.d, 6.e, 6.f: Laporan Penggunaan Dana (Monthly)
// ==========================================

// Siswa endpoints
// POST /api/v1/reports/monthly
router.post('/monthly', verifyJWT, checkRole(['siswa']), createReport);

// GET /api/v1/reports/monthly/{userId}
router.get('/monthly/:userId', verifyJWT, getUserReports);

// Admin endpoints
// PATCH /api/v1/reports/monthly/{id}/verify
router.patch('/monthly/:id/verify', verifyJWT, checkRole(['admin', 'super_admin']), updateReportStatus);

export default router;
