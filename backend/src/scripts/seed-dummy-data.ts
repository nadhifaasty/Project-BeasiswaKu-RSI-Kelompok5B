import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

// ============ DUMMY DATA DEFINITIONS ============

interface DummyStudent {
  nama: string;
  nim: string;
  hp: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tempat_lahir: string;
  kota: string;
  provinsi: string;
  jenjang: string;
  institusi: string;
  prodi: string;
  ipk: number;
  status: 'PENDING' | 'TERVERIFIKASI' | 'REVISI' | 'DITOLAK' | 'DITERIMA' | 'CADANGAN';
  // index program: 0 = Beasiswa SMA, 1 = Beasiswa Perguruan Tinggi
  programIndex: number;
}

const students: DummyStudent[] = [
  { nama: 'Budi Santoso', nim: '2021001', hp: '081200000001', jenis_kelamin: 'Laki-laki', tempat_lahir: 'Surakarta', kota: 'Surakarta', provinsi: 'Jawa Tengah', jenjang: 'Perguruan Tinggi', institusi: 'Universitas Sebelas Maret', prodi: 'Informatika', ipk: 3.75, status: 'PENDING', programIndex: 1 },
  { nama: 'Ani Wijaya', nim: '2021002', hp: '081200000002', jenis_kelamin: 'Perempuan', tempat_lahir: 'Yogyakarta', kota: 'Yogyakarta', provinsi: 'DI Yogyakarta', jenjang: 'SMA/SMK/MA', institusi: 'SMA Negeri 1 Yogyakarta', prodi: 'IPA', ipk: 3.90, status: 'TERVERIFIKASI', programIndex: 0 },
  { nama: 'Citra Lestari', nim: '2021003', hp: '081200000003', jenis_kelamin: 'Perempuan', tempat_lahir: 'Bandung', kota: 'Bandung', provinsi: 'Jawa Barat', jenjang: 'Perguruan Tinggi', institusi: 'Institut Teknologi Bandung', prodi: 'Teknik Elektro', ipk: 3.60, status: 'TERVERIFIKASI', programIndex: 1 },
  { nama: 'Dedi Kurniawan', nim: '2021004', hp: '081200000004', jenis_kelamin: 'Laki-laki', tempat_lahir: 'Semarang', kota: 'Semarang', provinsi: 'Jawa Tengah', jenjang: 'SMA/SMK/MA', institusi: 'SMK Negeri 2 Semarang', prodi: 'TKJ', ipk: 3.40, status: 'REVISI', programIndex: 0 },
  { nama: 'Eka Putri', nim: '2021005', hp: '081200000005', jenis_kelamin: 'Perempuan', tempat_lahir: 'Jakarta', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', jenjang: 'Perguruan Tinggi', institusi: 'Universitas Indonesia', prodi: 'Akuntansi', ipk: 3.85, status: 'DITERIMA', programIndex: 1 },
  { nama: 'Fajar Ramadhan', nim: '2021006', hp: '081200000006', jenis_kelamin: 'Laki-laki', tempat_lahir: 'Surabaya', kota: 'Surabaya', provinsi: 'Jawa Timur', jenjang: 'Perguruan Tinggi', institusi: 'Institut Teknologi Sepuluh Nopember', prodi: 'Teknik Mesin', ipk: 3.20, status: 'DITOLAK', programIndex: 1 },
  { nama: 'Gita Permata', nim: '2021007', hp: '081200000007', jenis_kelamin: 'Perempuan', tempat_lahir: 'Medan', kota: 'Medan', provinsi: 'Sumatera Utara', jenjang: 'SMA/SMK/MA', institusi: 'SMA Negeri 3 Medan', prodi: 'IPS', ipk: 3.70, status: 'DITERIMA', programIndex: 0 },
  { nama: 'Hadi Nugroho', nim: '2021008', hp: '081200000008', jenis_kelamin: 'Laki-laki', tempat_lahir: 'Malang', kota: 'Malang', provinsi: 'Jawa Timur', jenjang: 'Perguruan Tinggi', institusi: 'Universitas Brawijaya', prodi: 'Ilmu Hukum', ipk: 3.50, status: 'CADANGAN', programIndex: 1 },
  { nama: 'Indah Sari', nim: '2021009', hp: '081200000009', jenis_kelamin: 'Perempuan', tempat_lahir: 'Bogor', kota: 'Bogor', provinsi: 'Jawa Barat', jenjang: 'Perguruan Tinggi', institusi: 'Institut Pertanian Bogor', prodi: 'Agribisnis', ipk: 3.95, status: 'PENDING', programIndex: 1 },
  { nama: 'Joko Prasetyo', nim: '2021010', hp: '081200000010', jenis_kelamin: 'Laki-laki', tempat_lahir: 'Solo', kota: 'Surakarta', provinsi: 'Jawa Tengah', jenjang: 'SMA/SMK/MA', institusi: 'SMA Negeri 4 Surakarta', prodi: 'IPA', ipk: 3.55, status: 'TERVERIFIKASI', programIndex: 0 },
];

function genRef(): string {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BSK-${ym}-${rand}`;
}

function emailFor(nim: string): string {
  return `dummy${nim}@beasiswaku.test`;
}

async function seed() {
  console.log('🌱 Seeding 10 data dummy (siswa + biodata + pengajuan)...\n');

  // 1. Ambil program beasiswa yang ada
  const { data: programs, error: progErr } = await supabaseAdmin
    .from('scholarship_programs')
    .select('id, nama, sisa_kuota')
    .order('created_at', { ascending: true });

  if (progErr || !programs || programs.length === 0) {
    console.error('❌ Tidak ada program beasiswa. Jalankan schema.sql + seed program dulu.');
    process.exit(1);
  }

  console.log(`📋 Program ditemukan: ${programs.map((p) => p.nama).join(', ')}\n`);

  let successCount = 0;

  for (const s of students) {
    const email = emailFor(s.nim);
    try {
      // ---- 1. Buat user di Supabase Auth ----
      let userId: string;
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { nama_lengkap: s.nama, nim_nisn: s.nim, nomor_hp: s.hp },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          // ambil user id existing
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const existing = list?.users.find((u) => u.email === email);
          if (!existing) {
            console.log(`⏭️  ${s.nama} - sudah ada tapi tidak ditemukan, skip.`);
            continue;
          }
          userId = existing.id;
        } else {
          throw authError;
        }
      } else {
        userId = authData.user.id;
      }

      // ---- 2. Upsert profile ----
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        nama_lengkap: s.nama,
        nim_nisn: s.nim,
        nomor_hp: s.hp,
        email,
        role: 'siswa',
        biodata_progress: 100, // semua biodata lengkap
      }, { onConflict: 'id' });

      // ---- 3. Biodata lengkap (4 bagian) ----
      await supabaseAdmin.from('biodata_pribadi').upsert({
        user_id: userId, nama_lengkap: s.nama, nim_nisn: s.nim, email, nomor_hp: s.hp,
        tempat_lahir: s.tempat_lahir, tanggal_lahir: '2003-05-15',
        jenis_kelamin: s.jenis_kelamin, agama: 'Islam',
      }, { onConflict: 'user_id' });

      await supabaseAdmin.from('biodata_alamat').upsert({
        user_id: userId, alamat: `Jl. Merdeka No. ${s.nim.slice(-2)}`, rt_rw: '001/002',
        kelurahan: 'Sukamaju', provinsi: s.provinsi, kota: s.kota,
        kecamatan: 'Tengah', kode_pos: '50100',
      }, { onConflict: 'user_id' });

      await supabaseAdmin.from('biodata_orang_tua').upsert({
        user_id: userId, ayah_nama: `Bapak ${s.nama.split(' ')[0]}`, ayah_pekerjaan: 'Wiraswasta',
        ayah_penghasilan: 3000000, ibu_nama: `Ibu ${s.nama.split(' ')[0]}`,
        ibu_pekerjaan: 'Ibu Rumah Tangga', ibu_penghasilan: 0,
      }, { onConflict: 'user_id' });

      await supabaseAdmin.from('biodata_akademik').upsert({
        user_id: userId, jenjang: s.jenjang, asal_institusi: s.institusi,
        program_studi: s.prodi, ipk_nilai: s.ipk,
      }, { onConflict: 'user_id' });

      // ---- 4. Pengajuan beasiswa ----
      const program = programs[s.programIndex] || programs[0];

      // cek apakah sudah ada pengajuan
      const { data: existingApp } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('user_id', userId)
        .eq('program_id', program.id)
        .single();

      if (!existingApp) {
        await supabaseAdmin.from('applications').insert({
          user_id: userId,
          program_id: program.id,
          nomor_referensi: genRef(),
          ipk: s.ipk,
          esai_motivasi: `Saya ${s.nama} sangat membutuhkan beasiswa ini untuk melanjutkan pendidikan saya di ${s.institusi}. Dengan kondisi ekonomi keluarga yang terbatas, beasiswa ini akan sangat membantu saya meraih cita-cita dan berkontribusi bagi masyarakat di masa depan.`,
          prestasi_non_akademik: 'Juara 2 lomba debat tingkat provinsi',
          status: s.status,
          catatan_admin: s.status === 'REVISI' ? 'Mohon lengkapi dokumen transkrip nilai.' : null,
        });
      }

      console.log(`✅ ${s.nama} (${s.nim}) - ${program.nama} - status: ${s.status}`);
      successCount++;
    } catch (err: any) {
      console.error(`❌ ${s.nama} - ${err.message}`);
    }
  }

  console.log(`\n🎉 Selesai! ${successCount}/${students.length} data dummy berhasil dibuat.`);
  console.log('\n📊 Ringkasan status pengajuan:');
  const statusCount: Record<string, number> = {};
  students.forEach((s) => { statusCount[s.status] = (statusCount[s.status] || 0) + 1; });
  Object.entries(statusCount).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

  console.log('\n💡 Login dummy: dummy<NIM>@beasiswaku.test / password123');
  console.log('   Contoh: dummy2021001@beasiswaku.test');

  process.exit(0);
}

seed();
