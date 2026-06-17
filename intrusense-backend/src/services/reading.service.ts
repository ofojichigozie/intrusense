import { ReadingModel } from '../models/reading.model';
import { AppError } from '../utils/AppError';
import { getSettings } from './settings.service';
import { emitReadingUpdate, emitIntrusionAlert } from './socket.service';
import { sendAlert } from './telegram.service';
import type { ReadingPayload } from '../validation/reading.validation';

let lastAlertAt = 0;

export async function getReadings(page: number, pageSize: number, intrusionOnly = false) {
  const filter = intrusionOnly ? { isIntrusion: true } : {};
  const skip = (page - 1) * pageSize;

  const [readings, total] = await Promise.all([
    ReadingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ReadingModel.countDocuments(filter),
  ]);

  return { readings, total, page, pageSize };
}

export async function createReading(payload: ReadingPayload): Promise<void> {
  const settings = getSettings();
  const isIntrusion =
    settings.armed &&
    payload.motionDetected === 1 &&
    payload.distanceCm < settings.distanceThresholdCm;

  await ReadingModel.create({
    deviceId: payload.deviceId,
    motionDetected: payload.motionDetected,
    distanceCm: payload.distanceCm,
    isIntrusion,
  });

  emitReadingUpdate(payload);

  if (!isIntrusion) return;

  emitIntrusionAlert(payload);

  const now = Date.now();
  if (now - lastAlertAt >= settings.alertCooldownMs) {
    lastAlertAt = now;
    const time = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    await sendAlert(
      `🚨 Intrusion Detected\n\nMotion and proximity triggered an alert.\n📏 Distance: ${payload.distanceCm.toFixed(1)} cm\n🕐 ${time}`,
    );
  }
}

export async function deleteReading(id: string) {
  const reading = await ReadingModel.findByIdAndDelete(id).lean();
  if (!reading) throw new AppError(404, 'Reading not found');
  return reading;
}
