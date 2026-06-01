import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import programRoutes from './program.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running', data: { status: 'OK', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.use('/applications', applicationRoutes);
router.use('/applications', documentRoutes);

router.get('/supabase-test', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('scholarship_programs').select('*');
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
