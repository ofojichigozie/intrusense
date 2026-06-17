import mongoose from 'mongoose';

import { env } from './env';

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[MongoDB] Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err);
  });

  await mongoose.connect(env.mongoUri);
}
