import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

    // Self-healing: Check if user exists in Supabase Auth but has no profile
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && users) {
      const existingAuthUser = users.find(u => u.email === email);
      if (existingAuthUser) {
        // Since there is no profile (existingEmail was null), delete the auth user so they can sign up fresh
        await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
      }
    }

    // 3. Create user in Supabase Auth using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        nama_lengkap,
        nim_nisn,
        nomor_hp,
      },
    });

    if (authError) {
      throw new Error(`Gagal membuat akun: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Gagal membuat akun: Data user tidak ditemukan.');
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
    const jti = crypto.randomUUID();
    const tokenPayload = {
      ...payload,
      jti,
      sub: payload.userId,
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
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

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    if (email.endsWith('@simba.com') || email.endsWith('@test.com')) {
      console.log(`[MOCK] Bypassing Supabase forgotPassword for test email: ${email}`);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      throw new Error(`Gagal mengirim email reset password: ${error.message}`);
    }
  }

  /**
   * Reset user password using access token, code, or OTP token_hash
   */
  async resetPassword(payload: {
    token?: string;
    code?: string;
    token_hash?: string;
    password?: string;
  }): Promise<void> {
    const { token, code, token_hash, password } = payload;

    if (!password) {
      throw new Error('Password baru wajib diisi.');
    }

    if (password.length < 8) {
      throw new Error('Panjang password minimal harus 8 karakter.');
    }

    let userId: string | null = null;

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        throw new Error('Token pemulihan tidak valid atau sudah kedaluwarsa.');
      }
      userId = user.id;
    } else if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.user) {
        throw new Error('Kode pemulihan tidak valid atau sudah kedaluwarsa.');
      }
      userId = data.user.id;
    } else if (token_hash) {
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      });
      if (error || !data.user) {
        throw new Error('Token OTP pemulihan tidak valid atau sudah kedaluwarsa.');
      }
      userId = data.user.id;
    } else {
      throw new Error('Token pemulihan tidak ditemukan.');
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (updateError) {
      throw new Error(`Gagal memperbarui password: ${updateError.message}`);
    }
  }
}

export const authService = new AuthService();