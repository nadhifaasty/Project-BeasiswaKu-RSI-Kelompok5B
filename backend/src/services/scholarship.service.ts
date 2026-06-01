import { supabaseAdmin } from '../config/supabase';

export interface CreateApplicationPayload {
  program_id: string;
  ipk: number;
  esai_motivasi: string;
  prestasi_non_akademik?: string;
}

function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BSK-${year}${month}-${random}`;
}

export async function getPrograms() {
  const { data, error } = await supabaseAdmin
    .from('scholarship_programs').select('*').order('deadline', { ascending: true });
  if (error) throw new Error(`Gagal mengambil data program: ${error.message}`);
  return data;
}

export async function getProgramById(programId: string) {
  const { data, error } = await supabaseAdmin
    .from('scholarship_programs').select('*').eq('id', programId).single();
  if (error) throw new Error('Program tidak ditemukan.');
  return data;
}

export async function getUserApplications(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select(`*, scholarship_programs ( nama, monthly_amount, deadline, status )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Gagal mengambil data pengajuan: ${error.message}`);
  return data;
}

export async function getApplicationById(applicationId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select(`*, scholarship_programs ( nama, monthly_amount, deadline, status )`)
    .eq('id', applicationId).eq('user_id', userId).single();
  if (error) throw new Error('Pengajuan tidak ditemukan.');
  return data;
}

export async function createApplication(userId: string, payload: CreateApplicationPayload) {
  const { program_id, ipk, esai_motivasi, prestasi_non_akademik } = payload;

  const program = await getProgramById(program_id);
  if (program.status !== 'aktif') throw new Error('Program beasiswa ini sudah ditutup.');
  if (program.sisa_kuota <= 0) throw new Error('Kuota program beasiswa ini sudah penuh.');

  const { data: existing } = await supabaseAdmin
    .from('applications').select('id').eq('user_id', userId).eq('program_id', program_id).single();
  if (existing) throw new Error('Kamu sudah mengajukan beasiswa untuk program ini.');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('biodata_progress').eq('id', userId).single();
  if (!profile || profile.biodata_progress < 100) {
    throw new Error('Lengkapi biodata terlebih dahulu sebelum mengajukan beasiswa.');
  }

  const nomor_referensi = generateReferenceNumber();

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({ user_id: userId, program_id, nomor_referensi, ipk, esai_motivasi, prestasi_non_akademik: prestasi_non_akademik || null, status: 'PENDING' })
    .select().single();
  if (error) throw new Error(`Gagal membuat pengajuan: ${error.message}`);

  await supabaseAdmin.from('scholarship_programs').update({ sisa_kuota: program.sisa_kuota - 1 }).eq('id', program_id);

  return data;
}

export async function getAllApplications(status?: string) {
  let query = supabaseAdmin
    .from('applications')
    .select(`*, profiles ( nama_lengkap, nim_nisn, email ), scholarship_programs ( nama, monthly_amount )`)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`Gagal mengambil data pengajuan: ${error.message}`);
  return data;
}

export async function updateApplicationStatus(applicationId: string, status: string, catatan_admin?: string) {
  const validStatuses = ['PENDING', 'TERVERIFIKASI', 'REVISI', 'DITOLAK', 'DITERIMA', 'CADANGAN'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
  }

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status, catatan_admin: catatan_admin || null, updated_at: new Date().toISOString() })
    .eq('id', applicationId).select().single();
  if (error) throw new Error(`Gagal mengupdate status: ${error.message}`);
  return data;
}
