import { Router } from 'express';

import { fetchStatus, fetchSettings, patchSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/status', fetchStatus);
router.get('/', fetchSettings);
router.put('/', patchSettings);

export default router;
