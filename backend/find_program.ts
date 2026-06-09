import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eerqijkhcuflueqevkgy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnFpamtoY3VmbHVlcWV2a2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3OTczNSwiZXhwIjoyMDk0ODU1NzM1fQ.FE5-BDDQxqTO6_OZUI3tlEyY8_hLOLl2cUuVAd28g5Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: program } = await supabase.from('scholarship_programs').select('id, nama, status').ilike('nama', '%Semar%').single();
  
  if (program) {
    console.log("=== PROGRAM DITEMUKAN ===");
    console.log("Nama:", program.nama);
    console.log("Status:", program.status);
    console.log("ID:", program.id);
  } else {
    // Cari program apa saja yang statusnya ditutup
    const { data: closedProgram } = await supabase.from('scholarship_programs').select('id, nama, status').eq('status', 'ditutup').limit(1).single();
    if (closedProgram) {
      console.log("=== PROGRAM DITUTUP LAINNYA ===");
      console.log("Nama:", closedProgram.nama);
      console.log("ID:", closedProgram.id);
    } else {
      console.log("Tidak ada program ditutup ditemukan.");
    }
  }
}

main();
