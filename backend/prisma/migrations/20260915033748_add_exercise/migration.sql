-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('mobility', 'activation', 'main');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "defaultSets" INTEGER,
    "defaultReps" INTEGER,
    "technique" TEXT,
    "equipment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);
