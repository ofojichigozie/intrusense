import { Request, Response, NextFunction } from 'express';
import { loginAdmin, getAdminById, updateAdmin } from '../services/auth.service';
import type { AuthRequest } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await loginAdmin(req.body);
    res.status(200).json({ status: 'success', message: 'Login successful', data });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await getAdminById(req.admin!.sub);
    res.status(200).json({ status: 'success', message: 'Profile retrieved', data: { admin } });
  } catch (error) {
    next(error);
  }
};

export const patchMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin = await updateAdmin(req.admin!.sub, req.body);
    res
      .status(200)
      .json({ status: 'success', message: 'Profile updated successfully', data: { admin } });
  } catch (error) {
    next(error);
  }
};
