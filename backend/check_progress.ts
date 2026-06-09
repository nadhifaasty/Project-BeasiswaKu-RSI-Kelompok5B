import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eerqijkhcuflueqevkgy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnFpamtoY3VmbHVlcWV2a2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3OTczNSwiZXhwIjoyMDk0ODU1NzM1fQ.FE5-BDDQxqTO6_OZUI3tlEyY8_hLOLl2cUuVAd28g5Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, role, nama_lengkap, biodata_progress');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("=== USERS WITH PROGRESS ===");
  for (const p of profiles || []) {
    if (p.role === 'siswa') {
      console.log(`- ${p.email} | Progress: ${p.biodata_progress}%`);
    }
  }
}

main();
