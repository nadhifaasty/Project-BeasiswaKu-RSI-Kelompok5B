import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from './src/config/supabase';

console.log('ENV SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('ENV SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) + '...' : 'undefined');

async function test() {
  const { data, error } = await supabaseAdmin.from('scholarship_programs').select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
}
test();
