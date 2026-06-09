import { Router } from 'express';
import { runSelection, getSelectionResults, finalizeSelection, rollbackSelection, updateWeights } from '../controllers/selection.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';

const router = Router();

// ============ SELECTION ENGINE (Admin & SuperAdmin) ============
// POST /api/v1/selections/:programId/run
router.post('/:programId/run', verifyJWT, checkRole(['admin', 'super_admin']), runSelection);

// GET /api/v1/selections/:programId/results
router.get('/:programId/results', verifyJWT, checkRole(['admin', 'super_admin']), getSelectionResults);

// PATCH /api/v1/selections/:programId/weights
router.patch('/:programId/weights', verifyJWT, checkRole(['admin', 'super_admin']), updateWeights);

// POST /api/v1/selections/:programId/finalize
router.post('/:programId/finalize', verifyJWT, checkRole(['admin', 'super_admin']), finalizeSelection);

// POST /api/v1/selections/:programId/rollback
router.post('/:programId/rollback', verifyJWT, checkRole(['admin', 'super_admin']), rollbackSelection);

export default router;
