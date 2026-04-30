import { z } from 'zod'

// ────────────────────────────────────────────────────────────
// Shared option enums (kept aligned with form UI)
// ────────────────────────────────────────────────────────────

export const DietStyle = z.enum(['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'])
export const Cuisine = z.enum(['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'])
export const Goal = z.enum(['cut', 'maintain', 'gain'])
export const ActivityLevel = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
export const Sex = z.enum(['male', 'female'])
export const MealsPerDay = z.union([z.literal(3), z.literal(4), z.literal(5)])

// ────────────────────────────────────────────────────────────
// Non-member intake (lead-magnet form)
// User enters their own calorie + protein numbers
// ────────────────────────────────────────────────────────────

export const Intake = z.object({
  goal: Goal,
  calories: z.number().int().min(1200).max(5000),
  protein: z.number().int().min(50).max(400),
  mealsPerDay: MealsPerDay.default(4),
  fastBreakfast: z.boolean().default(false),
  allergies: z.string().max(500).default(''),
  trainingDays: z.number().int().min(0).max(7),
  dietStyle: DietStyle,
  cuisines: z.array(Cuisine).default([]),
  dislikes: z.string().max(500).default(''),
})

export type IntakeInput = z.infer<typeof Intake>

// ────────────────────────────────────────────────────────────
// Member intake (3-step flow)
// System auto-calculates calories + protein via Mifflin-St Jeor
// ────────────────────────────────────────────────────────────

export const MemberIntake = z.object({
  sex: Sex,
  age: z.number().int().min(16).max(99),
  heightCm: z.number().int().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  activityLevel: ActivityLevel,
  goal: Goal,
  mealsPerDay: MealsPerDay.default(4),
  fastBreakfast: z.boolean().default(false),
  allergies: z.string().max(500).default(''),
  dietStyle: DietStyle.default('omnivore'),
  cuisines: z.array(Cuisine).default([]),
  dislikes: z.string().max(500).default(''),
})

export type MemberIntakeInput = z.infer<typeof MemberIntake>

// ────────────────────────────────────────────────────────────
// Plan output
// ────────────────────────────────────────────────────────────

export const Meal = z.object({
  slot: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snack 2']),
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
  meals: z.array(Meal).min(3).max(5),
  totals: z.object({
    calories: z.number().int(),
    protein: z.number().int(),
    carbs: z.number().int(),
    fat: z.number().int(),
  }),
})

export const ShoppingCategory = z.enum([
  'Produce',
  'Proteins',
  'Grains & Carbs',
  'Dairy & Eggs',
  'Pantry',
  'Other',
])

export const ShoppingSection = z.object({
  category: ShoppingCategory,
  items: z.array(z.string().min(1)).min(1),
})

export const Plan = z.object({
  coachNote: z.string().min(1),
  days: z.array(Day).length(7),
  shoppingList: z.array(ShoppingSection).min(1),
})

export type MealType = z.infer<typeof Meal>
export type DayType = z.infer<typeof Day>
export type PlanType = z.infer<typeof Plan>
export type ShoppingSectionType = z.infer<typeof ShoppingSection>

// ────────────────────────────────────────────────────────────
// Lead capture (non-member email + phone)
// ────────────────────────────────────────────────────────────

export const Lead = z.object({
  email: z.string().email().max(200),
  phone: z.string().min(7).max(30),
  consentToContact: z.boolean().default(true),
})

export type LeadInput = z.infer<typeof Lead>
