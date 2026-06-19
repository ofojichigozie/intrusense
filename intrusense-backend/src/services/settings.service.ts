import { SettingsModel } from '../models/settings.model';
import { ReadingModel } from '../models/reading.model';

export interface Settings {
  armed: boolean;
  distanceThresholdCm: number;
  alertCooldownMs: number;
}

let cache: Settings = {
  armed: true,
  distanceThresholdCm: 60,
  alertCooldownMs: 60000,
};

export async function loadSettings(): Promise<void> {
  const docs = await SettingsModel.find().lean();
  for (const doc of docs) {
    if (doc.key === 'armed') cache.armed = doc.value === 'true';
    if (doc.key === 'distanceThresholdCm') cache.distanceThresholdCm = parseFloat(doc.value);
    if (doc.key === 'alertCooldownMs') cache.alertCooldownMs = parseInt(doc.value, 10);
  }
}

export function getSettings(): Settings {
  return { ...cache };
}

export const getStatus = async () => {
  const [lastReading, lastIntrusion] = await Promise.all([
    ReadingModel.findOne().sort({ createdAt: -1 }).lean(),
    ReadingModel.findOne({ isIntrusion: true }).sort({ createdAt: -1 }).lean(),
  ]);
  return { settings: cache, lastReading, lastIntrusion };
};

export const updateSettings = async (updates: Partial<Settings>) => {
  const allowedKeys: Array<keyof Settings> = ['armed', 'distanceThresholdCm', 'alertCooldownMs'];

  for (const key of allowedKeys) {
    if (!(key in updates)) continue;
    await SettingsModel.findOneAndUpdate(
      { key },
      { value: String(updates[key]) },
      { upsert: true, new: true },
    );
  }

  cache = { ...cache, ...updates };
  return { ...cache };
};
