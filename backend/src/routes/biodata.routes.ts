import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  getAllBiodata,
  getBiodataStatus,
  getPribadi,
  upsertPribadi,
  getAlamat,
  upsertAlamat,
  getOrangTua,
  upsertOrangTua,
  getAkademik,
  upsertAkademik,
} from '../controllers/biodata.controller';

const router = Router();

// All biodata routes require authentication
router.use(verifyJWT);

// GET /api/v1/users/:id/profile - Get all biodata sections
router.get('/:id/profile', getAllBiodata);

// GET /api/v1/users/:id/profile/status - Get biodata progress
router.get('/:id/profile/status', getBiodataStatus);

// Biodata Pribadi
router.get('/:id/profile/pribadi', getPribadi);
router.put('/:id/profile/pribadi', upsertPribadi);

// Biodata Alamat
router.get('/:id/profile/alamat', getAlamat);
router.put('/:id/profile/alamat', upsertAlamat);

// Biodata Orang Tua
router.get('/:id/profile/orang-tua', getOrangTua);
router.put('/:id/profile/orang-tua', upsertOrangTua);

// Biodata Akademik
router.get('/:id/profile/akademik', getAkademik);
router.put('/:id/profile/akademik', upsertAkademik);

export default router;
