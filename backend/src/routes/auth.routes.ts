import { Router } from 'express';
import {
  register,
  login,
  resendVerification,
  verifyEmail,
  refreshToken,
} from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);

// POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

export default router;
