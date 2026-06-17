import { supabaseAdmin } from '../config/supabase';

export interface SelectionRankItem {
  rank: number;
  application_id: string;
  full_name: string;
  nim_nisn: string;
  skor_total: number;
  skor_akademik: number;
  skor_ekonomi: number;
  skor_prestasi: number;
  skor_dokumen: number;
  status_rekomendasi: 'DITERIMA' | 'CADANGAN' | 'DITOLAK';
  application_status: string;
}

export interface SelectionWeights {
  bobot_akademik: number;
  bobot_ekonomi: number;
  bobot_prestasi: number;
  bobot_dokumen: number;
}

class SelectionService {
  /**
   * Run selection calculation for a program
   */
  async runSelection(programId: string, actorId: string, weights?: {
    bobot_akademik?: number;
    bobot_ekonomi?: number;
    bobot_prestasi?: number;
    bobot_dokumen?: number;
  }) {
    // 1. Fetch program and its quota
    const { data: program, error: progError } = await supabaseAdmin
      .from('scholarship_programs')
      .select('id, nama, kuota')
      .eq('id', programId)
      .single();

    if (progError || !program) {
      throw new Error('Program beasiswa tidak ditemukan.');
    }

    // 2. Fetch all applications of this program with status = 'TERVERIFIKASI'
    const { data: apps, error: appsError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        user_id,
        ipk,
        esai_motivasi,
        prestasi_non_akademik,
        profiles (
          nama_lengkap,
          nim_nisn
        )
      `)
      .eq('program_id', programId)
      .eq('status', 'TERVERIFIKASI');

    if (appsError) {
      throw new Error(`Gagal mengambil data pengajuan: ${appsError.message}`);
    }

    if (!apps || apps.length === 0) {
      throw new Error('Tidak ada pengajuan berstatus TERVERIFIKASI untuk program ini.');
    }

    // 3. For each application, retrieve sub-criteria data and compute scores in parallel
    const calculatedResults = await Promise.all(apps.map(async (app) => {
      const userId = app.user_id;

      // Fetch sub-criteria data in parallel for this candidate
      const [acadRes, ortuRes, docsRes] = await Promise.all([
        supabaseAdmin
          .from('biodata_akademik')
          .select('ipk_nilai, jenjang')
          .eq('user_id', userId)
          .maybeSingle(),
        supabaseAdmin
          .from('biodata_orang_tua')
          .select('ayah_penghasilan, ibu_penghasilan')
          .eq('user_id', userId)
          .maybeSingle(),
        supabaseAdmin
          .from('application_documents')
          .select('id')
          .eq('application_id', app.id)
          .eq('status', 'tervalidasi')
      ]);

      const acad = acadRes.data;
      const ortu = ortuRes.data;
      const docs = docsRes.data;

      // a. Academic Score (SA)
      const ipk = acad?.ipk_nilai ? Number(acad.ipk_nilai) : Number(app.ipk || 0);
      const jenjang = acad?.jenjang || '';
      const isCollege = jenjang.toLowerCase().includes('perguruan') || jenjang.toUpperCase() === 'PERGURUAN_TINGGI';
      const skor_akademik = isCollege 
        ? Math.min(Math.max((ipk / 4.0) * 100, 0), 100)
        : Math.min(Math.max(ipk, 0), 100);

      // b. Economic Score (SE)
      const totalPenghasilan = Number(ortu?.ayah_penghasilan || 0) + Number(ortu?.ibu_penghasilan || 0);
      let skor_ekonomi = 20; // Default fallback
      if (totalPenghasilan <= 1500000) {
        skor_ekonomi = 100;
      } else if (totalPenghasilan <= 3000000) {
        skor_ekonomi = 80;
      } else if (totalPenghasilan <= 5000000) {
        skor_ekonomi = 60;
      } else if (totalPenghasilan <= 7500000) {
        skor_ekonomi = 40;
      }

      // c. Achievement Score (SP)
      const prestasiText = app.prestasi_non_akademik || '';
      let skor_prestasi = 0;
      if (prestasiText.trim().length > 0) {
        const textLower = prestasiText.toLowerCase();
        if (textLower.includes('nasional')) {
          skor_prestasi = 100;
        } else if (textLower.includes('provinsi')) {
          skor_prestasi = 90;
        } else if (textLower.includes('kota') || textLower.includes('kabupaten')) {
          skor_prestasi = 80;
        } else {
          skor_prestasi = 70;
        }
      }

      // d. Document Score (SD)
      const validDocsCount = docs ? docs.length : 0;
      const skor_dokumen = Math.min((validDocsCount / 5.0) * 100, 100);

      // e. Total Score (skor_total)
      const WA = (weights?.bobot_akademik !== undefined ? weights.bobot_akademik : 40) / 100.0;
      const WE = (weights?.bobot_ekonomi !== undefined ? weights.bobot_ekonomi : 35) / 100.0;
      const WP = (weights?.bobot_prestasi !== undefined ? weights.bobot_prestasi : 15) / 100.0;
      const WD = (weights?.bobot_dokumen !== undefined ? weights.bobot_dokumen : 10) / 100.0;

      const skor_total = (skor_akademik * WA) + (skor_ekonomi * WE) + (skor_prestasi * WP) + (skor_dokumen * WD);

      return {
        application_id: app.id,
        profile: app.profiles,
        skor_akademik,
        skor_ekonomi,
        skor_prestasi,
        skor_dokumen,
        skor_total,
      };
    }));

    // 4. Sort results by skor_total descending to assign ranking
    calculatedResults.sort((a, b) => b.skor_total - a.skor_total);

    const quota = program.kuota || 50;
    // 20% of quota for reserve/cadangan (min 2)
    const reserveLimit = Math.max(Math.floor(quota * 0.2), 2);

    const dbPayloads: any[] = [];
    const rankingList: SelectionRankItem[] = [];

    for (let index = 0; index < calculatedResults.length; index++) {
      const item = calculatedResults[index];
      const rank = index + 1;

      // Assign status recommendation
      let status_rekomendasi: 'DITERIMA' | 'CADANGAN' | 'DITOLAK' = 'DITOLAK';
      if (rank <= quota) {
        status_rekomendasi = 'DITERIMA';
      } else if (rank <= quota + reserveLimit) {
        status_rekomendasi = 'CADANGAN';
      }

      rankingList.push({
        rank,
        application_id: item.application_id,
        full_name: (item.profile as any)?.nama_lengkap || 'Siswa',
        nim_nisn: (item.profile as any)?.nim_nisn || '-',
        skor_total: item.skor_total,
        skor_akademik: item.skor_akademik,
        skor_ekonomi: item.skor_ekonomi,
        skor_prestasi: item.skor_prestasi,
        skor_dokumen: item.skor_dokumen,
        status_rekomendasi,
        application_status: 'TERVERIFIKASI',
      });

      dbPayloads.push({
        application_id: item.application_id,
        skor_akademik: item.skor_akademik,
        skor_ekonomi: item.skor_ekonomi,
        skor_prestasi: item.skor_prestasi,
        skor_dokumen: item.skor_dokumen,
        skor_total: item.skor_total,
        hasil: status_rekomendasi,
        created_at: new Date().toISOString(),
      });
    }

    // 5. Bulk Upsert selection results to the database
    const { error: upsertError } = await supabaseAdmin
      .from('selection_results')
      .upsert(dbPayloads, { onConflict: 'application_id' });

    if (upsertError) {
      throw new Error(`Gagal menyimpan hasil seleksi: ${upsertError.message}`);
    }



    return {
      program_id: programId,
      program_name: program.nama,
      total_candidates: calculatedResults.length,
      ranking: rankingList,
    };
  }

  /**
   * Get calculation results for a program
   */
  async getSelectionResults(programId: string) {
    // We join applications and profiles and selection_results
    const { data: results, error } = await supabaseAdmin
      .from('selection_results')
      .select(`
        *,
        applications!inner (
          id,
          nomor_referensi,
          program_id,
          status,
          profiles (
            nama_lengkap,
            nim_nisn
          )
        )
      `)
      .eq('applications.program_id', programId)
      .order('skor_total', { ascending: false });

    if (error) {
      throw new Error(`Gagal mengambil hasil seleksi: ${error.message}`);
    }

    // Check if selection is already finalized/ratified (if disahkan_at is not null in any record)
    const isFinalized = results.length > 0 && results.some((r) => r.disahkan_at !== null);

    const ranking = results.map((r, i) => ({
      rank: i + 1,
      application_id: r.application_id,
      full_name: (r.applications?.profiles as any)?.nama_lengkap || 'Siswa',
      nim_nisn: (r.applications?.profiles as any)?.nim_nisn || '-',
      skor_total: Number(r.skor_total),
      skor_akademik: Number(r.skor_akademik),
      skor_ekonomi: Number(r.skor_ekonomi),
      skor_prestasi: Number(r.skor_prestasi),
      skor_dokumen: Number(r.skor_dokumen),
      status_rekomendasi: r.hasil as 'DITERIMA' | 'CADANGAN' | 'DITOLAK',
      application_status: (r.applications as any)?.status || 'TERVERIFIKASI',
      disahkan_at: r.disahkan_at,
    }));

    return {
      program_id: programId,
      is_finalized: isFinalized,
      ranking,
    };
  }

  /**
   * Finalize and ratify selection results (Day 3)
   */
  async finalizeSelection(programId: string, actorId: string) {
    const { data: results, error } = await supabaseAdmin
      .from('selection_results')
      .select(`
        *,
        applications!inner (
          id,
          program_id,
          user_id
        )
      `)
      .eq('applications.program_id', programId);

    if (error || !results || results.length === 0) {
      throw new Error('Hasil seleksi belum dikalkulasi. Jalankan kalkulasi terlebih dahulu.');
    }

    const disahkan_at = new Date().toISOString();

    // 1. Update selection_results to set disahkan_oleh and disahkan_at
    const { error: updResultError } = await supabaseAdmin
      .from('selection_results')
      .update({
        disahkan_oleh: actorId,
        disahkan_at,
      })
      .in('application_id', results.map((r) => r.application_id));

    if (updResultError) {
      throw new Error(`Gagal mengesahkan hasil: ${updResultError.message}`);
    }

    // 2. Update the status of applications in bulk to match selection results ('DITERIMA', 'CADANGAN', 'DITOLAK')
    for (const r of results) {
      const { error: updAppError } = await supabaseAdmin
        .from('applications')
        .update({
          status: r.hasil,
          updated_at: disahkan_at,
        })
        .eq('id', r.application_id);

      if (updAppError) {
        throw new Error(`Gagal mengupdate status pendaftar: ${updAppError.message}`);
      }
    }



    return {
      success: true,
      message: 'Hasil seleksi berhasil disahkan dan bersifat final.',
      finalized_at: disahkan_at,
    };
  }

  /**
   * Rollback finalized selection results
   */
  async rollbackSelection(programId: string, actorId: string) {
    const { data: results, error } = await supabaseAdmin
      .from('selection_results')
      .select(`
        *,
        applications!inner (
          id,
          program_id,
          user_id
        )
      `)
      .eq('applications.program_id', programId);

    if (error || !results || results.length === 0) {
      throw new Error('Hasil seleksi belum dikalkulasi.');
    }

    const isFinalized = results.some((r) => r.disahkan_at !== null);
    if (!isFinalized) {
      throw new Error('Hasil seleksi belum disahkan. Tidak perlu dibatalkan.');
    }

    // 1. Update selection_results to set disahkan_oleh and disahkan_at to null
    const { error: updResultError } = await supabaseAdmin
      .from('selection_results')
      .update({
        disahkan_oleh: null,
        disahkan_at: null,
      })
      .in('application_id', results.map((r) => r.application_id));

    if (updResultError) {
      throw new Error(`Gagal membatalkan pengesahan: ${updResultError.message}`);
    }

    // 2. Revert the status of applications back to 'TERVERIFIKASI'
    for (const r of results) {
      const { error: updAppError } = await supabaseAdmin
        .from('applications')
        .update({
          status: 'TERVERIFIKASI',
          updated_at: new Date().toISOString(),
        })
        .eq('id', r.application_id);

      if (updAppError) {
        throw new Error(`Gagal mengembalikan status pendaftar: ${updAppError.message}`);
      }
    }



    return {
      success: true,
      message: 'Pengesahan hasil seleksi berhasil dibatalkan dan status kembali menjadi TERVERIFIKASI.',
    };
  }

  /**
   * Update selection weights for a program
   */
  async updateWeights(programId: string, actorId: string, weights: SelectionWeights) {
    const total = weights.bobot_akademik + weights.bobot_ekonomi + weights.bobot_prestasi + weights.bobot_dokumen;
    if (total !== 100) {
      throw new Error('Total keempat bobot harus berjumlah tepat 100%.');
    }

    // Check if selection results already exist and finalized
    const { data: results, error: resError } = await supabaseAdmin
      .from('selection_results')
      .select('disahkan_at, applications!inner(program_id)')
      .eq('applications.program_id', programId)
      .not('disahkan_at', 'is', null)
      .limit(1);
    
    if (results && results.length > 0) {
      throw new Error('Seleksi sudah disahkan. Bobot tidak dapat diubah.');
    }

    const { error: upsertError } = await supabaseAdmin
      .from('selection_weights')
      .upsert({
        program_id: programId,
        bobot_akademik: weights.bobot_akademik,
        bobot_ekonomi: weights.bobot_ekonomi,
        bobot_prestasi: weights.bobot_prestasi,
        bobot_dokumen: weights.bobot_dokumen,
        updated_at: new Date().toISOString()
      }, { onConflict: 'program_id' });

    if (upsertError) {
      throw new Error(`Gagal menyimpan bobot seleksi: ${upsertError.message}`);
    }



    return {
      program_id: programId,
      ...weights
    };
  }
}

export const selectionService = new SelectionService();
