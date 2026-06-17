import crypto from 'crypto';
import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';
import { AdminModel } from '../models/admin.model';
import { AppError } from '../utils/AppError';

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PendingCode {
  code: string;
  expiresAt: number;
}

const pendingCodes = new Map<string, PendingCode>(); // adminId -> pending code

let bot: TelegramBot | null = null;

if (env.telegramToken) {
  bot = new TelegramBot(env.telegramToken, { polling: false });
}

export async function sendAlert(message: string): Promise<void> {
  if (!bot) {
    console.log('[Telegram] Alert (bot not configured):', message);
    return;
  }

  const admin = await AdminModel.findOne().select('telegramChatId').lean();
  const chatId = admin?.telegramChatId;

  if (!chatId) {
    console.log('[Telegram] Alert (no chat ID set on admin):', message);
    return;
  }

  try {
    await bot.sendMessage(chatId, message);
  } catch (err) {
    console.error('[Telegram] Failed to send message:', err);
  }
}

export async function getBotUsername(): Promise<string | null> {
  if (!bot) return null;
  try {
    const me = await bot.getMe();
    return me.username ?? null;
  } catch {
    return null;
  }
}

export function generateVerifyCode(adminId: string): string {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  pendingCodes.set(adminId, { code, expiresAt: Date.now() + CODE_TTL_MS });
  // Auto-evict after TTL so the map doesn't grow indefinitely
  setTimeout(() => pendingCodes.delete(adminId), CODE_TTL_MS);
  return code;
}

export async function checkVerifyCode(adminId: string): Promise<string> {
  if (!bot) throw new AppError(503, 'Telegram bot is not configured');

  const pendingCode = pendingCodes.get(adminId);

  if (!pendingCode) {
    throw new AppError(400, 'No verification code found. Generate one first.');
  }
  if (Date.now() > pendingCode.expiresAt) {
    pendingCodes.delete(adminId);
    throw new AppError(400, 'Verification code has expired. Generate a new one.');
  }

  const { code } = pendingCode;
  const updates = await bot.getUpdates({ limit: 100, timeout: 0 });
  const match = updates.find((u) => u.message?.text?.trim() === code);

  if (!match?.message) {
    throw new AppError(404, 'Code not found. Make sure you sent the code to your bot.');
  }

  const chatId = match.message.chat.id.toString();

  await AdminModel.findByIdAndUpdate(adminId, { telegramChatId: chatId });
  pendingCodes.delete(adminId);

  return chatId;
}
