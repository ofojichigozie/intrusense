import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/intrusense'),
  jwtSecret: getEnv('JWT_SECRET', 'dev_secret_change_in_production'),
  jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '604800', 10), // 7 days in seconds
  deviceApiKey: getEnv('DEVICE_API_KEY', 'intrusense-device-secret'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
};
