import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from './src/config/supabase';

console.log('ENV SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('ENV SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) + '...' : 'undefined');

async function test() {
  const { data: programs, error: err1 } = await supabaseAdmin.from('scholarship_programs').select('*');
  console.log('PROGRAMS:', programs);
  const { data: applications, error: err2 } = await supabaseAdmin.from('applications').select('*');
  console.log('APPLICATIONS:', applications);
}
test();
