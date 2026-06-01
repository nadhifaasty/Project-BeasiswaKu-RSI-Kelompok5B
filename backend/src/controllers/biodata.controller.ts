import { Response } from 'express';
import * as userService from '../services/user.service';
import { AuthenticatedRequest } from '../types';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    res.json({ success: true, message: 'Profil berhasil diambil.', data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { profile_data } = req.body;

    if (!profile_data || typeof profile_data !== 'object') {
      res.status(400).json({ success: false, message: 'Data profile wajib dikirim dalam field "profile_data".' });
      return;
    }

    const result = await userService.updateProfile(userId, profile_data);
    res.json({ success: true, message: 'Profil berhasil disimpan.', data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
