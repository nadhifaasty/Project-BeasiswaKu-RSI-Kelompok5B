import { Router } from 'express';
import { getAuditLogs } from '../controllers/admin.controller';

import { getSuperAdminMetrics, getMonitoring } from '../controllers/dashboard.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
const router = Router();

// Endpoint untuk mendapatkan audit logs (SuperAdmin ONLY)
router.get('/audit-logs', verifyJWT, checkRole(['super_admin']), getAuditLogs);



// ============ SUPER ADMIN DASHBOARD KPI METRICS ============
// GET /api/admin/monitoring — SuperAdmin ONLY
router.get('/monitoring', verifyJWT, checkRole(['super_admin']), getMonitoring);

// GET /api/super-admin/dashboard (also handles /api/admin/dashboard)
router.get('/dashboard', verifyJWT, checkRole(['super_admin', 'admin']), getSuperAdminMetrics);

export default router;
