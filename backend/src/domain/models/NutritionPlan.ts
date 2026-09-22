export interface NutritionFoodItemProps {
  id?: number;
  description: string;
  quantity?: string | null;
  order: number;
}

export interface NutritionMealProps {
  id?: number;
  name: string;
  note?: string | null;
  order: number;
  items: NutritionFoodItemProps[];
}

export interface NutritionPlanProps {
  id?: number;
  clientId: number;
  dailyCalories?: number | null;
  proteinTargetG?: number | null;
  generalNotes?: string | null;
  meals: NutritionMealProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** A single food item within a meal (see US-027). */
export class NutritionFoodItem {
  readonly id?: number;
  readonly description: string;
  readonly quantity: string | null;
  readonly order: number;

  constructor(props: NutritionFoodItemProps) {
    this.id = props.id;
    this.description = props.description;
    this.quantity = props.quantity ?? null;
    this.order = props.order;
  }
}

/** A meal within a nutrition plan, holding ordered food items (see US-027). */
export class NutritionMeal {
  readonly id?: number;
  readonly name: string;
  readonly note: string | null;
  readonly order: number;
  readonly items: NutritionFoodItem[];

  constructor(props: NutritionMealProps) {
    this.id = props.id;
    this.name = props.name;
    this.note = props.note ?? null;
    this.order = props.order;
    this.items = props.items.map((item) => new NutritionFoodItem(item));
  }
}

/** A client's structured nutrition plan: ordered meals + optional targets (see US-027). */
export class NutritionPlan {
  readonly id?: number;
  readonly clientId: number;
  readonly dailyCalories: number | null;
  readonly proteinTargetG: number | null;
  readonly generalNotes: string | null;
  readonly meals: NutritionMeal[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: NutritionPlanProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.dailyCalories = props.dailyCalories ?? null;
    this.proteinTargetG = props.proteinTargetG ?? null;
    this.generalNotes = props.generalNotes ?? null;
    this.meals = props.meals.map((meal) => new NutritionMeal(meal));
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
