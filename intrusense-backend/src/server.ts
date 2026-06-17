import http from 'http';

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { initSocket } from './services/socket.service';
import { loadSettings } from './services/settings.service';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await loadSettings();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[IntruSense] Backend running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('[IntruSense] Failed to start:', err);
  process.exit(1);
});
