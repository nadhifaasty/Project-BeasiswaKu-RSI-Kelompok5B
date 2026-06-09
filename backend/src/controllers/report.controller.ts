import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils';
import * as xlsx from 'xlsx';

export const exportExcel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { program_id, status, start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('applications')
      .select(`
        id,
        nomor_referensi,
        status,
        ipk,
        skor_kelayakan,
        created_at,
        profiles (
          nama_lengkap,
          nim_nisn,
          email,
          nomor_hp
        ),
        scholarship_programs (
          nama
        )
      `)
      .order('created_at', { ascending: false });

    if (program_id) {
      query = query.eq('program_id', program_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error } = await query;

    if (error) {
      sendError(res, `Gagal mengambil data pengajuan: ${error.message}`, 500);
      return;
    }

    if (!data || data.length === 0) {
      sendError(res, 'Tidak ada data pengajuan yang cocok dengan filter tersebut.', 404);
      return;
    }

    // Format data for Excel
    const excelData = data.map((item: any, index: number) => ({
      'No': index + 1,
      'Nomor Referensi': item.nomor_referensi,
      'Nama Pendaftar': item.profiles?.nama_lengkap || '-',
      'NIM/NISN': item.profiles?.nim_nisn || '-',
      'Email': item.profiles?.email || '-',
      'Nomor HP': item.profiles?.nomor_hp || '-',
      'Program Beasiswa': item.scholarship_programs?.nama || '-',
      'IPK': item.ipk,
      'Status': item.status,
      'Tanggal Pengajuan': new Date(item.created_at).toLocaleDateString('id-ID'),
    }));

    // Create workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Laporan Pengajuan');

    // Generate buffer
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `laporan_beasiswa_${dateStr}.xlsx`;

    // Send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(excelBuffer);
    
    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user!.userId,
      aksi: 'DATA_EXPORTED_EXCEL',
      resource_type: 'applications',
      created_at: new Date().toISOString(),
    });

  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
