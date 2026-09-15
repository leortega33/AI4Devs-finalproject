import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base exercise catalog seeded on first run (US-004). Content in Spanish (the
// trainer's language); extendable over time.
const BASE_EXERCISES = [
  { name: 'Movilidad de cadera', muscleGroup: 'Cadera', category: 'mobility' as const },
  { name: 'Movilidad de hombro', muscleGroup: 'Hombros', category: 'mobility' as const },
  { name: 'Movilidad torácica', muscleGroup: 'Espalda alta', category: 'mobility' as const },
  { name: 'Puente de glúteos', muscleGroup: 'Glúteos', category: 'activation' as const, defaultSets: 3, defaultReps: 15 },
  { name: 'Caminata lateral con banda', muscleGroup: 'Glúteos', category: 'activation' as const, defaultSets: 3, defaultReps: 12 },
  { name: 'Plancha', muscleGroup: 'Core', category: 'activation' as const, defaultSets: 3 },
  { name: 'Sentadilla', muscleGroup: 'Piernas', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barra' },
  { name: 'Peso muerto', muscleGroup: 'Cadena posterior', category: 'main' as const, defaultSets: 4, defaultReps: 6, equipment: 'Barra' },
  { name: 'Press de banca', muscleGroup: 'Pecho', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barra' },
  { name: 'Remo con barra', muscleGroup: 'Espalda', category: 'main' as const, defaultSets: 4, defaultReps: 10, equipment: 'Barra' },
  { name: 'Press militar', muscleGroup: 'Hombros', category: 'main' as const, defaultSets: 4, defaultReps: 8, equipment: 'Barra' },
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
