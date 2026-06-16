import { supabaseAdmin } from '../config/supabase';

class DashboardService {
  /**
   * Get Super Admin Dashboard Metrics
   */
  async getSuperAdminMetrics() {
    // 1. Fetch total applications count
    const { count: totalApps, error: errTotal } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true });

    if (errTotal) throw new Error(`Gagal mengambil data total pendaftar: ${errTotal.message}`);

    // 2. Fetch total accepted applications count
    const { data: acceptedApps, error: errAccepted } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        scholarship_programs (
          monthly_amount
        )
      `)
      .eq('status', 'DITERIMA');

    if (errAccepted) throw new Error(`Gagal mengambil data penerima: ${errAccepted.message}`);

    const totalAcceptedCount = acceptedApps ? acceptedApps.length : 0;

    // Calculate total funds disbursed: sum of monthly_amount for all accepted applications
    let totalFundsDisbursed = 0;
    acceptedApps?.forEach((app: any) => {
      if (app.scholarship_programs) {
        // Strip non-digit characters if monthly_amount is a string or number
        const nominalStr = String(app.scholarship_programs.monthly_amount || '0');
        const nominalVal = Number(nominalStr.replace(/\D/g, ''));
        totalFundsDisbursed += nominalVal;
      }
    });

    // 3. Fetch total verified applications count
    const { count: totalVerified, error: errVerified } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'TERVERIFIKASI');

    if (errVerified) throw new Error(`Gagal mengambil data terverifikasi: ${errVerified.message}`);

    // 4. Fetch total active programs count
    const todayStr = new Date().toISOString().split('T')[0];
    const { count: totalPrograms, error: errProgs } = await supabaseAdmin
      .from('scholarship_programs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')
      .gte('deadline', todayStr);

    if (errProgs) throw new Error(`Gagal mengambil data program: ${errProgs.message}`);

    // Calculate acceptance rate
    const totalAppsVal = totalApps || 0;
    const acceptanceRate = totalAppsVal > 0 ? (totalAcceptedCount / totalAppsVal) * 100 : 0;

    // Get monthly application registration trends (simulation/grouping by month)
    const { data: appDates } = await supabaseAdmin
      .from('applications')
      .select('created_at');
    
    const monthlyTrends: Record<string, number> = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'Mei': 0, 'Jun': 0,
      'Jul': 0, 'Agt': 0, 'Sep': 0, 'Okt': 0, 'Nov': 0, 'Des': 0
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    appDates?.forEach((app) => {
      if (app.created_at) {
        const d = new Date(app.created_at);
        const m = monthNames[d.getMonth()];
        monthlyTrends[m] = (monthlyTrends[m] || 0) + 1;
      }
    });

    return {
      kpis: {
        total_applications: totalAppsVal,
        total_accepted: totalAcceptedCount,
        total_verified: totalVerified || 0,
        total_programs: totalPrograms || 0,
        total_funds_disbursed: totalFundsDisbursed,
        acceptance_rate: Number(acceptanceRate.toFixed(1))
      },
      trends: Object.keys(monthlyTrends).map(key => ({
        month: key,
        count: monthlyTrends[key]
      }))
    };
  }

  async getMonitoringMetrics(tahunAjaran?: string, semester?: string) {
    const { count: totalPendaftar, error: err1 } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true });
    if (err1) throw new Error(`Gagal mengambil data pendaftar: ${err1.message}`);

    const { count: totalPenerima, error: err2 } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'DITERIMA');
    if (err2) throw new Error(`Gagal mengambil data penerima: ${err2.message}`);

    const { data: acceptedWithProgram } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        scholarship_programs (
          monthly_amount
        )
      `)
      .eq('status', 'DITERIMA');

    let akumulasiDanaCair = 0;
    acceptedWithProgram?.forEach((app: any) => {
      if (app.scholarship_programs) {
        const nominalStr = String(app.scholarship_programs.monthly_amount || '0');
        const nominalVal = Number(nominalStr.replace(/\D/g, ''));
        akumulasiDanaCair += nominalVal;
      }
    });

    const totalPendaftarVal = totalPendaftar || 0;
    const totalPenerimaVal = totalPenerima || 0;
    const successRate = totalPendaftarVal > 0 ? (totalPenerimaVal / totalPendaftarVal) * 100 : 0;

    const { data: appsData } = await supabaseAdmin
      .from('applications')
      .select('user_id')
      .not('status', 'eq', 'DRAFT');

    const institusiCount: Record<string, number> = {};

    if (appsData && appsData.length > 0) {
      const userIds = appsData.map((app) => app.user_id).filter(Boolean);
      
      const { data: akademikData } = await supabaseAdmin
        .from('biodata_akademik')
        .select('user_id, asal_institusi')
        .in('user_id', userIds);

      const userInstitusiMap: Record<string, string> = {};
      (akademikData || []).forEach((row) => {
        if (row.user_id && row.asal_institusi) {
          userInstitusiMap[row.user_id] = row.asal_institusi;
        }
      });

      appsData.forEach((app) => {
        const institusi = userInstitusiMap[app.user_id];
        if (institusi) {
          institusiCount[institusi] = (institusiCount[institusi] || 0) + 1;
        }
      });
    }

    const top5 = Object.entries(institusiCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nama, jumlah]) => ({ nama, jumlah }));

    const { data: appDates } = await supabaseAdmin
      .from('applications')
      .select('created_at');

    const semesterTrend: Record<string, number> = {};
    appDates?.forEach((app) => {
      if (app.created_at) {
        const d = new Date(app.created_at);
        const year = d.getFullYear();
        const month = d.getMonth();
        const sem = month < 7 ? `${year}/GANJIL` : `${year}/GENAP`;
        semesterTrend[sem] = (semesterTrend[sem] || 0) + 1;
      }
    });

    return {
      kpi: {
        total_pendaftar: totalPendaftarVal,
        total_penerima: totalPenerimaVal,
        akumulasi_dana_cair: akumulasiDanaCair,
        success_rate: Number(successRate.toFixed(1)),
      },
      top_institusi: top5,
      trend_semesteran: Object.entries(semesterTrend).map(([semester, total]) => ({
        semester,
        total,
      })),
      map_data: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }
}

export const dashboardService = new DashboardService();
