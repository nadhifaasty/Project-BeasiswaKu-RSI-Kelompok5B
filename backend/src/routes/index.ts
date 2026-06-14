import { Router } from 'express';
import { healthCheck } from '../controllers';
import { supabaseAdmin } from '../config/supabase';
import authRoutes from './auth.routes';
import biodataRoutes from './biodata.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';
import programRoutes from './program.routes';
import adminRoutes from './admin.routes';
import selectionRoutes from './selection.routes';
import disbursementRoutes from './disbursement.routes';
import systemRoutes from './system.routes';
import reportRoutes from './report.routes';
import fundReportRoutes from './fund-report.routes';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Auth routes
router.use('/auth', authRoutes);

// User & Biodata routes
router.use('/users', biodataRoutes);

// Scholarship Applications routes
router.use('/applications', applicationRoutes);

// Programs routes
router.use('/programs', programRoutes);

// Document routes
router.use('/documents', documentRoutes);

// Selection routes
router.use('/selections', selectionRoutes);

// TSD Reports (Export and Monthly)
router.use('/reports', reportRoutes);
router.use('/fund-reports', fundReportRoutes);

// Disbursement routes
router.use('/disbursements', disbursementRoutes);

// System routes
router.use('/system', systemRoutes);

// Admin Dashboard & Logs
router.use('/admin', adminRoutes);

// Supabase connection test
router.get('/env-test', (_req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) : 'missing',
    supabaseAnonKeyPrefix: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 15) : 'missing',
  });
});

router.get('/supabase-test', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('scholarship_programs').select('*');
    res.json({
      success: true,
      data,
      error,
      singletonUrl: (supabaseAdmin as any).supabaseUrl,
      singletonKey: (supabaseAdmin as any).supabaseKey ? (supabaseAdmin as any).supabaseKey.substring(0, 15) : 'missing',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
