import { Schema, model, Document } from 'mongoose';

export interface IReading extends Document {
  deviceId: string;
  motionDetected: 0 | 1;
  distanceCm: number;
  isIntrusion: boolean;
  createdAt: Date;
}

const readingSchema = new Schema<IReading>(
  {
    deviceId: { type: String, required: true },
    motionDetected: { type: Number, enum: [0, 1], required: true },
    distanceCm: { type: Number, required: true },
    isIntrusion: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ReadingModel = model<IReading>('Reading', readingSchema);
