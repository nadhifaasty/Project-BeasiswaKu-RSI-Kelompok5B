import { z } from 'zod';

export const createProgramSchema = z.object({
  name: z.string({ message: 'Nama program wajib diisi' }).min(1, 'Nama program wajib diisi'),
  target_level: z.enum(['SMA', 'PERGURUAN_TINGGI'], { message: 'Target sasaran wajib diisi' }),
  nominal: z.number({ message: 'Nominal wajib diisi' }).int().positive('Nominal harus lebih dari 0'),
  quota: z.number({ message: 'Kuota wajib diisi' }).int().positive('Kuota harus lebih dari 0'),
  deadline: z.string({ message: 'Deadline wajib diisi' }).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, { message: 'Deadline harus valid dan setelah hari ini' }),
  description: z.string().optional(),
  requirements: z.any().optional(),
});

export const createDraftProgramSchema = z.object({
  name: z.string().optional(),
  target_level: z.enum(['SMA', 'PERGURUAN_TINGGI']).optional(),
  nominal: z.number().min(0).optional(),
  quota: z.number().int().min(0).optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
  requirements: z.any().optional(),
  status: z.literal('DRAFT'),
});

export const updateProgramSchema = z.object({
  name: z.string().optional(),
  target_level: z.enum(['SMA', 'PERGURUAN_TINGGI']).optional(),
  nominal: z.number().int().min(0).optional(),
  quota: z.number().int().min(0).optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
  requirements: z.any().optional(),
});

export const updateProgramStatusSchema = z.object({
  status: z.enum(['aktif', 'ditutup'], { message: 'Status wajib diisi' }),
});

export const createApplicationSchema = z.object({
  programId: z.string().uuid('ID program tidak valid.'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.string().min(1, 'Status tidak boleh kosong.'),
});