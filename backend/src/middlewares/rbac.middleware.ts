import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';

export function checkRole(req: AuthenticatedRequest, res: Response, next: NextFunction, allowedRoles: UserRole[]) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Akses ditolak. Autentikasi diperlukan.' });
    return;
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk mengakses resource ini.`,
    });
    return;
  }

  next();
}
