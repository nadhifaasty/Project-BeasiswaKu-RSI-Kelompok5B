import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest, UserRole } from '../types';
import { logAudit } from '../services/audit.service';

/**
 * GET /api/v1/users
 * Retrieve all users profiles with pagination, search, and role filters.
 * Allowed Roles: admin, super_admin
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      per_page = 10,
      search,
      role,
      sort_by = 'created_at',
      order = 'desc',
    } = req.query;

    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,email.ilike.%${search}%,nim_nisn.ilike.%${search}%`);
    }

    const from = (Number(page) - 1) * Number(per_page);
    const to = from + Number(per_page) - 1;

    query = query.order(sort_by as string, { ascending: order === 'asc' }).range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      sendError(res, `Gagal mengambil daftar pengguna: ${error.message}`);
      return;
    }

    sendSuccess(res, {
      users,
      meta: {
        current_page: Number(page),
        per_page: Number(per_page),
        total: count || 0,
        last_page: Math.ceil((count || 0) / Number(per_page)),
      }
    }, 'Daftar pengguna berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server.');
  }
};

/**
 * GET /api/v1/users/:id
 * Retrieve a specific user profile detail.
 * Allowed Roles: admin, super_admin
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      sendError(res, `Gagal mengambil detail pengguna: ${error.message}`);
      return;
    }

    if (!user) {
      sendError(res, 'Pengguna tidak ditemukan.', 404);
      return;
    }

    sendSuccess(res, user, 'Detail pengguna berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server.');
  }
};

/**
 * PATCH /api/v1/users/:id/profile
 * Update user basic profile (nama_lengkap, nim_nisn, nomor_hp).
 * Allowed Roles: siswa (own profile), admin, super_admin
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama_lengkap, nim_nisn, nomor_hp } = req.body;

    // Authorization check: User can update themselves, admin/super_admin can update anyone
    if (req.user!.role !== 'admin' && req.user!.role !== 'super_admin' && req.user!.userId !== id) {
      sendError(res, 'Akses ditolak. Anda tidak memiliki izin untuk mengubah profil ini.', 403);
      return;
    }

    // Fetch existing profile to log original data
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingProfile) {
      sendError(res, 'Profil pengguna tidak ditemukan.', 404);
      return;
    }

    // Perform update
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        nama_lengkap: nama_lengkap !== undefined ? nama_lengkap : existingProfile.nama_lengkap,
        nim_nisn: nim_nisn !== undefined ? nim_nisn : existingProfile.nim_nisn,
        nomor_hp: nomor_hp !== undefined ? nomor_hp : existingProfile.nomor_hp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      if (updateError.message.includes('unique') || updateError.message.includes('duplicate')) {
        sendError(res, 'NIM/NISN sudah terdaftar pada pengguna lain.', 400);
      } else {
        sendError(res, `Gagal memperbarui profil: ${updateError.message}`);
      }
      return;
    }

    // Write audit log
    await logAudit(req, {
      aksi: 'MENGUBAH_PROFIL',
      resourceType: 'profiles',
      resourceId: updatedProfile.nama_lengkap,
      oldValues: {
        nama_lengkap: existingProfile.nama_lengkap,
        nim_nisn: existingProfile.nim_nisn,
        nomor_hp: existingProfile.nomor_hp
      },
      newValues: {
        nama_lengkap: updatedProfile.nama_lengkap,
        nim_nisn: updatedProfile.nim_nisn,
        nomor_hp: updatedProfile.nomor_hp
      }
    });

    sendSuccess(res, updatedProfile, 'Profil berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server.');
  }
};

/**
 * PATCH /api/v1/users/:id/role
 * Update user role.
 * Allowed Roles: admin, super_admin
 */
export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: UserRole };

    // Authorization check: Only super_admin can change role
    if (req.user!.role !== 'super_admin') {
      sendError(res, 'Akses ditolak. Hanya Super Admin yang dapat mengubah role pengguna.', 403);
      return;
    }

    // Validation
    if (!role || !['siswa', 'admin', 'super_admin'].includes(role)) {
      sendError(res, 'Role tidak valid. Harus salah satu dari: siswa, admin, super_admin.', 400);
      return;
    }

    // Fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingProfile) {
      sendError(res, 'Pengguna tidak ditemukan.', 404);
      return;
    }

    // Perform update
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      sendError(res, `Gagal memperbarui role pengguna: ${updateError.message}`);
      return;
    }

    // Write audit log
    await logAudit(req, {
      aksi: 'MENGUBAH_ROLE_PENGGUNA',
      resourceType: 'profiles',
      resourceId: `${updatedProfile.nama_lengkap} (${updatedProfile.email})`,
      oldValues: { role: existingProfile.role },
      newValues: { role: updatedProfile.role }
    });

    sendSuccess(res, updatedProfile, 'Role pengguna berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server.');
  }
};

/**
 * PATCH /api/v1/users/:id/status
 * Update user status (is_active).
 * Allowed Roles: admin, super_admin
 */
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined || typeof is_active !== 'boolean') {
      sendError(res, 'Status is_active wajib diisi dengan tipe boolean.', 400);
      return;
    }

    // Prevent deactivating own account
    if (req.user!.userId === id) {
      sendError(res, 'Anda tidak bisa menonaktifkan akun Anda sendiri.', 400);
      return;
    }

    // Fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingProfile) {
      sendError(res, 'Pengguna tidak ditemukan.', 404);
      return;
    }

    // Perform update
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      sendError(res, `Gagal memperbarui status pengguna: ${updateError.message}`);
      return;
    }

    // Write audit log
    await logAudit(req, {
      aksi: is_active ? 'MENGAKTIFKAN_PENGGUNA' : 'MENONAKTIFKAN_PENGGUNA',
      resourceType: 'profiles',
      resourceId: `${updatedProfile.nama_lengkap} (${updatedProfile.email})`,
      oldValues: { is_active: existingProfile.is_active },
      newValues: { is_active: updatedProfile.is_active }
    });

    sendSuccess(res, updatedProfile, 'Status pengguna berhasil diperbarui.');
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server.');
  }
};
