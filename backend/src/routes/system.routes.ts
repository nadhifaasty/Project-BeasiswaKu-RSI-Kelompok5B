import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getSettings,
  updateSettings,
  triggerReminder,
} from '../controllers/system.controller';
import { getBankAccountByUserId } from '../controllers/disbursement.controller';

const router = Router();

// GET /api/system/settings — SuperAdmin ONLY
router.get('/settings', verifyJWT, checkRole(['super_admin']), getSettings);

// PATCH /api/system/settings — SuperAdmin ONLY
router.patch('/settings', verifyJWT, checkRole(['super_admin']), updateSettings);

// POST /api/system/cron/reminder — SuperAdmin ONLY
router.post('/cron/reminder', verifyJWT, checkRole(['super_admin']), triggerReminder);

// GET /api/users/:id/bank-account — Siswa (milik sendiri) / Admin / SuperAdmin
router.get('/users/:id/bank-account', verifyJWT, getBankAccountByUserId);

export default router;
