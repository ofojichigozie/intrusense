import { Router } from 'express';

import authRoutes from './auth.routes';
import readingRoutes from './reading.routes';
import settingsRoutes from './settings.routes';
import telegramRoutes from './telegram.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/readings', readingRoutes); // GET (admin/JWT) + POST (device/api-key)
router.use('/settings', settingsRoutes); // admin-facing — uses JWT
router.use('/telegram', telegramRoutes); // Telegram bot integration

export default router;
