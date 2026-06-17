import { Request, Response, NextFunction } from 'express';

import { getStatus, getSettings, updateSettings } from '../services/settings.service';

export const fetchStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getStatus();
    res.status(200).json({ status: 'success', message: 'Status retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

export const fetchSettings = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = getSettings();
    res.status(200).json({ status: 'success', message: 'Settings retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

export const patchSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await updateSettings(req.body);
    res.status(200).json({ status: 'success', message: 'Settings updated successfully', data });
  } catch (error) {
    next(error);
  }
};
