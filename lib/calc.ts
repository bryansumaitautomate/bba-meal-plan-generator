import type { z } from 'zod'
import type { ActivityLevel as ActivityLevelSchema, Goal as GoalSchema, Sex as SexSchema } from './schema'

type ActivityLevelType = z.infer<typeof ActivityLevelSchema>
type GoalType = z.infer<typeof GoalSchema>
type SexType = z.infer<typeof SexSchema>

export const ACTIVITY_FACTOR: Record<ActivityLevelType, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

interface BMRArgs {
  sex: SexType
  weightKg: number
  heightCm: number
  age: number
}

/**
 * Mifflin-St Jeor BMR.
 *   male:   10*kg + 6.25*cm - 5*age + 5
 *   female: 10*kg + 6.25*cm - 5*age - 161
 * Returned as a rounded integer.
 */
export function calcBMR({ sex, weightKg, heightCm, age }: BMRArgs): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const adjusted = sex === 'male' ? base + 5 : base - 161
  return Math.round(adjusted)
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevelType): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activityLevel])
}

interface DailyTargetArgs extends BMRArgs {
  activityLevel: ActivityLevelType
  goal: GoalType
}

interface DailyTargets {
  bmr: number
  tdee: number
  calories: number
  protein: number
}

/**
 * Goal adjustment + protein target heuristics:
 *   cut      = TDEE - 500     | protein = 2.2 g/kg (preserve lean mass on deficit)
 *   maintain = TDEE           | protein = 1.8 g/kg
 *   gain     = TDEE + 400     | protein = 2.0 g/kg
 * Calories floored at 1200 to stay safe.
 */
export function calcDailyTargets(args: DailyTargetArgs): DailyTargets {
  const bmr = calcBMR(args)
  const tdee = calcTDEE(bmr, args.activityLevel)

  const calOffset: Record<GoalType, number> = { cut: -500, maintain: 0, gain: 400 }
  const proteinPerKg: Record<GoalType, number> = { cut: 2.2, maintain: 1.8, gain: 2.0 }

  const calories = Math.max(1200, tdee + calOffset[args.goal])
  const protein = Math.round(proteinPerKg[args.goal] * args.weightKg)

  return { bmr, tdee, calories, protein }
}
