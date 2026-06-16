import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function test() {
  const userId = '4d0fe4d0-50b8-475d-827c-92f195613717';
  const email = 'jimlysyahbatin0978@gmail.com';
  const nama_lengkap = 'ani ramadhani';
  const nim_nisn = 'l0224033';
  const nomor_hp = '081282128229';

  console.log(`Inserting profile for: ${email}`);
  const { error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      nama_lengkap,
      nim_nisn,
      nomor_hp,
      email,
      role: 'siswa',
      biodata_progress: 0,
    });

  if (error) {
    console.error('❌ Insert Profile Error:', error.message);
    console.error('Details:', error);
  } else {
    console.log('✅ Profile inserted successfully!');
  }

  process.exit(0);
}

test();
