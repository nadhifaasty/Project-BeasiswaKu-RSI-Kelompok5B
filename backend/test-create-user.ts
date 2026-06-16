import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from './src/config/supabase';

async function testCreate() {
  const email = 'nezukokuro20@gmail.com';
  
  // Create user once
  console.log('Creating user 1...');
  const res1 = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: false,
    user_metadata: {
      nama_lengkap: 'Test',
      nim_nisn: '12345678',
      nomor_hp: '0812345678',
    },
  });
  console.log('User 1 error?', res1.error?.message);

  // Create user AGAIN without deleting!
  console.log('Creating user 2...');
  const result = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: false,
    user_metadata: {
      nama_lengkap: 'Test',
      nim_nisn: '12345678',
      nomor_hp: '0812345678',
    },
  });

  console.log('Result Data User:', !!result.data.user);
  console.log('Result Error:', result.error);
}

testCreate().catch(console.error);
