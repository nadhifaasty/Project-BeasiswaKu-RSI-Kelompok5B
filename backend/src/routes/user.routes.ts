import { Router } from 'express';
import { getUsers, getUserById, updateUserProfile, updateUserRole, updateUserStatus } from '../controllers/user.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';

const router = Router();

// Modul 2 : Manajemen User
// GET /api/v1/users - List semua user (super_admin & admin)
router.get('/', verifyJWT, checkRole(['super_admin', 'admin']), getUsers);

// GET /api/v1/users/:id - Detail user berdasarkan ID (siswa milik sendiri, admin/super_admin)
router.get('/:id', verifyJWT, checkRole(['siswa', 'admin', 'super_admin']), getUserById);

// PATCH /api/v1/users/:id/profile - Update profil user (siswa milik sendiri, admin/super_admin)
router.patch('/:id/profile', verifyJWT, checkRole(['siswa', 'admin', 'super_admin']), updateUserProfile);

// PATCH /api/v1/users/:id/role - Ubah role user (super_admin ONLY)
router.patch('/:id/role', verifyJWT, checkRole(['super_admin']), updateUserRole);

// PATCH /api/v1/users/:id/status - Aktivasi / nonaktifkan akun (super_admin ONLY)
router.patch('/:id/status', verifyJWT, checkRole(['super_admin']), updateUserStatus);

export default router;
