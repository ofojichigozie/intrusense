import { AdminModel } from '../models/admin.model';

const ADMIN_SEED_DATA = [
  {
    username: 'intruadmin',
    email: 'admin@intrusense.dev',
    password: 'Admin@Pass123',
    role: 'admin' as const,
  },
];

export async function seedAdmin(): Promise<void> {
  console.log('[Seeder:Admin] Seeding admin accounts...');

  for (const data of ADMIN_SEED_DATA) {
    const exists = await AdminModel.findOne({ email: data.email });
    if (exists) {
      console.log(`[Seeder:Admin] ${data.email} already exists — skipping`);
      continue;
    }
    // Password is hashed by the pre-save hook on AdminModel
    await AdminModel.create(data);
    console.log(`[Seeder:Admin] Created admin: ${data.email}`);
  }

  console.log('[Seeder:Admin] Done');
}
