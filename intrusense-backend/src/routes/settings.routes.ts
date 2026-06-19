import { Router } from 'express';

import { fetchStatus, fetchSettings, patchSettings } from '../controllers/settings.controller';
import { authenticate, authenticateDevice } from '../middleware/auth.middleware';

const router = Router();

router.get('/firmware', authenticateDevice, fetchSettings);
router.get('/status', authenticate, fetchStatus);
router.get('/', authenticate, fetchSettings);
router.put('/', authenticate, patchSettings);

export default router;
