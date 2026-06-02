import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  updateProgramStatus,
} from '../controllers/program.controller';

const router = Router();

// ============ PUBLIC ============
// GET /api/v1/programs
router.get('/', getPrograms);

// GET /api/v1/programs/:id
router.get('/:id', getProgramById);

// ============ ADMIN / SUPER ADMIN ============
// POST /api/v1/programs
router.post('/', verifyJWT, checkRole(['admin', 'super_admin']), createProgram);

// PATCH /api/v1/programs/:id
router.patch('/:id', verifyJWT, checkRole(['admin', 'super_admin']), updateProgram);

// PATCH /api/v1/programs/:id/status
router.patch('/:id/status', verifyJWT, checkRole(['admin', 'super_admin']), updateProgramStatus);

export default router;
