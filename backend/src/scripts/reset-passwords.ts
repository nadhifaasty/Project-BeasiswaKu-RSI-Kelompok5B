import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

const emails = [
  'siswa@simba.com',
  'admin@simba.com',
  'superadmin@simba.com',
  'ani@test.com',
  'bambang@test.com',
  'citra@test.com',
  'hendra@test.com',
  'indah@test.com',
  'joko@test.com',
  'doni@test.com',
  'elisa@test.com',
  'fajar@test.com',
  'gina@test.com',
  'kartika@test.com',
  'lukman@test.com'
];

async function reset() {
  console.log('🔄 Resetting passwords for all users to "password123"...');
  
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('❌ Failed to list users:', error.message);
    process.exit(1);
  }

  for (const email of emails) {
    const user = users.find(u => u.email === email);
    if (user) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: 'password123',
        email_confirm: true
      });
      if (updateError) {
        console.error(`❌ Failed to reset password for ${email}:`, updateError.message);
      } else {
        console.log(`✅ Reset password for ${email}`);
      }
    } else {
      console.log(`⚠️ User not found in Auth: ${email}`);
    }
  }

  console.log('🎉 Password reset complete!');
  process.exit(0);
}

reset();
