import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============ AUTH TYPES ============

export type UserRole = 'siswa' | 'admin' | 'super_admin';

export interface RegisterPayload {
  nama_lengkap: string;
  nim_nisn: string;
  nomor_hp: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti?: string;
  sub?: string;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileRow {
  id: string;
  nama_lengkap: string;
  nim_nisn: string;
  nomor_hp: string;
  email: string;
  role: UserRole;
  biodata_progress: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ EXPRESS EXTENSION ============

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
