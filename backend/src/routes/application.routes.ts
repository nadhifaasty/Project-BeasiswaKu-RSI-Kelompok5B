import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getUserApplications,
  getApplicationById,
  createApplication,
  getAllApplications,
  updateApplicationStatus,
  getApplicationHistory,
} from '../controllers/scholarship.controller';

const router = Router();

// GET /api/v1/applications/my — Riwayat siswa sendiri (TSD 4.b)
router.get('/my', verifyJWT, getUserApplications);

// GET /api/v1/applications — List semua (admin) (TSD 4.c)
router.get('/', verifyJWT, checkRole(['admin', 'super_admin']), getAllApplications);

// GET /api/v1/applications/:id — Detail pengajuan (TSD 4.d)
router.get('/:id', verifyJWT, getApplicationById);

// GET /api/v1/applications/:id/history — Riwayat status untuk timeline
router.get('/:id/history', verifyJWT, getApplicationHistory);

// POST /api/v1/applications — Buat pengajuan (TSD 4.a)
router.post('/', verifyJWT, createApplication);

// PATCH /api/v1/applications/:id/status — Update status oleh admin (TSD 4.f)
router.patch('/:id/status', verifyJWT, checkRole(['admin', 'super_admin']), updateApplicationStatus);

export default router;
