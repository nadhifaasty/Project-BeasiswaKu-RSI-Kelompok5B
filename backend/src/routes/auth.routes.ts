import { Router } from 'express';
import {
  register,
  login,
  resendVerification,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from '../controllers/auth.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

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

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// GET /api/auth/me
router.get('/me', verifyJWT, getMe);

// POST /api/auth/logout
router.post('/logout', verifyJWT, logout);

export default router;
