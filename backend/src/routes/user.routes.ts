import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
} from '../controllers/user.controller';

const router = Router();

// All user management routes require authentication
router.use(verifyJWT);

// GET /api/v1/users - Retrieve all users (Admin/SuperAdmin)
router.get('/', checkRole(['admin', 'super_admin']), getUsers);

// GET /api/v1/users/:id - Retrieve specific user details (Admin/SuperAdmin)
router.get('/:id', checkRole(['admin', 'super_admin']), getUserById);

// PATCH /api/v1/users/:id/profile - Update user basic profile (Siswa/Admin/SuperAdmin)
router.patch('/:id/profile', updateUserProfile);

// PATCH /api/v1/users/:id/role - Update user role (SuperAdmin)
router.patch('/:id/role', checkRole(['super_admin']), updateUserRole);

// PATCH /api/v1/users/:id/status - Update user status (Admin/SuperAdmin)
router.patch('/:id/status', checkRole(['admin', 'super_admin']), updateUserStatus);

export default router;
