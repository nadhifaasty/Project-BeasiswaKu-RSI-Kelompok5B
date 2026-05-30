import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

interface SeedUser {
  email: string;
  password: string;
  nama_lengkap: string;
  nim_nisn: string;
  nomor_hp: string;
  role: 'siswa' | 'admin' | 'super_admin';
}

const seedUsers: SeedUser[] = [
  {
    email: 'siswa@simba.com',
    password: 'password123',
    nama_lengkap: 'Budi Santoso',
    nim_nisn: 'A0012345',
    nomor_hp: '081234567890',
    role: 'siswa',
  },
  {
    email: 'admin@simba.com',
    password: 'password123',
    nama_lengkap: 'Siti Rahayu',
    nim_nisn: 'ADM001',
    nomor_hp: '081234567891',
    role: 'admin',
  },
  {
    email: 'superadmin@simba.com',
    password: 'password123',
    nama_lengkap: 'Dr. Ahmad Wijaya',
    nim_nisn: 'SA001',
    nomor_hp: '081234567892',
    role: 'super_admin',
  },
];

async function seed() {
  console.log('🌱 Seeding dummy users...\n');

  for (const user of seedUsers) {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm
        user_metadata: {
          nama_lengkap: user.nama_lengkap,
          nim_nisn: user.nim_nisn,
          nomor_hp: user.nomor_hp,
        },
      });

      if (authError) {
        // If user already exists, skip
        if (authError.message.includes('already been registered')) {
          console.log(`⏭️  ${user.email} (${user.role}) - sudah ada, skip.`);
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;

      // 2. Insert profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          nama_lengkap: user.nama_lengkap,
          nim_nisn: user.nim_nisn,
          nomor_hp: user.nomor_hp,
          email: user.email,
          role: user.role,
          biodata_progress: 0,
        });

      if (profileError) {
        console.error(`❌ ${user.email} - Profile error: ${profileError.message}`);
        // Cleanup auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        continue;
      }

      console.log(`✅ ${user.email} (${user.role}) - berhasil dibuat!`);
    } catch (err: any) {
      console.error(`❌ ${user.email} - ${err.message}`);
    }
  }

  console.log('\n🎉 Seeding selesai!');
  console.log('\n📋 Akun Demo:');
  console.log('┌─────────────────────────┬───────────────┬──────────────┐');
  console.log('│ Email                   │ Password      │ Role         │');
  console.log('├─────────────────────────┼───────────────┼──────────────┤');
  console.log('│ siswa@simba.com         │ password123   │ siswa        │');
  console.log('│ admin@simba.com         │ password123   │ admin        │');
  console.log('│ superadmin@simba.com    │ password123   │ super_admin  │');
  console.log('└─────────────────────────┴───────────────┴──────────────┘');

  process.exit(0);
}

seed();
