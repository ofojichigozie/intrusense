import { Response, NextFunction } from 'express';

import { getBotUsername, generateVerifyCode, checkVerifyCode } from '../services/telegram.service';
import type { AuthRequest } from '../types';

export const fetchBotInfo = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const botUsername = await getBotUsername();
    res.status(200).json({
      status: 'success',
      message: 'Telegram bot info retrieved',
      data: { botUsername },
    });
  } catch (error) {
    next(error);
  }
};

export const requestVerifyCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const code = generateVerifyCode(req.admin!.sub);
    res.status(200).json({
      status: 'success',
      message: 'Verification code generated. Send it to your bot within 5 minutes.',
      data: { code },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmVerifyCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const chatId = await checkVerifyCode(req.admin!.sub);
    res.status(200).json({
      status: 'success',
      message: 'Telegram account linked successfully',
      data: { chatId },
    });
  } catch (error) {
    next(error);
  }
};
