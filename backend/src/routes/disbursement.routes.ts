import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  createDisbursement,
  getMyDisbursement,
  updateDisbursement,
  verifyDisbursement,
} from '../controllers/disbursement.controller';

const router = Router();

// POST /api/disbursements — Siswa (penerima DITERIMA)
router.post('/', verifyJWT, createDisbursement);

// GET /api/disbursements/my — Siswa
router.get('/my', verifyJWT, getMyDisbursement);

// PATCH /api/disbursements/:id — Siswa (pemilik)
router.patch('/:id', verifyJWT, updateDisbursement);

// PATCH /api/disbursements/:id/verify — Admin / SuperAdmin
router.patch('/:id/verify', verifyJWT, checkRole(['admin', 'super_admin']), verifyDisbursement);

export default router;
