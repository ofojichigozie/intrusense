import { Router } from 'express';

import {
  fetchBotInfo,
  requestVerifyCode,
  confirmVerifyCode,
} from '../controllers/telegram.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', fetchBotInfo);
router.post('/generate-code', requestVerifyCode);
router.post('/confirm-code', confirmVerifyCode);

export default router;
