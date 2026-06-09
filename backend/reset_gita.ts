import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eerqijkhcuflueqevkgy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnFpamtoY3VmbHVlcWV2a2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3OTczNSwiZXhwIjoyMDk0ODU1NzM1fQ.FE5-BDDQxqTO6_OZUI3tlEyY8_hLOLl2cUuVAd28g5Q';

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
