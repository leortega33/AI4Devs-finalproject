-- CreateEnum
CREATE TYPE "RoutineStatus" AS ENUM ('draft', 'active', 'expired');

-- CreateEnum
CREATE TYPE "RoutinePhase" AS ENUM ('warmup', 'main');

-- CreateTable
CREATE TABLE "RoutineTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "generalConsiderations" TEXT,
    "clientId" INTEGER,
    "sourceTemplateId" INTEGER,
    "startDate" TIMESTAMP(3),
    "durationWeeks" INTEGER,
    "status" "RoutineStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineSession" (
    "id" SERIAL NOT NULL,
    "routineTemplateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "warmupPrescription" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoutineSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineExerciseEntry" (
    "id" SERIAL NOT NULL,
    "routineSessionId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "phase" "RoutinePhase" NOT NULL,
    "block" TEXT,
    "kg" DOUBLE PRECISION,
    "reps" INTEGER,
    "series" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoutineExerciseEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoutineTemplate" ADD CONSTRAINT "RoutineTemplate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineTemplate" ADD CONSTRAINT "RoutineTemplate_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "RoutineTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineSession" ADD CONSTRAINT "RoutineSession_routineTemplateId_fkey" FOREIGN KEY ("routineTemplateId") REFERENCES "RoutineTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExerciseEntry" ADD CONSTRAINT "RoutineExerciseEntry_routineSessionId_fkey" FOREIGN KEY ("routineSessionId") REFERENCES "RoutineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExerciseEntry" ADD CONSTRAINT "RoutineExerciseEntry_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
