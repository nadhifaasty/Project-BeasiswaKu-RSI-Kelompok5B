import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils';
import * as userService from '../services/user.service';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const params = req.query;
    const result = await userService.getUsers(params);
    
    // Top-level meta envelope to match TSD and keep compatibility
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Data user berhasil diambil',
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Gagal mengambil data user', 400);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role;

    // A student can only view their own profile, admin/superadmin can view any
    if (currentUserRole === 'siswa' && id !== currentUserId) {
      sendError(res, 'Anda tidak berhak mengakses data user lain.', 403);
      return;
    }

    const data = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Data user berhasil diambil',
      data,
    });
  } catch (error: any) {
    if (error.message.includes('tidak ditemukan')) {
      sendError(res, error.message, 404);
    } else {
      sendError(res, error.message || 'Gagal mengambil detail user', 400);
    }
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;
    const currentUserRole = req.user?.role;

    // A student can only edit their own profile, admin/superadmin can edit any
    if (currentUserRole === 'siswa' && id !== currentUserId) {
      sendError(res, 'Anda tidak berhak mengubah data user lain.', 403);
      return;
    }

    const data = await userService.updateUserProfile(id, req.body);
    sendSuccess(res, data, 'Profil berhasil diperbarui', 200);
  } catch (error: any) {
    sendError(res, error.message || 'Gagal memperbarui profil', 400);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserId = req.user?.userId;

    if (!role) {
      sendError(res, 'Role wajib diisi.', 400);
      return;
    }

    const data = await userService.updateUserRole(id, role, currentUserId || '');
    sendSuccess(res, data, 'Role user berhasil diperbarui', 200);
  } catch (error: any) {
    if (error.message.includes('tidak dapat mengubah role dirinya sendiri') || error.message.includes('terakhir')) {
      sendError(res, error.message, 400);
    } else {
      sendError(res, error.message || 'Gagal memperbarui role user', 400);
    }
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const currentUserId = req.user?.userId;

    if (is_active === undefined) {
      sendError(res, 'Status is_active wajib diisi.', 400);
      return;
    }

    const data = await userService.updateUserStatus(id, is_active, currentUserId || '');
    sendSuccess(res, data, 'Status akun berhasil diperbarui', 200);
  } catch (error: any) {
    sendError(res, error.message || 'Gagal memperbarui status user', 400);
  }
};
