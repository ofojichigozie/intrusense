import { z } from 'zod';

export const readingSchema = z.object({
  deviceId: z.string().min(1),
  motionDetected: z.number().int().min(0).max(1),
  distanceCm: z.number().positive(),
});

export type ReadingPayload = z.infer<typeof readingSchema>;
