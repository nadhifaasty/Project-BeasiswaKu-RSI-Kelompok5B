import { Router } from 'express';
import { healthCheck } from '../controllers';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

router.get('/health', healthCheck);

router.get('/supabase-test', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('scholarship_programs').select('*');
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
