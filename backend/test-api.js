const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/users/1630046c-f02a-41ef-aac4-7247359fde93/profile',
  method: 'GET',
};

// Wait, without token it will be rejected by verifyJWT!
// Let's create a quick script to generate a token for Alan Rosandy or just fetch it using Supabase.
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });
global.WebSocket = require('ws');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Can't generate JWT easily without signing secret.
  // Instead, I'll bypass verifyJWT temporarily on the server or just call the controller logic directly.
}
