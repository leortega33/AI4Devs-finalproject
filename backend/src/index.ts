import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { prisma } from './infrastructure/prismaClient';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaClientRepository } from './infrastructure/repositories/PrismaClientRepository';
import { PrismaMedicalRecordRepository } from './infrastructure/repositories/PrismaMedicalRecordRepository';
import { PrismaExerciseRepository } from './infrastructure/repositories/PrismaExerciseRepository';
import { PrismaRoutineTemplateRepository } from './infrastructure/repositories/PrismaRoutineTemplateRepository';
import { ConsoleEmailService } from './infrastructure/email/emailService';
import { AuthService } from './application/services/authService';
import { ClientService } from './application/services/clientService';
import { MedicalRecordService } from './application/services/medicalRecordService';
import { ExerciseService } from './application/services/exerciseService';
import { RoutineTemplateService } from './application/services/routineTemplateService';
import { createAuthRoutes } from './routes/authRoutes';
import { createClientRoutes } from './routes/clientRoutes';
import { createMedicalRecordRoutes } from './routes/medicalRecordRoutes';
import { createExerciseRoutes } from './routes/exerciseRoutes';
import { createRoutineTemplateRoutes } from './routes/routineTemplateRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './infrastructure/logger';

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RESET_URL_BASE = `${FRONTEND_URL}/reset-password`;

export function createApp() {
  const app = express();

  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  const userRepository = new PrismaUserRepository(prisma);
  const emailService = new ConsoleEmailService();
  const authService = new AuthService(userRepository, emailService, JWT_SECRET, RESET_URL_BASE);

  const clientRepository = new PrismaClientRepository(prisma);
  const clientService = new ClientService(clientRepository);

  const medicalRecordRepository = new PrismaMedicalRecordRepository(prisma);
  const medicalRecordService = new MedicalRecordService(medicalRecordRepository, clientRepository);

  const exerciseRepository = new PrismaExerciseRepository(prisma);
  const exerciseService = new ExerciseService(exerciseRepository);

  const routineTemplateRepository = new PrismaRoutineTemplateRepository(prisma);
  const routineTemplateService = new RoutineTemplateService(routineTemplateRepository, exerciseRepository);

  app.use('/api/auth', createAuthRoutes(authService, JWT_SECRET));
  app.use('/api/clients', createClientRoutes(clientService, JWT_SECRET));
  app.use(
    '/api/clients/:clientId/medical-record',
    createMedicalRecordRoutes(medicalRecordService, JWT_SECRET),
  );
  app.use('/api/exercises', createExerciseRoutes(exerciseService, JWT_SECRET));
  app.use('/api/routine-templates', createRoutineTemplateRoutes(routineTemplateService, JWT_SECRET));

  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}
