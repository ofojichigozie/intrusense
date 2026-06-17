import { Router } from 'express';

import { postReading, fetchReadings, removeReading } from '../controllers/reading.controller';
import { authenticate, authenticateDevice } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { readingSchema } from '../validation/reading.validation';

const router = Router();

router.get('/', authenticate, fetchReadings);
router.post('/', authenticateDevice, validate(readingSchema), postReading);
router.delete('/:id', authenticate, removeReading);

export default router;
