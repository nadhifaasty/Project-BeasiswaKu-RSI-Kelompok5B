import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function test() {
  const proto = Object.getPrototypeOf(supabaseAdmin.auth.admin);
  console.log('Prototype keys:', Object.getOwnPropertyNames(proto));
  process.exit(0);
}

test();
