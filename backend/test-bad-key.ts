import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testCreate() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  // Use a BAD service role key!
  const badKey = 'eyJh...badkey';
  const supabaseAdmin = createClient(supabaseUrl, badKey, {
    auth: { persistSession: false }
  });

  const email = 'test_bad_key@gmail.com';
  console.log('Creating user with bad key...');
  const result = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: false,
    user_metadata: { nama_lengkap: 'Test' },
  });

  console.log('Result Data:', result.data);
  console.log('Result Error:', result.error);
}

testCreate().catch(console.error);
