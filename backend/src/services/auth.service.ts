import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { RegisterPayload, LoginPayload, JwtPayload, TokenPair, ProfileRow } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'beasiswaku-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'beasiswaku-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

const loginAttempts: Map<string, { count: number; lockedUntil: Date | null }> = new Map();

function generateTokens(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

function recordFailedAttempt(email: string): void {
  const current = loginAttempts.get(email) || { count: 0, lockedUntil: null };
  current.count += 1;
  if (current.count >= MAX_LOGIN_ATTEMPTS) {
    current.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
  }
  loginAttempts.set(email, current);
}

export async function register(payload: RegisterPayload): Promise<{ userId: string; email: string }> {
  const { nama_lengkap, nim_nisn, nomor_hp, email, password } = payload;

  const { data: existingEmail } = await supabaseAdmin
    .from('profiles').select('id').eq('email', email).single();
  if (existingEmail) throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');

  const { data: existingNim } = await supabaseAdmin
    .from('profiles').select('id').eq('nim_nisn', nim_nisn).single();
  if (existingNim) throw new Error('NIM/NISN sudah terdaftar. Silakan periksa kembali.');

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { nama_lengkap, nim_nisn, nomor_hp },
  });
  if (authError) throw new Error(`Gagal membuat akun: ${authError.message}`);

  const userId = authData.user.id;
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId, nama_lengkap, nim_nisn, nomor_hp, email, role: 'siswa', biodata_progress: 25, profile_data: { pribadi: { nama_lengkap, nim_nisn, email, nomor_hp } }
  });
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Gagal menyimpan profil: ${profileError.message}`);
  }

  await supabaseAdmin.auth.resend({
    type: 'signup', email,
    options: { emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifikasi-email` },
  });

  return { userId, email };
}

export async function login(payload: LoginPayload): Promise<{ tokens: TokenPair; profile: ProfileRow }> {
  const { email, password } = payload;

  const attempts = loginAttempts.get(email);
  if (attempts?.lockedUntil && new Date() < attempts.lockedUntil) {
    const remainingMinutes = Math.ceil((attempts.lockedUntil.getTime() - Date.now()) / (1000 * 60));
    throw new Error(`Akun terkunci sementara karena terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMinutes} menit.`);
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (authError) {
    recordFailedAttempt(email);
    const currentAttempts = loginAttempts.get(email);
    if (currentAttempts && currentAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      throw new Error(`Akun terkunci sementara selama ${LOCK_DURATION_MINUTES} menit karena ${MAX_LOGIN_ATTEMPTS}x percobaan login gagal.`);
    }
    const remaining = MAX_LOGIN_ATTEMPTS - (currentAttempts?.count || 0);
    throw new Error(`Email atau password salah. Sisa percobaan: ${remaining}x.`);
  }

  loginAttempts.delete(email);

  if (!authData.user.email_confirmed_at) {
    throw new Error('Email belum diverifikasi. Silakan cek email Anda untuk link aktivasi.');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('*').eq('id', authData.user.id).single();
  if (profileError || !profile) throw new Error('Profil pengguna tidak ditemukan.');

  const tokens = generateTokens({
    userId: authData.user.id, email: authData.user.email!, role: profile.role,
  });

  return { tokens, profile };
}

export async function logout(userId: string): Promise<void> {
  await supabaseAdmin.auth.admin.signOut(userId);
}

export async function forgotPassword(email: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
  });
  if (error) throw new Error(`Gagal mengirim email reset password: ${error.message}`);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) throw new Error('Token reset password tidak valid atau sudah kedaluwarsa.');

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
  if (updateError) throw new Error(`Gagal mereset password: ${updateError.message}`);
}

export async function getMe(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return data;
}

export async function resendVerification(email: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.resend({
    type: 'signup', email,
    options: { emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifikasi-email` },
  });
  if (error) throw new Error(`Gagal mengirim ulang email verifikasi: ${error.message}`);
}

export async function verifyEmail(token: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.verifyOtp({ token_hash: token, type: 'email' });
  if (error) throw new Error(`Token verifikasi tidak valid atau sudah kedaluwarsa: ${error.message}`);
}

export async function refreshToken(refreshToken: string): Promise<TokenPair> {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    return generateTokens({ userId: decoded.userId, email: decoded.email, role: decoded.role });
  } catch {
    throw new Error('Refresh token tidak valid atau sudah kedaluwarsa.');
  }
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Access token tidak valid atau sudah kedaluwarsa.');
  }
}
