import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getPrograms,
  getProgramById,
  getUserApplications,
  getApplicationById,
  createApplication,
  getAllApplications,
  updateApplicationStatus,
} from '../controllers/scholarship.controller';

const router = Router();

// ============ PUBLIC: Programs ============
// GET /api/scholarship/programs
router.get('/programs', getPrograms);

// GET /api/scholarship/programs/:id
router.get('/programs/:id', getProgramById);

// ============ USER: Applications (requires auth) ============
// GET /api/scholarship/applications
router.get('/applications', verifyJWT, getUserApplications);

// GET /api/scholarship/applications/:id
router.get('/applications/:id', verifyJWT, getApplicationById);

// POST /api/scholarship/applications
router.post('/applications', verifyJWT, createApplication);

// ============ ADMIN: Manage Applications ============
// GET /api/scholarship/admin/applications?status=PENDING
router.get('/admin/applications', verifyJWT, checkRole(['admin', 'super_admin']), getAllApplications);

// PATCH /api/scholarship/admin/applications/:id/status
router.patch('/admin/applications/:id/status', verifyJWT, checkRole(['admin', 'super_admin']), updateApplicationStatus);

export default router;
