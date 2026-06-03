import { Router } from 'express';
import { healthCheck } from '../controllers';
import { supabaseAdmin } from '../config/supabase';
import authRoutes from './auth.routes';
import biodataRoutes from './biodata.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';
import programRoutes from './program.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Auth routes
router.use('/auth', authRoutes);

// Biodata routes
router.use('/biodata', biodataRoutes);

// Applications routes (TSD Module 4)
router.use('/applications', applicationRoutes);

// Programs routes
router.use('/programs', programRoutes);

// Document routes
router.use('/documents', documentRoutes);

// Admin / Super Admin routes
router.use('/admin', adminRoutes);
router.use('/super-admin', adminRoutes);

// Supabase connection test
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
