-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('payment_overdue', 'payment_due_soon', 'routine_expiring');

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "referenceKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_clientId_type_referenceKey_key" ON "NotificationLog"("clientId", "type", "referenceKey");

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
