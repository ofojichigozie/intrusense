import { Router } from 'express';

import { login, getMe, patchMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, updateMeSchema } from '../validation/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateMeSchema), patchMe);

export default router;
