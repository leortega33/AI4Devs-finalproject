import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base exercise catalog seeded on first run (US-004). Extendable over time.
const BASE_EXERCISES = [
  { name: 'Hip mobility drill', muscleGroup: 'Hips', category: 'mobility' as const },
  { name: 'Shoulder mobility drill', muscleGroup: 'Shoulders', category: 'mobility' as const },
  { name: 'Thoracic mobility drill', muscleGroup: 'Upper back', category: 'mobility' as const },
  { name: 'Glute bridge', muscleGroup: 'Glutes', category: 'activation' as const, defaultSets: 3, defaultReps: 15 },
  { name: 'Band lateral walk', muscleGroup: 'Glutes', category: 'activation' as const, defaultSets: 3, defaultReps: 12 },
  { name: 'Plank', muscleGroup: 'Core', category: 'activation' as const, defaultSets: 3 },
  { name: 'Back squat', muscleGroup: 'Legs', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barbell' },
  { name: 'Deadlift', muscleGroup: 'Posterior chain', category: 'main' as const, defaultSets: 4, defaultReps: 6, equipment: 'Barbell' },
  { name: 'Bench press', muscleGroup: 'Chest', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barbell' },
  { name: 'Bent-over row', muscleGroup: 'Back', category: 'main' as const, defaultSets: 4, defaultReps: 10, equipment: 'Barbell' },
  { name: 'Overhead press', muscleGroup: 'Shoulders', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barbell' },
];

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required to seed the admin user');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${user.email}`);

  // Idempotent find-or-create by name (name is not a unique column).
  let created = 0;
  for (const exercise of BASE_EXERCISES) {
    const existing = await prisma.exercise.findFirst({ where: { name: exercise.name } });
    if (!existing) {
      await prisma.exercise.create({ data: exercise });
      created += 1;
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded base exercise catalog: ${created} new, ${BASE_EXERCISES.length - created} already present`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
