import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from './src/config/supabase';

async function run() {
  const email = 'ani@test.com';
  try {
    console.log(`Getting user profile for ${email}...`);
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, nama_lengkap')
      .eq('email', email)
      .single();
    
    if (profErr || !profile) {
      throw new Error(`Profile not found: ${profErr?.message}`);
    }
    
    console.log('Profile:', profile);
    
    console.log(`Getting applications for user_id ${profile.id}...`);
    const { data: apps, error: appErr } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        scholarship_programs (
          nama,
          nominal:monthly_amount,
          deadline,
          status
        )
      `)
      .eq('user_id', profile.id);
      
    if (appErr) throw appErr;
    console.log('Applications returned:', apps);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
