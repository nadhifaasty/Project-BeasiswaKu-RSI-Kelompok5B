import { Response } from 'express';
import { biodataService } from '../services/biodata.service';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// ============ GET ALL BIODATA ============

export const getAllBiodata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await biodataService.getAll(userId);
    sendSuccess(res, data, 'Biodata berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// ============ BIODATA PRIBADI ============

export const getPribadi = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await biodataService.getPribadi(userId);
    sendSuccess(res, data, 'Biodata pribadi berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const upsertPribadi = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { nama_lengkap, nim_nisn, email, nomor_hp, tempat_lahir, tanggal_lahir, jenis_kelamin, agama } = req.body;

    if (!nama_lengkap || !nim_nisn || !email || !nomor_hp) {
      sendError(res, 'Nama, NIM/NISN, email, dan nomor HP wajib diisi.', 400);
      return;
    }

    const data = await biodataService.upsertPribadi(userId, {
      nama_lengkap,
      nim_nisn,
      email,
      nomor_hp,
      tempat_lahir,
      tanggal_lahir: tanggal_lahir || undefined,
      jenis_kelamin,
      agama,
    });

    sendSuccess(res, data, 'Biodata pribadi berhasil disimpan.', 200);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// ============ BIODATA ALAMAT ============

export const getAlamat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await biodataService.getAlamat(userId);
    sendSuccess(res, data, 'Biodata alamat berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const upsertAlamat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { alamat, rt_rw, kelurahan, provinsi, kota, kecamatan, kode_pos } = req.body;

    if (!alamat || !provinsi || !kota || !kecamatan || !kode_pos) {
      sendError(res, 'Alamat, provinsi, kota, kecamatan, dan kode pos wajib diisi.', 400);
      return;
    }

    const data = await biodataService.upsertAlamat(userId, {
      alamat,
      rt_rw,
      kelurahan,
      provinsi,
      kota,
      kecamatan,
      kode_pos,
    });

    sendSuccess(res, data, 'Biodata alamat berhasil disimpan.', 200);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// ============ BIODATA ORANG TUA ============

export const getOrangTua = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await biodataService.getOrangTua(userId);
    sendSuccess(res, data, 'Biodata orang tua berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const upsertOrangTua = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { ayah_nama, ayah_pekerjaan, ayah_penghasilan, ibu_nama, ibu_pekerjaan, ibu_penghasilan } = req.body;

    if (!ayah_nama || !ayah_pekerjaan || ayah_penghasilan === undefined ||
        !ibu_nama || !ibu_pekerjaan || ibu_penghasilan === undefined) {
      sendError(res, 'Semua field biodata orang tua wajib diisi.', 400);
      return;
    }

    const data = await biodataService.upsertOrangTua(userId, {
      ayah_nama,
      ayah_pekerjaan,
      ayah_penghasilan: Number(ayah_penghasilan),
      ibu_nama,
      ibu_pekerjaan,
      ibu_penghasilan: Number(ibu_penghasilan),
    });

    sendSuccess(res, data, 'Biodata orang tua berhasil disimpan.', 200);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// ============ BIODATA AKADEMIK ============

export const getAkademik = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = await biodataService.getAkademik(userId);
    sendSuccess(res, data, 'Biodata akademik berhasil diambil.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const upsertAkademik = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { jenjang, asal_institusi, program_studi, ipk_nilai } = req.body;

    if (!jenjang || !asal_institusi || !program_studi || ipk_nilai === undefined) {
      sendError(res, 'Semua field biodata akademik wajib diisi.', 400);
      return;
    }

    const isCollege = jenjang?.toLowerCase().includes('perguruan') || jenjang?.toUpperCase() === 'PERGURUAN_TINGGI';
    const maxVal = isCollege ? 4 : 100;

    if (Number(ipk_nilai) < 0 || Number(ipk_nilai) > maxVal) {
      sendError(res, `IPK/Nilai harus antara 0 dan ${maxVal}.`, 400);
      return;
    }

    const data = await biodataService.upsertAkademik(userId, {
      jenjang,
      asal_institusi,
      program_studi,
      ipk_nilai: Number(ipk_nilai),
    });

    sendSuccess(res, data, 'Biodata akademik berhasil disimpan.', 200);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
