import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
  getAllBiodata,
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

// GET /api/biodata - Get all biodata sections
router.get('/', getAllBiodata);

// Biodata Pribadi
router.get('/pribadi', getPribadi);
router.put('/pribadi', upsertPribadi);

// Biodata Alamat
router.get('/alamat', getAlamat);
router.put('/alamat', upsertAlamat);

// Biodata Orang Tua
router.get('/orang-tua', getOrangTua);
router.put('/orang-tua', upsertOrangTua);

// Biodata Akademik
router.get('/akademik', getAkademik);
router.put('/akademik', upsertAkademik);

export default router;
