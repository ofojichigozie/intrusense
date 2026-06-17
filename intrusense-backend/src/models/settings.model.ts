import { Schema, model, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: string;
}

const settingsSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export const SettingsModel = model<ISetting>('Config', settingsSchema);
