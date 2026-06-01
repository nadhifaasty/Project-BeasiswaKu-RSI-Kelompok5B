import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  register,
  login,
  logout,
  resendVerification,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';

const router = Router();

// ============ TSD Modul 1 : Autentikasi ============

// POST /api/v1/auth/register — Registrasi akun siswa baru (public)
router.post('/register', register);

// POST /api/v1/auth/login — Login & terima JWT token (public)
router.post('/login', login);

// POST /api/v1/auth/logout — Logout & blacklist token (JWT)
router.post('/logout', verifyJWT, logout);

// POST /api/v1/auth/forgot-password — Kirim email reset password (public)
router.post('/forgot-password', forgotPassword);

// POST /api/v1/auth/reset-password — Reset password via token (public)
router.post('/reset-password', resetPassword);

// GET /api/v1/auth/me — Ambil profil user yang sedang login (JWT)
router.get('/me', verifyJWT, getMe);

// ============ Endpoints tambahan (pendukung auth flow, tidak di TSD) ============

// POST /api/v1/auth/resend-verification — Kirim ulang email verifikasi
router.post('/resend-verification', resendVerification);

// POST /api/v1/auth/verify-email — Verifikasi email dengan token
router.post('/verify-email', verifyEmail);

// POST /api/v1/auth/refresh-token — Refresh access token
router.post('/refresh-token', refreshToken);

export default router;
