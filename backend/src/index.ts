import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { prisma } from './infrastructure/prismaClient';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaClientRepository } from './infrastructure/repositories/PrismaClientRepository';
import { PrismaMedicalRecordRepository } from './infrastructure/repositories/PrismaMedicalRecordRepository';
import { PrismaMedicalRecordVersionRepository } from './infrastructure/repositories/PrismaMedicalRecordVersionRepository';
import { PrismaAttendanceRepository } from './infrastructure/repositories/PrismaAttendanceRepository';
import { PrismaProgressEntryRepository } from './infrastructure/repositories/PrismaProgressEntryRepository';
import { PrismaProgressPhotoRepository } from './infrastructure/repositories/PrismaProgressPhotoRepository';
import { PrismaExerciseRepository } from './infrastructure/repositories/PrismaExerciseRepository';
import { PrismaRoutineTemplateRepository } from './infrastructure/repositories/PrismaRoutineTemplateRepository';
import { PrismaPaymentRepository } from './infrastructure/repositories/PrismaPaymentRepository';
import { PrismaDashboardRepository } from './infrastructure/repositories/PrismaDashboardRepository';
import { ConsoleEmailService } from './infrastructure/email/emailService';
import { ResendEmailService } from './infrastructure/email/resendEmailService';
import { LocalDiskPhotoStorage } from './infrastructure/storage/photoStorage';
import { PrismaNotificationLogRepository } from './infrastructure/repositories/PrismaNotificationLogRepository';
import { startReminderScheduler } from './infrastructure/reminderScheduler';
import { AuthService } from './application/services/authService';
import { ClientService } from './application/services/clientService';
import { MedicalRecordService } from './application/services/medicalRecordService';
import { MedicalFlagsService } from './application/services/medicalFlagsService';
import { AttendanceService } from './application/services/attendanceService';
import { ProgressService } from './application/services/progressService';
import { WarmupSuggestionService } from './application/services/warmupSuggestionService';
import { ExerciseService } from './application/services/exerciseService';
import { RoutineTemplateService } from './application/services/routineTemplateService';
import { ClientRoutineService } from './application/services/clientRoutineService';
import { PaymentService } from './application/services/paymentService';
import { DashboardService } from './application/services/dashboardService';
import { ReminderService } from './application/services/reminderService';
import { createAuthRoutes } from './routes/authRoutes';
import { createClientRoutes } from './routes/clientRoutes';
import { createMedicalRecordRoutes } from './routes/medicalRecordRoutes';
import { createMedicalFlagsRoutes } from './routes/medicalFlagsRoutes';
import { createClientAttendanceRoutes } from './routes/attendanceRoutes';
import { createClientProgressRoutes } from './routes/progressRoutes';
import { createWarmupSuggestionRoutes } from './routes/warmupSuggestionRoutes';
import { createExerciseRoutes } from './routes/exerciseRoutes';
import { createRoutineTemplateRoutes } from './routes/routineTemplateRoutes';
import { createClientRoutineRoutes } from './routes/clientRoutineRoutes';
import { createClientPaymentRoutes, createPaymentRoutes } from './routes/paymentRoutes';
import { createDashboardRoutes } from './routes/dashboardRoutes';
import { createReminderRoutes } from './routes/reminderRoutes';
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
const DASHBOARD_DUE_SOON_DAYS = Number(process.env.DASHBOARD_DUE_SOON_DAYS) || 5;
const REMINDERS_ENABLED = process.env.REMINDERS_ENABLED === 'true';
const REMINDER_CRON = process.env.REMINDER_CRON || '0 9 * * *';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REMINDER_FROM_EMAIL = process.env.REMINDER_FROM_EMAIL || 'no-reply@example.com';
const PHOTO_STORAGE_DIR = process.env.PHOTO_STORAGE_DIR || './uploads';

export function createApp() {
  const app = express();

  // Trust the reverse proxy / tunnel so `secure` cookies work behind HTTPS termination.
  app.set('trust proxy', 1);

  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const userRepository = new PrismaUserRepository(prisma);
  // Use Resend when an API key is configured; otherwise log emails (dev/no-op).
  const emailService = RESEND_API_KEY
    ? new ResendEmailService({ apiKey: RESEND_API_KEY, fromEmail: REMINDER_FROM_EMAIL })
    : new ConsoleEmailService();
  const authService = new AuthService(userRepository, emailService, JWT_SECRET, RESET_URL_BASE);

  const clientRepository = new PrismaClientRepository(prisma);
  const clientService = new ClientService(clientRepository);

  const attendanceRepository = new PrismaAttendanceRepository(prisma);
  const attendanceService = new AttendanceService(attendanceRepository, clientRepository);

  const progressEntryRepository = new PrismaProgressEntryRepository(prisma);
  const progressPhotoRepository = new PrismaProgressPhotoRepository(prisma);
  const photoStorage = new LocalDiskPhotoStorage(PHOTO_STORAGE_DIR);
  const progressService = new ProgressService(
    progressEntryRepository,
    clientRepository,
    progressPhotoRepository,
    photoStorage,
  );

  const medicalRecordRepository = new PrismaMedicalRecordRepository(prisma);
  const medicalRecordVersionRepository = new PrismaMedicalRecordVersionRepository(prisma);
  const medicalRecordService = new MedicalRecordService(
    medicalRecordRepository,
    clientRepository,
    medicalRecordVersionRepository,
  );
  const medicalFlagsService = new MedicalFlagsService(medicalRecordRepository, clientRepository);

  const exerciseRepository = new PrismaExerciseRepository(prisma);
  const exerciseService = new ExerciseService(exerciseRepository);
  const warmupSuggestionService = new WarmupSuggestionService(medicalFlagsService, exerciseRepository);

  const routineTemplateRepository = new PrismaRoutineTemplateRepository(prisma);
  const routineTemplateService = new RoutineTemplateService(routineTemplateRepository, exerciseRepository);
  const clientRoutineService = new ClientRoutineService(
    routineTemplateRepository,
    clientRepository,
    exerciseRepository,
  );

  const paymentRepository = new PrismaPaymentRepository(prisma);
  const paymentService = new PaymentService(paymentRepository, clientRepository);

  const dashboardRepository = new PrismaDashboardRepository(prisma);
  const dashboardService = new DashboardService(dashboardRepository);

  const notificationLogRepository = new PrismaNotificationLogRepository(prisma);
  const reminderService = new ReminderService(
    dashboardService,
    clientRepository,
    notificationLogRepository,
    emailService,
  );

  app.use('/api/auth', createAuthRoutes(authService, JWT_SECRET));
  app.use('/api/clients', createClientRoutes(clientService, JWT_SECRET));
  app.use(
    '/api/clients/:clientId/medical-record',
    createMedicalRecordRoutes(medicalRecordService, JWT_SECRET),
  );
  app.use(
    '/api/clients/:clientId/medical-flags',
    createMedicalFlagsRoutes(medicalFlagsService, JWT_SECRET),
  );
  app.use(
    '/api/clients/:clientId/warmup-suggestions',
    createWarmupSuggestionRoutes(warmupSuggestionService, JWT_SECRET),
  );
  app.use(
    '/api/clients/:clientId/attendance',
    createClientAttendanceRoutes(attendanceService, JWT_SECRET),
  );
  app.use(
    '/api/clients/:clientId/progress',
    createClientProgressRoutes(progressService, JWT_SECRET),
  );
  app.use('/api/clients/:clientId', createClientRoutineRoutes(clientRoutineService, JWT_SECRET));
  app.use('/api/clients/:clientId/payments', createClientPaymentRoutes(paymentService, JWT_SECRET));
  app.use('/api/payments', createPaymentRoutes(paymentService, JWT_SECRET));
  app.use('/api/exercises', createExerciseRoutes(exerciseService, JWT_SECRET));
  app.use('/api/routine-templates', createRoutineTemplateRoutes(routineTemplateService, JWT_SECRET));
  app.use('/api/dashboard', createDashboardRoutes(dashboardService, JWT_SECRET, DASHBOARD_DUE_SOON_DAYS));
  app.use('/api/reminders', createReminderRoutes(reminderService, JWT_SECRET));

  // Opt-in scheduled reminders (disabled by default).
  if (REMINDERS_ENABLED) {
    startReminderScheduler(reminderService, REMINDER_CRON);
  }

  // Any unmatched API route returns a JSON 404 (never the SPA fallback below).
  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  });

  // Single-origin serving: the backend serves the built frontend so the
  // httpOnly/secure/sameSite=strict session cookie stays same-site (deployment).
  if (process.env.SERVE_FRONTEND === 'true') {
    const clientDist = process.env.CLIENT_DIST || path.resolve(__dirname, '../public');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}
