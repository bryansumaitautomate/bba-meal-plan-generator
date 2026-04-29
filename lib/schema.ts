import { z } from 'zod'

export const Intake = z.object({
  goal: z.enum(['cut', 'maintain', 'bulk']),
  calories: z.number().int().min(1200).max(5000),
  protein: z.number().int().min(50).max(400),
  allergies: z.string().max(500).default(''),
  trainingDays: z.number().int().min(0).max(7),
  dietStyle: z.enum(['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo']),
  cuisines: z.array(z.enum(['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'])).default([]),
  dislikes: z.string().max(500).default(''),
})

export type IntakeInput = z.infer<typeof Intake>

export const Meal = z.object({
  slot: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  name: z.string().min(1),
  calories: z.number().int(),
  protein: z.number().int(),
  carbs: z.number().int(),
  fat: z.number().int(),
  ingredients: z.array(z.string()),
})

export const DayName = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])

export const Day = z.object({
  name: DayName,
  meals: z.array(Meal).length(4),
  totals: z.object({
    calories: z.number().int(),
    protein: z.number().int(),
    carbs: z.number().int(),
    fat: z.number().int(),
  }),
})

export const Plan = z.object({
  coachNote: z.string().min(1),
  days: z.array(Day).length(7),
})

export type MealType = z.infer<typeof Meal>
export type DayType = z.infer<typeof Day>
export type PlanType = z.infer<typeof Plan>
