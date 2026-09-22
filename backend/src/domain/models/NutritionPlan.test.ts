import { NutritionPlan } from './NutritionPlan';

describe('NutritionPlan domain model', () => {
  it('builds the plan graph with meals and food items', () => {
    const plan = new NutritionPlan({
      id: 1,
      clientId: 10,
      dailyCalories: 2200,
      proteinTargetG: 150,
      generalNotes: 'Beber 2L de agua',
      meals: [
        {
          id: 5,
          name: 'Desayuno',
          note: 'Antes de entrenar',
          order: 0,
          items: [{ id: 9, description: 'Avena', quantity: '80 g', order: 0 }],
        },
      ],
    });

    expect(plan.dailyCalories).toBe(2200);
    expect(plan.meals).toHaveLength(1);
    expect(plan.meals[0].name).toBe('Desayuno');
    expect(plan.meals[0].items[0].description).toBe('Avena');
    expect(plan.meals[0].items[0].quantity).toBe('80 g');
  });

  it('defaults optional fields to null', () => {
    const plan = new NutritionPlan({ clientId: 10, meals: [{ name: 'Cena', order: 0, items: [] }] });
    expect(plan.dailyCalories).toBeNull();
    expect(plan.proteinTargetG).toBeNull();
    expect(plan.generalNotes).toBeNull();
    expect(plan.meals[0].note).toBeNull();
    expect(plan.meals[0].items).toEqual([]);
  });
});
