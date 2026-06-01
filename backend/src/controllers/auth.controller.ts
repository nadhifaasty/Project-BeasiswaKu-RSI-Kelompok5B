import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { RegisterPayload, LoginPayload } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama_lengkap, nim_nisn, nomor_hp, email, password } = req.body as RegisterPayload;

    if (!nama_lengkap || !nim_nisn || !nomor_hp || !email || !password) {
      res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Format email tidak valid.' });
      return;
    }

    const result = await authService.register({ nama_lengkap, nim_nisn, nomor_hp, email, password });

    res.status(201).json({
      success: true, message: 'Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.',
      data: { userId: result.userId, email: result.email },
    });
  } catch (error: any) {
    const status = error.message.includes('sudah terdaftar') ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
      return;
    }

    const { tokens, profile } = await authService.login({ email, password });

    res.json({
      success: true, message: 'Login berhasil.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: profile.id, nama_lengkap: profile.nama_lengkap, email: profile.email, role: profile.role, nim_nisn: profile.nim_nisn },
      },
    });
  } catch (error: any) {
    const status = error.message.includes('terkunci') ? 429 :
      error.message.includes('salah') || error.message.includes('belum diverifikasi') ? 401 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User tidak terautentikasi.' });
      return;
    }
    await authService.logout(userId);
    res.json({ success: true, message: 'Logout berhasil.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email wajib diisi.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Format email tidak valid.' });
      return;
    }
    await authService.forgotPassword(email);
    res.json({ success: true, message: 'Jika email terdaftar, tautan reset password akan dikirimkan.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, password_confirmation } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
      return;
    }
    if (password !== password_confirmation) {
      res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok.' });
      return;
    }
    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User tidak terautentikasi.' });
      return;
    }
    const profile = await authService.getMe(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
      return;
    }
    res.json({
      success: true, message: 'Profil berhasil diambil.',
      data: {
        id: profile.id, nama_lengkap: profile.nama_lengkap, email: profile.email, role: profile.role,
        nim_nisn: profile.nim_nisn, nomor_hp: profile.nomor_hp, biodata_progress: profile.biodata_progress,
        biodata_complete: profile.biodata_complete, profile_data: profile.profile_data,
        created_at: profile.created_at, updated_at: profile.updated_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email wajib diisi.' });
      return;
    }
    await authService.resendVerification(email);
    res.json({ success: true, message: 'Email verifikasi berhasil dikirim ulang.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Token verifikasi wajib diisi.' });
      return;
    }
    await authService.verifyEmail(token);
    res.json({ success: true, message: 'Email berhasil diverifikasi! Silakan login.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token wajib diisi.' });
      return;
    }
    const tokens = await authService.refreshToken(token);
    res.json({ success: true, message: 'Token berhasil diperbarui.', data: tokens });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};
