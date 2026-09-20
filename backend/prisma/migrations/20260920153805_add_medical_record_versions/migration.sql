-- CreateTable
CREATE TABLE "MedicalRecordVersion" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "preexistingConditions" TEXT,
    "injuries" TEXT,
    "surgeriesOrProsthetics" TEXT,
    "physicalRestrictions" TEXT,
    "medication" TEXT,
    "allergies" TEXT,
    "bloodType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalRecordVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalRecordVersion_clientId_createdAt_idx" ON "MedicalRecordVersion"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "MedicalRecordVersion" ADD CONSTRAINT "MedicalRecordVersion_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
