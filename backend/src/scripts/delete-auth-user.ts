import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function test() {
  const email = 'jimlysyahbatin0978@gmail.com';
  
  console.log(`Searching for email in Supabase Auth: ${email}`);
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('List users error:', error.message);
    process.exit(1);
  }

  const authUser = users.find(u => u.email === email);
  if (authUser) {
    console.log(`Found user ID: ${authUser.id}. Deleting...`);
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
    if (delError) {
      console.error('❌ Delete error:', delError.message);
    } else {
      console.log('✅ User successfully deleted from Supabase Auth!');
    }
  } else {
    console.log('⚠️ User not found in Supabase Auth.');
  }

  process.exit(0);
}

test();
