-- CreateTable
CREATE TABLE "NutritionPlan" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "dailyCalories" INTEGER,
    "proteinTargetG" INTEGER,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionMeal" (
    "id" SERIAL NOT NULL,
    "nutritionPlanId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "NutritionMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionFoodItem" (
    "id" SERIAL NOT NULL,
    "nutritionMealId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "NutritionFoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionPlanVersion" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionPlan_clientId_key" ON "NutritionPlan"("clientId");

-- CreateIndex
CREATE INDEX "NutritionMeal_nutritionPlanId_idx" ON "NutritionMeal"("nutritionPlanId");

-- CreateIndex
CREATE INDEX "NutritionFoodItem_nutritionMealId_idx" ON "NutritionFoodItem"("nutritionMealId");

-- CreateIndex
CREATE INDEX "NutritionPlanVersion_clientId_createdAt_idx" ON "NutritionPlanVersion"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "NutritionPlan" ADD CONSTRAINT "NutritionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionMeal" ADD CONSTRAINT "NutritionMeal_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionFoodItem" ADD CONSTRAINT "NutritionFoodItem_nutritionMealId_fkey" FOREIGN KEY ("nutritionMealId") REFERENCES "NutritionMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionPlanVersion" ADD CONSTRAINT "NutritionPlanVersion_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
