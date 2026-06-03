import { Router } from 'express';
import { getAuditLogs, getEvaluations } from '../controllers/admin.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
const router = Router();

// Endpoint untuk mendapatkan audit logs (SuperAdmin ONLY)
router.get('/audit-logs', verifyJWT, checkRole(['super_admin']), getAuditLogs);

// Endpoint dari spesifikasi user: /evaluations (Admin & SuperAdmin)
router.get('/evaluations', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);

// Endpoint sesuai spesifikasi TSD: /reports/programs/:id (untuk komparasi atau single)
router.get('/reports/programs/:id', verifyJWT, checkRole(['admin', 'super_admin']), getEvaluations);

export default router;
