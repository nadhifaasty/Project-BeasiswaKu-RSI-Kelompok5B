import { supabaseAdmin } from '../config/supabase';

export type DocumentType = 'foto' | 'ktp' | 'kartu_keluarga' | 'transkrip' | 'sktm' | 'sertifikat_prestasi';

export interface UploadDocumentPayload {
  application_id: string;
  jenis: DocumentType;
  file_url: string;
}

export async function getByApplication(applicationId: string, userId: string) {
  const { data: app } = await supabaseAdmin
    .from('applications').select('id').eq('id', applicationId).eq('user_id', userId).single();
  if (!app) throw new Error('Pengajuan tidak ditemukan.');

  const { data, error } = await supabaseAdmin
    .from('application_documents').select('*').eq('application_id', applicationId).order('created_at', { ascending: true });
  if (error) throw new Error(`Gagal mengambil dokumen: ${error.message}`);
  return data;
}

export async function getUploadUrl(userId: string, applicationId: string, jenis: DocumentType, fileName: string) {
  const ext = fileName.split('.').pop() || '';
  const path = `${userId}/${applicationId}/${jenis}.${ext}`;

  const { data, error } = await supabaseAdmin.storage.from('documents').createSignedUploadUrl(path);
  if (error) throw new Error(`Gagal membuat upload URL: ${error.message}`);

  return { signedUrl: data.signedUrl, publicUrl: getPublicUrl(path), path, token: data.token };
}

export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from('documents').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveDocument(userId: string, payload: UploadDocumentPayload) {
  const { application_id, jenis, file_url } = payload;

  const { data: app } = await supabaseAdmin
    .from('applications').select('id').eq('id', application_id).eq('user_id', userId).single();
  if (!app) throw new Error('Pengajuan tidak ditemukan.');

  const { data: existing } = await supabaseAdmin
    .from('application_documents').select('id').eq('application_id', application_id).eq('jenis', jenis).single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('application_documents').update({ file_url, status: 'menunggu' }).eq('id', existing.id).select().single();
    if (error) throw new Error(`Gagal menyimpan dokumen: ${error.message}`);
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('application_documents').insert({ application_id, jenis, file_url, status: 'menunggu' }).select().single();
  if (error) throw new Error(`Gagal menyimpan dokumen: ${error.message}`);
  return data;
}

export async function updateDocumentStatus(documentId: string, status: 'tervalidasi' | 'ditolak') {
  const { data, error } = await supabaseAdmin
    .from('application_documents').update({ status }).eq('id', documentId).select().single();
  if (error) throw new Error(`Gagal mengupdate status dokumen: ${error.message}`);
  return data;
}
