import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function checkData() {
  console.log('🔍 Mengecek isi data di Supabase...\n');

  // 1. Profiles
  const { data: profiles, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('email, nama_lengkap, role, biodata_progress')
    .order('created_at', { ascending: true });

  console.log('═══════════════════════════════════════════');
  console.log('📋 TABEL: profiles');
  console.log('═══════════════════════════════════════════');
  if (profErr) {
    console.error('❌ Error:', profErr.message);
  } else if (!profiles || profiles.length === 0) {
    console.log('   (kosong)');
  } else {
    console.table(profiles);
  }

  // 2. Biodata Pribadi
  const { data: pribadi, error: pribErr } = await supabaseAdmin
    .from('biodata_pribadi')
    .select('nama_lengkap, nim_nisn, email, nomor_hp, tempat_lahir, jenis_kelamin');

  console.log('\n═══════════════════════════════════════════');
  console.log('📋 TABEL: biodata_pribadi');
  console.log('═══════════════════════════════════════════');
  if (pribErr) {
    console.error('❌ Error:', pribErr.message);
  } else if (!pribadi || pribadi.length === 0) {
    console.log('   (kosong)');
  } else {
    console.table(pribadi);
  }

  // 3. Hitung jumlah baris tiap tabel biodata
  const tables = ['biodata_pribadi', 'biodata_alamat', 'biodata_orang_tua', 'biodata_akademik', 'applications'];
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 JUMLAH BARIS PER TABEL');
  console.log('═══════════════════════════════════════════');
  for (const t of tables) {
    const { count, error } = await supabaseAdmin
      .from(t)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   ${t}: ❌ ${error.message}`);
    } else {
      console.log(`   ${t}: ${count ?? 0} baris`);
    }
  }

  process.exit(0);
}

checkData();
