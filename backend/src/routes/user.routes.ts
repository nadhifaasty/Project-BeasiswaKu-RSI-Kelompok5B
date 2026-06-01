import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  getProfile,
  updateProfile,
} from '../controllers/biodata.controller';

const router = Router();

// GET /api/v1/users/:id/profile — Ambil profil user
router.get('/:id/profile', verifyJWT, getProfile);

// PATCH /api/v1/users/:id/profile — Update profil user (jsonb)
router.patch('/:id/profile', verifyJWT, updateProfile);

export default router;
