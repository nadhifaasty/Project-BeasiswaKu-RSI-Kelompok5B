import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const email = 'dummy2021007@beasiswaku.test'; // Gita Permata
  
  // Get user
  const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
  
  if (user) {
    // Reset progress to 50% just to be safe it triggers the error but has some data
    await supabase.from('profiles').update({ biodata_progress: 50 }).eq('id', user.id);
    console.log("Progress reset to 50% for " + email);
  }
}

main();
