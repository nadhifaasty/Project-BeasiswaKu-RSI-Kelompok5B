import { supabaseAdmin } from '../config/supabase';
import { encrypt, decrypt, maskAccountNumber } from '../utils/encryption';

export interface CreateDisbursementPayload {
  bank_name: string;
  account_no: string;
  account_holder: string;
  cabang_bank?: string;
  receipt_book_file?: string;
  ktp_file?: string;
}

class DisbursementService {
  async createDisbursement(userId: string, payload: CreateDisbursementPayload) {
    const { bank_name, account_no, account_holder, cabang_bank, receipt_book_file, ktp_file } = payload;

    if (!bank_name || !account_no || !account_holder) {
      throw new Error('Nama bank, nomor rekening, dan nama pemegang wajib diisi.');
    }

    if (!/^\d{10,16}$/.test(account_no)) {
      throw new Error('Nomor rekening hanya boleh berisi angka 10-16 digit.');
    }

    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'DITERIMA')
      .maybeSingle();

    if (appError || !app) {
      throw new Error('Hanya penerima beasiswa aktif yang dapat mengisi data pencairan.');
    }

    const { data: existing } = await supabaseAdmin
      .from('fund_disbursements')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      throw new Error('Data rekening sudah tersimpan. Gunakan endpoint edit.');
    }

    const encryptedAccountNo = encrypt(account_no);

    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .insert({
        user_id: userId,
        application_id: app.id,
        nama_bank: bank_name,
        nomor_rekening: encryptedAccountNo,
        nama_pemegang: account_holder,
        cabang_bank: cabang_bank || '',
        foto_buku_tabungan: receipt_book_file || null,
        ktp_file: ktp_file || null,
        is_verified: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal menyimpan data rekening: ${error.message}`);

    return {
      disbursement_id: data.id,
      bank_name: data.nama_bank,
      account_no_masked: maskAccountNumber(account_no),
      is_verified: data.is_verified,
    };
  }

  async getMyDisbursement(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`Gagal mengambil data pencairan: ${error.message}`);

    if (!data) return null;

    let plainAccountNo = '';
    try {
      plainAccountNo = decrypt(data.nomor_rekening);
    } catch {
      plainAccountNo = '';
    }

    return {
      disbursement_id: data.id,
      bank_name: data.nama_bank,
      account_no_masked: maskAccountNumber(plainAccountNo),
      account_holder: data.nama_pemegang,
      cabang_bank: data.cabang_bank,
      is_verified: data.is_verified,
      verified_at: data.verified_at,
      status_pencairan: data.is_verified ? 'Terverifikasi' : 'Menunggu Verifikasi',
    };
  }

  async updateDisbursement(userId: string, disbursementId: string, payload: Partial<CreateDisbursementPayload>) {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('fund_disbursements')
      .select('*')
      .eq('id', disbursementId)
      .single();

    if (fetchErr || !existing) {
      throw new Error('Data rekening tidak ditemukan.');
    }

    if (existing.user_id !== userId) {
      throw new Error('Anda tidak berhak mengubah data ini.');
    }

    if (existing.is_verified) {
      throw new Error('Data rekening yang sudah diverifikasi tidak dapat diubah.');
    }

    const updateData: Record<string, any> = {};

    if (payload.bank_name) updateData.nama_bank = payload.bank_name;
    if (payload.account_holder) updateData.nama_pemegang = payload.account_holder;
    if (payload.cabang_bank) updateData.cabang_bank = payload.cabang_bank;
    if (payload.receipt_book_file) updateData.foto_buku_tabungan = payload.receipt_book_file;
    if (payload.ktp_file) updateData.ktp_file = payload.ktp_file;

    if (payload.account_no) {
      if (!/^\d{10,16}$/.test(payload.account_no)) {
        throw new Error('Nomor rekening hanya boleh berisi angka 10-16 digit.');
      }
      updateData.nomor_rekening = encrypt(payload.account_no);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .update(updateData)
      .eq('id', disbursementId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memperbarui data rekening: ${error.message}`);

    let masked = '';
    try {
      const decrypted = decrypt(data.nomor_rekening);
      masked = maskAccountNumber(decrypted);
    } catch {
      masked = 'XXXX';
    }

    return {
      disbursement_id: data.id,
      bank_name: data.nama_bank,
      account_no_masked: masked,
      is_verified: data.is_verified,
    };
  }

  async verifyDisbursement(adminId: string, disbursementId: string, isVerified: boolean, catatan?: string) {
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('fund_disbursements')
      .select('*')
      .eq('id', disbursementId)
      .single();

    if (fetchErr || !existing) {
      throw new Error('Data rekening tidak ditemukan.');
    }

    const updateData: Record<string, any> = {
      is_verified: isVerified,
      verified_by: adminId,
      verified_at: isVerified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (catatan) updateData.catatan = catatan;

    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .update(updateData)
      .eq('id', disbursementId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memverifikasi data rekening: ${error.message}`);

    return {
      disbursement_id: data.id,
      is_verified: data.is_verified,
      verified_at: data.verified_at,
      verified_by: data.verified_by,
      catatan: data.catatan,
    };
  }

  async getBankAccountByUserId(requestorId: string, requestorRole: string, targetUserId: string) {
    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) throw new Error(`Gagal mengambil data rekening: ${error.message}`);

    if (!data) return null;

    if (requestorRole === 'siswa' && requestorId !== targetUserId) {
      throw new Error('Anda tidak berhak mengakses data rekening user lain.');
    }

    let plainAccountNo = '';
    try {
      plainAccountNo = decrypt(data.nomor_rekening);
    } catch {
      plainAccountNo = '';
    }

    return {
      disbursement_id: data.id,
      bank_name: data.nama_bank,
      account_no_masked: maskAccountNumber(plainAccountNo),
      account_holder: data.nama_pemegang,
      cabang_bank: data.cabang_bank,
      is_verified: data.is_verified,
      verified_at: data.verified_at,
    };
  }
}

export const disbursementService = new DisbursementService();
