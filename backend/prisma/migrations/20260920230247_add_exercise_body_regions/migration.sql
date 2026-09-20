-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "bodyRegions" TEXT[] DEFAULT ARRAY[]::TEXT[];
