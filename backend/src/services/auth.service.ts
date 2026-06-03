import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';
import { RegisterPayload, LoginPayload, JwtPayload, TokenPair, ProfileRow } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'beasiswaku-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'beasiswaku-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Maximum failed login attempts before temporary lock
const MAX_LOGIN_ATTEMPTS = 5;
// Lock duration in minutes
const LOCK_DURATION_MINUTES = 15;

// In-memory store for login attempts (in production, use Redis)
const loginAttempts: Map<string, { count: number; lockedUntil: Date | null }> = new Map();

class AuthService {
  /**
   * Register a new user:
   * 1. Check duplicate email/NIM in profiles table
   * 2. Create user in Supabase Auth
   * 3. Insert profile row in profiles table
   * 4. Trigger Verification Email
   */
  async register(payload: RegisterPayload): Promise<{ userId: string; email: string }> {
    const { nama_lengkap, nim_nisn, nomor_hp, email, password } = payload;

    // 1. Check duplicate email in profiles
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    // 2. Check duplicate NIM/NISN in profiles
    const { data: existingNim } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('nim_nisn', nim_nisn)
      .single();

    if (existingNim) {
      throw new Error('NIM/NISN sudah terdaftar. Silakan periksa kembali.');
    }

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Set to false to trigger verification email
      user_metadata: {
        nama_lengkap,
        nim_nisn,
        nomor_hp,
      },
    });

    if (authError) {
      throw new Error(`Gagal membuat akun: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 4. Insert profile into profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        nama_lengkap,
        nim_nisn,
        nomor_hp,
        email,
        role: 'siswa',
        biodata_progress: 0,
      });

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Gagal menyimpan profil: ${profileError.message}`);
    }

    // 5. Send verification email via Supabase resend API
    // Menggunakan resend() karena createUser() di atas tidak otomatis mengirim email jika email_confirm: false
    const { error: sendError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifikasi-email`,
      },
    });

    if (sendError) {
      console.error('Warning: Failed to send verification email:', sendError.message);
      // Non-fatal: user is created, they can request resend via UI
    }

    return { userId, email };
  }

  /**
   * Login user:
   * 1. Check if account is locked (brute-force protection)
   * 2. Authenticate with Supabase Auth
   * 3. Verify email is confirmed
   * 4. Fetch profile and generate JWT tokens
   */
  async login(payload: LoginPayload): Promise<{ tokens: TokenPair; profile: ProfileRow }> {
    const { email, password } = payload;

    // 1. Check if account is temporarily locked
    const attempts = loginAttempts.get(email);
    if (attempts?.lockedUntil && new Date() < attempts.lockedUntil) {
      const remainingMinutes = Math.ceil(
        (attempts.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      throw new Error(
        `Akun terkunci sementara karena terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMinutes} menit.`
      );
    }

    // 2. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Increment failed attempts
      this.recordFailedAttempt(email);
      const currentAttempts = loginAttempts.get(email);

      if (currentAttempts && currentAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        throw new Error(
          `Akun terkunci sementara selama ${LOCK_DURATION_MINUTES} menit karena ${MAX_LOGIN_ATTEMPTS}x percobaan login gagal.`
        );
      }

      const remaining = MAX_LOGIN_ATTEMPTS - (currentAttempts?.count || 0);
      throw new Error(
        `Email atau password salah. Sisa percobaan: ${remaining}x.`
      );
    }

    // Reset failed attempts on successful login
    loginAttempts.delete(email);

    // 3. Check if email is confirmed
    const user = authData.user;
    if (!user.email_confirmed_at) {
      throw new Error('Email belum diverifikasi. Silakan cek email Anda untuk link aktivasi.');
    }

    // 4. Fetch profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profil pengguna tidak ditemukan.');
    }

    // 5. Generate JWT tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email!,
      role: profile.role,
    });

    return { tokens, profile };
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifikasi-email`,
      },
    });

    if (error) {
      throw new Error(`Gagal mengirim ulang email verifikasi: ${error.message}`);
    }
  }

  /**
   * Verify email token (confirm user email)
   */
  async verifyEmail(token: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      throw new Error(`Token verifikasi tidak valid atau sudah kedaluwarsa: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
      const tokens = this.generateTokens({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      return tokens;
    } catch {
      throw new Error('Refresh token tidak valid atau sudah kedaluwarsa.');
    }
  }

  // ============ PRIVATE HELPERS ============

  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  private recordFailedAttempt(email: string): void {
    const current = loginAttempts.get(email) || { count: 0, lockedUntil: null };
    current.count += 1;

    if (current.count >= MAX_LOGIN_ATTEMPTS) {
      current.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    }

    loginAttempts.set(email, current);
  }

  /**
   * Verify a JWT access token and return the payload
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      throw new Error('Access token tidak valid atau sudah kedaluwarsa.');
    }
  }
}

export const authService = new AuthService();