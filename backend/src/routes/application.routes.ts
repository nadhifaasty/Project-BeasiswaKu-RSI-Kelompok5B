import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getUserApplications,
  getApplicationById,
  createApplication,
  getAllApplications,
  updateApplicationStatus,
  submitApplication,
} from '../controllers/scholarship.controller';

const router = Router();

// ============ USER: Applications (requires auth) ============
// GET /api/v1/applications/my
router.get('/my', verifyJWT, getUserApplications);

// ============ PUBLIC / SHARED ============
// GET /api/v1/applications/:id
router.get('/:id', verifyJWT, getApplicationById);

// POST /api/v1/applications
router.post('/', verifyJWT, createApplication);

// POST /api/v1/applications/:id/submit
router.post('/:id/submit', verifyJWT, submitApplication);

// ============ ADMIN: Manage Applications ============
// GET /api/v1/applications?status=PENDING
router.get('/', verifyJWT, checkRole(['admin', 'super_admin']), getAllApplications);

// PATCH /api/v1/applications/:id/status
router.patch('/:id/status', verifyJWT, checkRole(['admin', 'super_admin']), updateApplicationStatus);

export default router;
