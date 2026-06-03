import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

// Polyfill WebSocket for Node.js < 22 environments
;(global as any).WebSocket = ws

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})
