import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import type { AuthPayload, AuthRequest } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Unauthorised — missing token', data: null });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.admin = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    res
      .status(401)
      .json({ status: 'error', message: 'Unauthorised — invalid or expired token', data: null });
  }
};

export const authenticateDevice = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== env.deviceApiKey) {
    res
      .status(401)
      .json({ status: 'error', message: 'Unauthorised — invalid device API key', data: null });
    return;
  }

  next();
};
