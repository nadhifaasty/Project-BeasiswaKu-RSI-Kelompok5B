import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function inspect() {
  const { data, error } = await supabaseAdmin.rpc('inspect_table_columns', { table_name: 'audit_logs' });
  if (error) {
    // If RPC is not available, we can query information_schema via a standard select
    // Wait, Supabase client cannot directly query information_schema unless we use a function or raw SQL.
    // Let's try executing a select from information_schema if possible, or just print the error
    console.log('RPC Error:', error.message);
  } else {
    console.log('Columns:', data);
  }

  // Let's also check by doing a simple select of 1 row to see the keys of the returned object
  const { data: row, error: selectErr } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .limit(1);
  
  if (selectErr) {
    console.error('Select Error:', selectErr.message);
  } else {
    console.log('Sample row keys:', row && row[0] ? Object.keys(row[0]) : 'No rows');
  }

  process.exit(0);
}

inspect();
