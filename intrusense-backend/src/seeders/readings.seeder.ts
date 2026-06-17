import { ReadingModel } from '../models/reading.model';

function randomBetween(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function epochSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

interface SeedReading {
  deviceId: string;
  motionDetected: 0 | 1;
  distanceCm: number;
  timestamp: number;
  isIntrusion: boolean;
}

/**
 * Generates 240 readings spread over the last 2 hours.
 * Three realistic intrusion windows are embedded in the timeline:
 *   - ~30 min into the session  (someone approaches briefly)
 *   - ~70 min into the session  (longer approach, triggers alert)
 *   - last 10 min               (most recent intrusion event)
 */
function generateReadings(): SeedReading[] {
  const now = Date.now();
  const start = now - 2 * 60 * 60 * 1000;
  const TOTAL = 240;
  const intervalMs = (now - start) / TOTAL;

  // Each window: { center offset from start (ms), half-width (ms) }
  const intrusionWindows = [
    { center: start + 30 * 60 * 1000, radius: 90 * 1000 },
    { center: start + 70 * 60 * 1000, radius: 2 * 60 * 1000 },
    { center: now - 10 * 60 * 1000, radius: 2.5 * 60 * 1000 },
  ];

  return Array.from({ length: TOTAL }, (_, i) => {
    const ts = start + i * intervalMs;
    const isIntrusion = intrusionWindows.some((w) => Math.abs(ts - w.center) <= w.radius);

    return {
      deviceId: 'node-01',
      motionDetected: isIntrusion ? 1 : 0,
      distanceCm: isIntrusion ? randomBetween(45, 130) : randomBetween(200, 420),
      timestamp: epochSeconds(ts),
      isIntrusion,
    };
  });
}

export async function seedReadings(): Promise<void> {
  console.log('[Seeder:Readings] Seeding sensor readings...');

  await ReadingModel.deleteMany({});
  console.log('[Seeder:Readings] Cleared existing readings');

  const readings = generateReadings();
  await ReadingModel.insertMany(readings);

  const intrusionCount = readings.filter((r) => r.isIntrusion).length;
  console.log(
    `[Seeder:Readings] Inserted ${readings.length} readings (${intrusionCount} intrusions)`,
  );

  console.log('[Seeder:Readings] Done');
}
