import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function test() {
  const email = 'jimlysyahbatin0978@gmail.com';
  
  console.log(`Checking email in profiles table: ${email}`);
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('email', email).maybeSingle();
  console.log('Profile in DB:', profile);

  console.log(`Checking email in Supabase Auth: ${email}`);
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('List users error:', error.message);
  } else {
    const authUser = users.find(u => u.email === email);
    console.log('Auth User:', authUser);
    if (authUser) {
      console.log('User ID in Auth:', authUser.id);
    }
  }

  process.exit(0);
}

test();
