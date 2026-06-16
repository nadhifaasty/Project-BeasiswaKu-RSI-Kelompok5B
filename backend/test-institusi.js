const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });
global.WebSocket = require('ws');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: appsData } = await supabaseAdmin
      .from('applications')
      .select('user_id')
      .not('status', 'eq', 'DRAFT');

  const institusiCount = {};

  if (appsData && appsData.length > 0) {
    const userIds = appsData.map((app) => app.user_id).filter(Boolean);
    
    const { data: akademikData } = await supabaseAdmin
      .from('biodata_akademik')
      .select('user_id, asal_institusi')
      .in('user_id', userIds);

    const userInstitusiMap = {};
    (akademikData || []).forEach((row) => {
      if (row.user_id && row.asal_institusi) {
        userInstitusiMap[row.user_id] = row.asal_institusi;
      }
    });

    appsData.forEach((app) => {
      const institusi = userInstitusiMap[app.user_id];
      if (institusi) {
        institusiCount[institusi] = (institusiCount[institusi] || 0) + 1;
      }
    });
  }

  const top5 = Object.entries(institusiCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nama, jumlah]) => ({ nama, jumlah }));
  
  console.log('Top 5:', top5);
}

run();
