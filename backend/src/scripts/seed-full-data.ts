import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function seed() {
  console.log('🌱 Seeding fully-featured testing dataset...\n');

  // Clean up old reports and selections to ensure clean E2E testing
  console.log('🧹 Clearing old database records...');
  await supabaseAdmin.from('fund_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('selection_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('scholarship_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 1. Create two scholarship programs: SMA and Perguruan Tinggi (50 quota each)
  console.log('➕ Membuat program beasiswa beasiswaku default...');
  const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

  const { data: smaProg, error: createSmaErr } = await supabaseAdmin
    .from('scholarship_programs')
    .insert({
      nama: 'Beasiswa SMA',
      monthly_amount: 750000,
      kuota: 50,
      sisa_kuota: 50,
      deadline: futureDeadline,
      status: 'aktif',
      deskripsi: 'Diperuntukkan bagi siswa aktif SMA/SMK/MA sederajat. Berbasis kelayakan akademik dan kondisi ekonomi keluarga.',
    })
    .select()
    .single();

  if (createSmaErr) {
    console.error('❌ Gagal membuat program SMA:', createSmaErr.message);
    process.exit(1);
  }

  const { data: collegeProg, error: createCollegeErr } = await supabaseAdmin
    .from('scholarship_programs')
    .insert({
      nama: 'Beasiswa Perguruan Tinggi',
      monthly_amount: 1000000,
      kuota: 50,
      sisa_kuota: 50,
      deadline: futureDeadline,
      status: 'aktif',
      deskripsi: 'Diperuntukkan bagi mahasiswa aktif S1/D3/D4 di PTN maupun PTS. Berbasis IPK dan kondisi ekonomi.',
    })
    .select()
    .single();

  if (createCollegeErr) {
    console.error('❌ Gagal membuat program Perguruan Tinggi:', createCollegeErr.message);
    process.exit(1);
  }

  const smaProgramId = smaProg.id;
  const collegeProgramId = collegeProg.id;
  console.log(`✅ Program SMA dibuat dengan ID: ${smaProgramId}`);
  console.log(`✅ Program Perguruan Tinggi dibuat dengan ID: ${collegeProgramId}`);

  // 2. Define 12 Student Accounts (6 College, 6 SMA)
  const students = [
    // College Students
    { email: 'ani@test.com', name: 'Ani Lestari', nisn: 'NISN0001', ipk: 3.85, income: 1200000, status: 'TERVERIFIKASI', prestasi: 'Juara 1 Debat Nasional', type: 'COLLEGE' },
    { email: 'bambang@test.com', name: 'Bambang Pamungkas', nisn: 'NISN0002', ipk: 3.45, income: 2500000, status: 'TERVERIFIKASI', prestasi: 'Pemain Terbaik Futsal Provinsi', type: 'COLLEGE' },
    { email: 'citra@test.com', name: 'Citra Dewi', nisn: 'NISN0003', ipk: 3.92, income: 4800000, status: 'TERVERIFIKASI', prestasi: 'Juara 2 OSN Kimia Kabupaten', type: 'COLLEGE' },
    { email: 'hendra@test.com', name: 'Hendra Wijaya', nisn: 'NISN0008', ipk: 3.98, income: 1800000, status: 'TERVERIFIKASI', prestasi: 'Ketua BEM Fakultas', type: 'COLLEGE' },
    { email: 'indah@test.com', name: 'Indah Permata', nisn: 'NISN0009', ipk: 3.52, income: 2200000, status: 'TERVERIFIKASI', prestasi: '', type: 'COLLEGE' },
    { email: 'joko@test.com', name: 'Joko Widodo', nisn: 'NISN0010', ipk: 3.71, income: 1400000, status: 'TERVERIFIKASI', prestasi: '', type: 'COLLEGE' },

    // SMA Students
    { email: 'doni@test.com', name: 'Doni Salman', nisn: 'NISN0004', ipk: 85.00, income: 1500000, status: 'TERVERIFIKASI', prestasi: '', type: 'SMA' },
    { email: 'elisa@test.com', name: 'Elisa Fitri', nisn: 'NISN0005', ipk: 92.50, income: 3200000, status: 'TERVERIFIKASI', prestasi: 'Juara Rektor Cup Bulutangkis', type: 'SMA' },
    { email: 'fajar@test.com', name: 'Fajar Pratama', nisn: 'NISN0006', ipk: 78.00, income: 1000000, status: 'TERVERIFIKASI', prestasi: '', type: 'SMA' },
    { email: 'gina@test.com', name: 'Gina Salsabila', nisn: 'NISN0007', ipk: 88.00, income: 6000000, status: 'TERVERIFIKASI', prestasi: 'Juara Lomba Menulis Provinsi', type: 'SMA' },
    { email: 'kartika@test.com', name: 'Kartika Sari', nisn: 'NISN0011', ipk: 95.00, income: 3000000, status: 'PENDING', prestasi: '', type: 'SMA' },
    { email: 'lukman@test.com', name: 'Lukman Hakim', nisn: 'NISN0012', ipk: 80.00, income: 7500000, status: 'REVISI', prestasi: '', type: 'SMA' },
  ];

  for (const stud of students) {
    try {
      console.log(`\n⏳ Memproses seeder untuk siswa: ${stud.email}...`);
      const targetProgramId = stud.type === 'COLLEGE' ? collegeProgramId : smaProgramId;

      // a. Create in Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: stud.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          nama_lengkap: stud.name,
          nim_nisn: stud.nisn,
          nomor_hp: '0812' + Math.floor(10000000 + Math.random() * 90000000),
        },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⏭️  Siswa ${stud.email} sudah terdaftar, lanjut seeding sub-criteria.`);
          // If already registered, fetch profile to retrieve id
          const { data: existingProf } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', stud.email)
            .single();
          
          if (existingProf) {
            await insertSubCriteriaAndApplication(existingProf.id, stud, targetProgramId);
          }
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;

      // b. Insert profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          nama_lengkap: stud.name,
          nim_nisn: stud.nisn,
          nomor_hp: authData.user.user_metadata.nomor_hp,
          email: stud.email,
          role: 'siswa',
          biodata_progress: 100,
        });

      if (profileError) {
        console.error(`❌ Profile error for ${stud.email}:`, profileError.message);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        continue;
      }

      await insertSubCriteriaAndApplication(userId, stud, targetProgramId);
      console.log(`✅ Sukses seeding ${stud.name}`);

    } catch (err: any) {
      console.error(`❌ Terjadi kesalahan pada ${stud.email}:`, err.message);
    }
  }

  console.log('\n🎉 Seluruh seeding dataset demo selesai!');
  process.exit(0);
}

async function insertSubCriteriaAndApplication(userId: string, stud: any, programId: string) {
  // 1. Insert/Upsert biodata_pribadi
  await supabaseAdmin.from('biodata_pribadi').upsert({
    user_id: userId,
    nama_lengkap: stud.name,
    nim_nisn: stud.nisn,
    email: stud.email,
    nomor_hp: '0812345678',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2004-05-15',
    jenis_kelamin: 'Laki-laki',
  }, { onConflict: 'user_id' });

  // 2. Insert/Upsert biodata_alamat
  await supabaseAdmin.from('biodata_alamat').upsert({
    user_id: userId,
    alamat: 'Jl. Pemuda No. 12',
    rt_rw: '02/05',
    kelurahan: 'Rawamangun',
    kecamatan: 'Pulo Gadung',
    kota: 'Jakarta Timur',
    provinsi: 'DKI Jakarta',
    kode_pos: '13220',
  }, { onConflict: 'user_id' });

  // 3. Insert/Upsert biodata_akademik
  await supabaseAdmin.from('biodata_akademik').upsert({
    user_id: userId,
    jenjang: stud.type === 'COLLEGE' ? 'PERGURUAN_TINGGI' : 'SMA/SMK/MA',
    asal_institusi: stud.type === 'COLLEGE' ? 'Universitas Indonesia' : 'SMA Negeri 1 Jakarta',
    program_studi: stud.type === 'COLLEGE' ? 'Ilmu Komputer' : 'IPA',
    ipk_nilai: stud.ipk,
  }, { onConflict: 'user_id' });

  // 4. Insert/Upsert biodata_orang_tua
  await supabaseAdmin.from('biodata_orang_tua').upsert({
    user_id: userId,
    ayah_nama: 'Sumarjo',
    ayah_pekerjaan: 'Buruh',
    ayah_penghasilan: stud.income,
    ibu_nama: 'Sumiati',
    ibu_pekerjaan: 'Ibu Rumah Tangga',
    ibu_penghasilan: 0,
  }, { onConflict: 'user_id' });

  // 5. Insert/Upsert Application
  // Check if application exists
  const { data: existingApp } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .single();

  let appId = '';
  if (existingApp) {
    appId = existingApp.id;
    await supabaseAdmin
      .from('applications')
      .update({
        status: stud.status,
        ipk: stud.ipk,
        esai_motivasi: 'Motivasi saya mengikuti beasiswa ini adalah untuk meringankan beban orang tua saya dalam membiayai kuliah. Saya adalah mahasiswa yang aktif berorganisasi dan berprestasi...',
        prestasi_non_akademik: stud.prestasi,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId);
  } else {
    const { data: newApp, error: appErr } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: userId,
        program_id: programId,
        status: stud.status,
        ipk: stud.ipk,
        esai_motivasi: 'Motivasi saya mengikuti beasiswa ini adalah untuk meringankan beban orang tua saya dalam membiayai kuliah. Saya adalah mahasiswa yang aktif berorganisasi dan berprestasi...',
        prestasi_non_akademik: stud.prestasi,
        nomor_referensi: 'BEA-2026-' + Math.floor(100000 + Math.random() * 900000),
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random created_at over the last 90 days for trends
      })
      .select()
      .single();
    
    if (appErr) throw appErr;
    appId = newApp.id;
  }

  // 6. Seed Application Documents for Valid Document Scores
  // 5 mandatory documents: foto, ktp, kartu_keluarga, transkrip, sktm
  const docTypes = ['foto', 'ktp', 'kartu_keluarga', 'transkrip', 'sktm'];
  
  for (const docType of docTypes) {
    const { data: existingDoc } = await supabaseAdmin
      .from('application_documents')
      .select('id')
      .eq('application_id', appId)
      .eq('jenis', docType)
      .single();

    if (!existingDoc) {
      const { error: insErr } = await supabaseAdmin.from('application_documents').insert({
        application_id: appId,
        jenis: docType,
        file_url: `https://storage.beasiswaku.com/documents/${appId}/${docType}.pdf`,
        status: 'tervalidasi',
      });
      if (insErr) {
        console.error(`❌ Gagal seed document ${docType}:`, insErr.message);
      }
    } else {
      await supabaseAdmin
        .from('application_documents')
        .update({ status: 'tervalidasi' })
        .eq('id', existingDoc.id);
    }
  }
}

seed();
