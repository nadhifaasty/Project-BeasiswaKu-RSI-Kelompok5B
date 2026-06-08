import { Router } from 'express';
import { getAuditLogs, getEvaluations } from '../controllers/admin.controller';
import { runSelection, getSelectionResults, finalizeSelection, rollbackSelection } from '../controllers/selection.controller';
import { getSuperAdminMetrics, getMonitoring } from '../controllers/dashboard.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
const router = Router();

// Endpoint untuk mendapatkan audit logs (SuperAdmin ONLY)
router.get('/audit-logs', verifyJWT, checkRole(['super_admin']), getAuditLogs);

// Endpoint dari spesifikasi user: /evaluations (Admin & SuperAdmin)
router.get('/evaluations', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);

// Endpoint sesuai spesifikasi TSD: /reports/programs/:id (untuk komparasi atau single)
router.get('/reports/programs/:id', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);

// ============ SELECTION ENGINE (Admin & SuperAdmin) ============
// POST /api/admin/selections/:programId/run
router.post('/selections/:programId/run', verifyJWT, checkRole(['admin', 'super_admin']), runSelection);

// GET /api/admin/selections/:programId/results
router.get('/selections/:programId/results', verifyJWT, checkRole(['admin', 'super_admin']), getSelectionResults);

// POST /api/admin/selections/:programId/finalize
router.post('/selections/:programId/finalize', verifyJWT, checkRole(['admin', 'super_admin']), finalizeSelection);

// POST /api/admin/selections/:programId/rollback
router.post('/selections/:programId/rollback', verifyJWT, checkRole(['admin', 'super_admin']), rollbackSelection);

// ============ SUPER ADMIN DASHBOARD KPI METRICS ============
// GET /api/admin/monitoring — SuperAdmin ONLY
router.get('/monitoring', verifyJWT, checkRole(['super_admin']), getMonitoring);

// GET /api/super-admin/dashboard (also handles /api/admin/dashboard)
router.get('/dashboard', verifyJWT, checkRole(['super_admin', 'admin']), getSuperAdminMetrics);

export default router;
