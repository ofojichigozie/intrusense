import 'dotenv/config';
import * as readline from 'readline';
import mongoose from 'mongoose';

import { connectDatabase } from '../config/database';
import { seedAdmin } from './admin.seeder';
import { seedReadings } from './readings.seeder';
import { seedSettings } from './settings.seeder';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

const menu = `
┌─────────────────────────────────┐
│    IntruSense Database Seeder   │
├─────────────────────────────────┤
│  1  Seed admin account          │
│  2  Seed sample readings        │
│  3  Seed default settings       │
│  4  Seed everything             │
│  0  Exit                        │
└─────────────────────────────────┘
`;

const run = async () => {
  console.log(menu);
  const choice = (await ask('Select an option: ')).trim();

  if (choice === '0') {
    console.log('Exiting.');
    rl.close();
    return;
  }

  const seedAdminFlag = choice === '1' || choice === '4';
  const seedReadingsFlag = choice === '2' || choice === '4';
  const seedSettingsFlag = choice === '3' || choice === '4';

  if (!seedAdminFlag && !seedReadingsFlag && !seedSettingsFlag) {
    console.log('Invalid option. Exiting.');
    rl.close();
    return;
  }

  try {
    await connectDatabase();

    if (seedAdminFlag) await seedAdmin();
    if (seedReadingsFlag) await seedReadings();
    if (seedSettingsFlag) await seedSettings();

    console.log('\nDone!');
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

run();
