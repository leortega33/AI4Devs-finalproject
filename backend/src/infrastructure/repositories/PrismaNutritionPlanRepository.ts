import { PrismaClient, Prisma } from '@prisma/client';
import { NutritionPlan } from '../../domain/models/NutritionPlan';
import {
  NutritionPlanRepository,
  NutritionPlanInput,
  NutritionPlanVersionRecord,
} from '../../domain/repositories/NutritionPlanRepository';

const nestedInclude = {
  meals: {
    orderBy: { order: 'asc' as const },
    include: { items: { orderBy: { order: 'asc' as const } } },
  },
} satisfies Prisma.NutritionPlanInclude;

type PlanRecord = Prisma.NutritionPlanGetPayload<{ include: typeof nestedInclude }>;

function toDomain(record: PlanRecord): NutritionPlan {
  return new NutritionPlan({
    id: record.id,
    clientId: record.clientId,
    dailyCalories: record.dailyCalories,
    proteinTargetG: record.proteinTargetG,
    generalNotes: record.generalNotes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    meals: record.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      note: meal.note,
      order: meal.order,
      items: meal.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        order: item.order,
      })),
    })),
  });
}

/** Builds the nested create payload for a plan's meals + food items. */
function mealsCreate(data: NutritionPlanInput): Prisma.NutritionMealCreateNestedManyWithoutNutritionPlanInput {
  return {
    create: data.meals.map((meal, mealIndex) => ({
      name: meal.name,
      note: meal.note ?? null,
      order: mealIndex,
      items: {
        create: meal.items.map((item, itemIndex) => ({
          description: item.description,
          quantity: item.quantity ?? null,
          order: itemIndex,
        })),
      },
    })),
  };
}

/** Serializable snapshot of the saved plan for the version history. */
function toSnapshot(data: NutritionPlanInput): Prisma.InputJsonValue {
  return {
    dailyCalories: data.dailyCalories ?? null,
    proteinTargetG: data.proteinTargetG ?? null,
    generalNotes: data.generalNotes ?? null,
    meals: data.meals.map((meal, mealIndex) => ({
      name: meal.name,
      note: meal.note ?? null,
      order: mealIndex,
      items: meal.items.map((item, itemIndex) => ({
        description: item.description,
        quantity: item.quantity ?? null,
        order: itemIndex,
      })),
    })),
  };
}

export class PrismaNutritionPlanRepository implements NutritionPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByClientId(clientId: number): Promise<NutritionPlan | null> {
    const record = await this.prisma.nutritionPlan.findUnique({
      where: { clientId },
      include: nestedInclude,
    });
    return record ? toDomain(record) : null;
  }

  async upsert(clientId: number, data: NutritionPlanInput): Promise<NutritionPlan> {
    const scalars = {
      dailyCalories: data.dailyCalories ?? null,
      proteinTargetG: data.proteinTargetG ?? null,
      generalNotes: data.generalNotes ?? null,
    };

    const record = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.nutritionPlan.findUnique({ where: { clientId }, select: { id: true } });
      if (existing) {
        // Replace the children: delete meals (cascades to items), then recreate.
        await tx.nutritionMeal.deleteMany({ where: { nutritionPlanId: existing.id } });
        await tx.nutritionPlan.update({
          where: { clientId },
          data: { ...scalars, meals: mealsCreate(data) },
        });
      } else {
        await tx.nutritionPlan.create({ data: { clientId, ...scalars, meals: mealsCreate(data) } });
      }
      await tx.nutritionPlanVersion.create({ data: { clientId, snapshot: toSnapshot(data) } });
      return tx.nutritionPlan.findUniqueOrThrow({ where: { clientId }, include: nestedInclude });
    });

    return toDomain(record);
  }

  async listVersionsByClientId(clientId: number): Promise<NutritionPlanVersionRecord[]> {
    const records = await this.prisma.nutritionPlanVersion.findMany({
      where: { clientId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return records.map((r) => ({ id: r.id, snapshot: r.snapshot, createdAt: r.createdAt }));
  }
}
