import { Response, NextFunction } from 'express';
import { sendError } from '../utils';
import { AuthenticatedRequest, UserRole } from '../types';

/**
 * Middleware: checkRole (RBAC Guard)
 * Restricts route access based on user role.
 * Must be used AFTER verifyJWT middleware.
 *
 * @param allowedRoles - Array of roles permitted to access the route
 *
 * Usage:
 *   router.get('/admin/dashboard', verifyJWT, checkRole(['admin', 'super_admin']), handler)
 */
export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Akses ditolak. Autentikasi diperlukan.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk mengakses resource ini.`,
        403
      );
      return;
    }

    next();
  };
};
