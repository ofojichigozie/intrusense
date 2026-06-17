export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  telegramChatId?: string;
}

export interface Reading {
  _id: string;
  deviceId: string;
  motionDetected: 0 | 1;
  distanceCm: number;
  isIntrusion: boolean;
  createdAt: string;
}

export interface Settings {
  armed: boolean;
  distanceThresholdCm: number;
  alertCooldownMs: number;
}

export interface SystemStatus {
  settings: Settings;
  lastReading: Reading | null;
  lastIntrusion: Reading | null;
}

export interface PaginatedReadings {
  readings: Reading[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
