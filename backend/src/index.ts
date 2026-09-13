import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { prisma } from './infrastructure/prismaClient';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaClientRepository } from './infrastructure/repositories/PrismaClientRepository';
import { ConsoleEmailService } from './infrastructure/email/emailService';
import { AuthService } from './application/services/authService';
import { ClientService } from './application/services/clientService';
import { createAuthRoutes } from './routes/authRoutes';
import { createClientRoutes } from './routes/clientRoutes';
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

  app.use('/api/auth', createAuthRoutes(authService, JWT_SECRET));
  app.use('/api/clients', createClientRoutes(clientService, JWT_SECRET));

  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}
