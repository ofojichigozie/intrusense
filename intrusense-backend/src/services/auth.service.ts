import jwt from 'jsonwebtoken';

import { AdminModel } from '../models/admin.model';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { LoginInput, UpdateMeInput } from '../validation/auth.validation';

export const loginAdmin = async (input: LoginInput) => {
  const admin = await AdminModel.findOne({ email: input.email.toLowerCase().trim() });

  if (!admin || !(await admin.comparePassword(input.password))) {
    throw new AppError(401, 'Invalid credentials');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = jwt.sign({ sub: admin._id.toString(), role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      telegramChatId: admin.telegramChatId,
    },
  };
};

export const getAdminById = async (id: string) => {
  const admin = await AdminModel.findById(id).select('-password').lean();
  if (!admin) throw new AppError(404, 'Admin not found');
  return admin;
};

export const updateAdmin = async (id: string, updates: UpdateMeInput) => {
  const admin = await AdminModel.findById(id);
  if (!admin) throw new AppError(404, 'Admin not found');

  if (updates.username !== undefined) admin.username = updates.username;
  if (updates.telegramChatId !== undefined) admin.telegramChatId = updates.telegramChatId;
  if (updates.password !== undefined) admin.password = updates.password; // triggers pre-save hash

  await admin.save();

  const { password: _pw, ...safe } = admin.toObject();
  return safe;
};
