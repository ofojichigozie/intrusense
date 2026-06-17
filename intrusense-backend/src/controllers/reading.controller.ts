import { Request, Response, NextFunction } from 'express';

import { createReading, getReadings, deleteReading } from '../services/reading.service';
import type { ReadingPayload } from '../validation/reading.validation';

export const postReading = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await createReading(req.body as ReadingPayload);
    res
      .status(201)
      .json({ status: 'success', message: 'Reading recorded successfully', data: null });
  } catch (error) {
    next(error);
  }
};

export const fetchReadings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt((req.query.pageSize as string) ?? '20', 10)),
    );
    const intrusionOnly = req.query.intrusion === 'true';
    const data = await getReadings(page, pageSize, intrusionOnly);
    res.status(200).json({ status: 'success', message: 'Readings fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

export const removeReading = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await deleteReading(id);
    res.status(200).json({ status: 'success', message: 'Reading deleted successfully', data });
  } catch (error) {
    next(error);
  }
};
