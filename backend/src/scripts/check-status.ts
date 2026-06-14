import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function check() {
  const { data: apps, error: err1 } = await supabaseAdmin
    .from('applications')
    .select('id, user_id, status, ipk, profiles(email, nama_lengkap)');
  
  console.log('--- APPLICATIONS ---');
  console.log(JSON.stringify(apps, null, 2));

  const { data: results, error: err2 } = await supabaseAdmin
    .from('selection_results')
    .select('*');

  console.log('--- SELECTION RESULTS ---');
  console.log(JSON.stringify(results, null, 2));

  const { data: programs, error: err3 } = await supabaseAdmin
    .from('scholarship_programs')
    .select('*');
  console.log('--- SCHOLARSHIP PROGRAMS ---');
  console.log(JSON.stringify(programs, null, 2));

  const { data: audit, error: err4 } = await supabaseAdmin
    .from('audit_logs')
    .select('*');
  console.log('--- AUDIT LOGS ---');
  console.log(JSON.stringify(audit, null, 2));

  process.exit(0);
}

check();
