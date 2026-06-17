import { SettingsModel } from '../models/settings.model';

const DEFAULT_SETTINGS = [
  { key: 'armed', value: 'true' },
  { key: 'distanceThresholdCm', value: '150' },
  { key: 'alertCooldownMs', value: '60000' },
];

export async function seedSettings(): Promise<void> {
  console.log('[Seeder:Settings] Seeding default settings...');

  for (const setting of DEFAULT_SETTINGS) {
    await SettingsModel.findOneAndUpdate(
      { key: setting.key },
      { value: setting.value },
      { upsert: true, new: true },
    );
    console.log(`[Seeder:Settings]  ${setting.key} = ${setting.value}`);
  }

  console.log('[Seeder:Settings] Done');
}
