import { z } from 'zod';

export const createProgramSchema = z.object({
  name: z.string({ required_error: "Nama program wajib diisi" }).min(1, "Nama program wajib diisi"),
  target_level: z.enum(['SMA', 'PERGURUAN_TINGGI'], { required_error: "Target sasaran wajib diisi", invalid_type_error: "Target sasaran tidak valid" }),
  nominal: z.number({ required_error: "Nominal wajib diisi" }).int().positive("Nominal harus lebih dari 0"),
  quota: z.number({ required_error: "Kuota wajib diisi" }).int().positive("Kuota harus lebih dari 0"),
  deadline: z.string({ required_error: "Deadline wajib diisi" }).refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, { message: "Deadline harus valid dan setelah hari ini" }),
  description: z.string().optional(),
  requirements: z.any().optional(),
});

export const updateProgramSchema = createProgramSchema.partial();

export const updateProgramStatusSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT'], { required_error: "Status wajib diisi", invalid_type_error: "Status tidak valid" }),
});
