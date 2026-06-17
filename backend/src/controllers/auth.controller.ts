import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { redisService } from '../services/redis.service';
import { supabase, supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils';
import { RegisterPayload, LoginPayload, AuthenticatedRequest } from '../types';
import { logAudit, logAuditManual } from '../services/audit.service';

/**
 * POST /auth/register
 * Register a new user account
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama_lengkap, nim_nisn, nomor_hp, email, password } = req.body as RegisterPayload;

    // Validation
    if (!nama_lengkap || !nim_nisn || !nomor_hp || !email || !password) {
      sendError(res, 'Semua field wajib diisi.', 400);
      return;
    }

    if (password.length < 8) {
      sendError(res, 'Password minimal 8 karakter.', 400);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, 'Format email tidak valid.', 400);
      return;
    }

    const result = await authService.register({
      nama_lengkap,
      nim_nisn,
      nomor_hp,
      email,
      password,
    });

    sendSuccess(
      res,
      { userId: result.userId, email: result.email },
      'Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.',
      201
    );
  } catch (error: any) {
    const status = error.message.includes('sudah terdaftar') ? 409 : 500;
    sendError(res, error.message, status);
  }
};

/**
 * POST /auth/login
 * Authenticate user and return JWT tokens
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginPayload;

    // Validation
    if (!email || !password) {
      sendError(res, 'Email dan password wajib diisi.', 400);
      return;
    }

    const { tokens, profile } = await authService.login({ email, password });

    // Log the login action in audit_logs
    await logAuditManual({
      userId: profile.id,
      userEmail: profile.email,
      userRole: profile.role,
      aksi: 'LOGIN',
      resourceType: 'auth',
      resourceId: 'Sistem',
      ipAddress: req.ip || req.socket.remoteAddress || (req.headers['x-forwarded-for'] as string) || '',
      userAgent: (req.headers['user-agent'] as string) || '',
      level: 'INFO'
    });

    sendSuccess(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: profile.id,
        nama_lengkap: profile.nama_lengkap,
        email: profile.email,
        role: profile.role,
        nim_nisn: profile.nim_nisn,
      },
    }, 'Login berhasil.');
  } catch (error: any) {
    const status = error.message.includes('terkunci') ? 429 :
                   error.message.includes('salah') || error.message.includes('belum diverifikasi') ? 401 : 500;
    sendError(res, error.message, status);
  }
};

/**
 * POST /auth/resend-verification
 * Resend email verification link
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 'Email wajib diisi.', 400);
      return;
    }

    await authService.resendVerification(email);

    sendSuccess(res, null, 'Email verifikasi berhasil dikirim ulang.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

/**
 * POST /auth/verify-email
 * Verify user email with token
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      sendError(res, 'Token verifikasi wajib diisi.', 400);
      return;
    }

    await authService.verifyEmail(token);

    sendSuccess(res, null, 'Email berhasil diverifikasi! Silakan login.');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

/**
 * POST /auth/refresh-token
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      sendError(res, 'Refresh token wajib diisi.', 400);
      return;
    }

    const tokens = await authService.refreshToken(token);

    sendSuccess(res, tokens, 'Token berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
};

/**
 * POST /auth/forgot-password
 * Send password reset email via Supabase Auth
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 'Email wajib diisi.', 400);
      return;
    }

    await authService.forgotPassword(email);

    sendSuccess(res, null, 'Link pemulihan kata sandi berhasil dikirim ke email Anda.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/reset-password
 * Reset password using verification token/code/hash
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, code, token_hash, password } = req.body;

    if (!password) {
      sendError(res, 'Password baru wajib diisi.', 400);
      return;
    }

    if (password.length < 8) {
      sendError(res, 'Panjang password minimal harus 8 karakter.', 400);
      return;
    }

    await authService.resetPassword({ token, code, token_hash, password });

    sendSuccess(res, null, 'Kata sandi berhasil diperbarui. Silakan login kembali.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

/**
 * GET /auth/me
 * Retrieve currently logged in user profile details
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      sendError(res, 'Profil pengguna tidak ditemukan.', 404);
      return;
    }

    if (profile.is_active === false) {
      sendError(res, 'Akun Anda dinonaktifkan oleh administrator.', 401);
      return;
    }

    sendSuccess(res, {
      id: profile.id,
      nama_lengkap: profile.nama_lengkap,
      email: profile.email,
      role: profile.role,
      nim_nisn: profile.nim_nisn,
      nomor_hp: profile.nomor_hp,
      biodata_progress: profile.biodata_progress,
      is_active: profile.is_active,
      created_at: profile.created_at,
    }, 'Profil berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

/**
 * POST /auth/logout
 * Log out user and blacklist JWT token
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Token tidak ditemukan.', 400);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = req.user!;

    if (decoded.jti && decoded.exp) {
      await redisService.blacklistToken(decoded.jti, decoded.exp);
    }

    // Call Supabase signOut to clean session
    await supabase.auth.signOut();

    // Log the logout action in audit_logs
    await logAudit(req, {
      aksi: 'LOGOUT',
      resourceType: 'auth',
      resourceId: 'Sistem',
      level: 'INFO'
    });

    sendSuccess(res, null, 'Logout berhasil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
