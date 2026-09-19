-- CreateTable
CREATE TABLE "RoutineExerciseWeek" (
    "id" SERIAL NOT NULL,
    "routineExerciseEntryId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "kg" DOUBLE PRECISION,
    "reps" INTEGER,
    "series" INTEGER,

    CONSTRAINT "RoutineExerciseWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutineExerciseWeek_routineExerciseEntryId_week_key" ON "RoutineExerciseWeek"("routineExerciseEntryId", "week");

-- AddForeignKey
ALTER TABLE "RoutineExerciseWeek" ADD CONSTRAINT "RoutineExerciseWeek_routineExerciseEntryId_fkey" FOREIGN KEY ("routineExerciseEntryId") REFERENCES "RoutineExerciseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
