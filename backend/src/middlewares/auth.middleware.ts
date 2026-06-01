import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Akses ditolak. Format token tidak valid.' });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.' });
  }
};
