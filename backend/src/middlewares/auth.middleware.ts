import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware: verifyJWT
 * Extracts Bearer token from Authorization header,
 * verifies it, and attaches decoded payload to req.user
 */
export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Akses ditolak. Token tidak ditemukan.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 'Akses ditolak. Format token tidak valid.', 401);
      return;
    }

    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error: any) {
    sendError(res, 'Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.', 401);
  }
};
