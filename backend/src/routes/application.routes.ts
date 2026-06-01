import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/rbac.middleware';
import {
  getUserApplications, getApplicationById, createApplication, getAllApplications, updateApplicationStatus,
} from '../controllers/scholarship.controller';

const router = Router();

router.post('/', verifyJWT, createApplication);
router.get('/my', verifyJWT, getUserApplications);
router.get('/:id', verifyJWT, getApplicationById);
router.get('/', verifyJWT, (req, res, next) => checkRole(req, res, next, ['admin', 'super_admin']), getAllApplications);
router.patch('/:id/status', verifyJWT, (req, res, next) => checkRole(req, res, next, ['admin', 'super_admin']), updateApplicationStatus);

export default router;
