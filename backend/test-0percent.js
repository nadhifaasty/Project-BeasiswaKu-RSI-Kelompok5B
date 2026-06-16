const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });
global.WebSocket = require('ws');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const alanRuslanId = '3708f73b-b884-40a3-b61f-a3bb08756201'; // 0% biodata
  
  const [pribadi, alamat, orangTua, akademik] = await Promise.all([
    supabaseAdmin.from('biodata_pribadi').select('*').eq('user_id', alanRuslanId).single(),
    supabaseAdmin.from('biodata_alamat').select('*').eq('user_id', alanRuslanId).single(),
    supabaseAdmin.from('biodata_orang_tua').select('*').eq('user_id', alanRuslanId).single(),
    supabaseAdmin.from('biodata_akademik').select('*').eq('user_id', alanRuslanId).single(),
  ]);

  console.log('Pribadi error:', pribadi.error);
  console.log('Alamat error:', alamat.error);
  console.log('OrangTua error:', orangTua.error);
  console.log('Akademik error:', akademik.error);
}

run();
