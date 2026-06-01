import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getPrograms,
  getProgramById,
} from '../controllers/scholarship.controller';

const router = Router();

// ============ PUBLIC ============
// GET /api/v1/programs — List available programs
router.get('/', getPrograms);

// GET /api/v1/programs/{id} — Detail program
router.get('/:id', getProgramById);

// ============ ADMIN ============
// POST /api/v1/programs — Create program
// TODO: implement

// PATCH /api/v1/programs/{id} — Edit program
// TODO: implement

// PATCH /api/v1/programs/{id}/status — Open/close registration
// TODO: implement

export default router;