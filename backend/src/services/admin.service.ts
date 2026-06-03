import { supabaseAdmin } from '../config/supabase';

export const getAuditLogs = async (params: any) => {
  const {
    page = 1,
    per_page = 25,
    action_type,
    user_id,
    start_date,
    end_date,
    sort_by = 'created_at',
    order = 'desc',
  } = params;

  let query = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' });

  if (action_type) query = query.eq('aksi', action_type);
  if (user_id) query = query.eq('user_id', user_id);
  if (start_date) query = query.gte('created_at', start_date);
  if (end_date) query = query.lte('created_at', end_date);

  const from = (Number(page) - 1) * Number(per_page);
  const to = from + Number(per_page) - 1;

  query = query.order(sort_by, { ascending: order === 'asc' }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data,
    meta: {
      current_page: Number(page),
      per_page: Number(per_page),
      total: count || 0,
      last_page: Math.ceil((count || 0) / Number(per_page)),
    },
  };
};

export const getEvaluations = async (programId?: string) => {
  let query = supabaseAdmin.from('scholarship_programs').select('*');
  if (programId) query = query.eq('id', programId);
  
  const { data: programs, error: progError } = await query;
  if (progError) throw new Error(progError.message);

  const results = [];
  for (const program of programs) {
    const { data: apps, error: appError } = await supabaseAdmin
      .from('applications')
      .select('status, ipk, skor_kelayakan, user_id')
      .eq('program_id', program.id);

    if (appError) throw new Error(appError.message);

    const total_pendaftar = apps.length;
    let total_diterima = 0;
    const sebaran_status: Record<string, number> = {
      PENDING: 0,
      TERVERIFIKASI: 0,
      REVISI: 0,
      DITOLAK: 0,
      DITERIMA: 0,
      CADANGAN: 0,
    };

    let total_skor = 0;
    let total_ipk = 0;
    let skor_count = 0;
    const userIds: string[] = [];

    apps.forEach((app) => {
      sebaran_status[app.status] = (sebaran_status[app.status] || 0) + 1;
      if (app.status === 'DITERIMA') total_diterima++;

      total_ipk += Number(app.ipk || 0);
      if (app.skor_kelayakan) {
        total_skor += Number(app.skor_kelayakan);
        skor_count++;
      }
      userIds.push(app.user_id);
    });

    // Fetch avg_penghasilan_ortu
    let avg_penghasilan_ortu = 0;
    if (userIds.length > 0) {
      const { data: ortuData, error: ortuError } = await supabaseAdmin
        .from('biodata_orang_tua')
        .select('ayah_penghasilan, ibu_penghasilan')
        .in('user_id', userIds);

      if (ortuError) throw new Error(ortuError.message);

      let total_penghasilan = 0;
      ortuData.forEach((ortu) => {
        total_penghasilan += Number(ortu.ayah_penghasilan || 0) + Number(ortu.ibu_penghasilan || 0);
      });
      avg_penghasilan_ortu = ortuData.length > 0 ? total_penghasilan / ortuData.length : 0;
    }

    results.push({
      program_id: program.id,
      program_name: program.nama,
      total_pendaftar,
      total_diterima,
      acceptance_rate: total_pendaftar > 0 ? (total_diterima / total_pendaftar) * 100 : 0,
      avg_skor_total: skor_count > 0 ? total_skor / skor_count : 0,
      sebaran_status,
      avg_ipk: total_pendaftar > 0 ? total_ipk / total_pendaftar : 0,
      avg_penghasilan_ortu,
    });
  }

  return results;
};
