import { describe, it, expect } from 'vitest'
import { Intake, MemberIntake, Plan, Lead } from '@/lib/schema'

describe('Intake schema (non-member)', () => {
  it('accepts a complete valid intake', () => {
    const result = Intake.safeParse({
      goal: 'cut',
      calories: 2000,
      protein: 180,
      mealsPerDay: 4,
      fastBreakfast: false,
      allergies: 'peanuts',
      trainingDays: 4,
      dietStyle: 'omnivore',
      cuisines: ['Italian', 'Mediterranean'],
      dislikes: 'mushrooms',
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for optional fields including mealsPerDay and fastBreakfast', () => {
    const result = Intake.parse({
      goal: 'maintain',
      calories: 2200,
      protein: 150,
      trainingDays: 3,
      dietStyle: 'omnivore',
    })
    expect(result.allergies).toBe('')
    expect(result.dislikes).toBe('')
    expect(result.cuisines).toEqual([])
    expect(result.mealsPerDay).toBe(4)
    expect(result.fastBreakfast).toBe(false)
  })

  it('rejects calories below 1200', () => {
    const result = Intake.safeParse({
      goal: 'cut', calories: 800, protein: 150, trainingDays: 4, dietStyle: 'omnivore',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown goal value', () => {
    const result = Intake.safeParse({
      goal: 'shred', calories: 2000, protein: 150, trainingDays: 4, dietStyle: 'omnivore',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mealsPerDay outside 3-5', () => {
    const result = Intake.safeParse({
      goal: 'cut', calories: 2000, protein: 150, mealsPerDay: 6, trainingDays: 4, dietStyle: 'omnivore',
    })
    expect(result.success).toBe(false)
  })
})

describe('MemberIntake schema (3-step flow)', () => {
  it('accepts a complete member intake', () => {
    const result = MemberIntake.safeParse({
      sex: 'male',
      age: 42,
      heightCm: 180,
      weightKg: 95,
      activityLevel: 'moderate',
      goal: 'cut',
      mealsPerDay: 4,
      fastBreakfast: false,
      dietStyle: 'omnivore',
    })
    expect(result.success).toBe(true)
  })

  it('rejects out-of-range age', () => {
    const result = MemberIntake.safeParse({
      sex: 'male', age: 12, heightCm: 180, weightKg: 95, activityLevel: 'moderate', goal: 'cut',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown activity level', () => {
    const result = MemberIntake.safeParse({
      sex: 'male', age: 40, heightCm: 180, weightKg: 95, activityLevel: 'extreme', goal: 'cut',
    })
    expect(result.success).toBe(false)
  })
})

describe('Plan schema', () => {
  const buildDay = (name: string) => ({
    name,
    meals: [
      { slot: 'Breakfast', name: 'Oats', calories: 400, protein: 25, carbs: 50, fat: 10, ingredients: ['oats', 'milk'] },
      { slot: 'Lunch', name: 'Chicken bowl', calories: 600, protein: 50, carbs: 60, fat: 15, ingredients: ['chicken'] },
      { slot: 'Dinner', name: 'Salmon plate', calories: 700, protein: 55, carbs: 50, fat: 25, ingredients: ['salmon'] },
      { slot: 'Snack', name: 'Greek yogurt', calories: 200, protein: 20, carbs: 15, fat: 5, ingredients: ['yogurt'] },
    ],
    totals: { calories: 1900, protein: 150, carbs: 175, fat: 55 },
  })

  it('accepts a valid 7-day plan with shopping list', () => {
    const result = Plan.safeParse({
      coachNote: "Right. One week. No BS. Let's go.",
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(buildDay),
      shoppingList: [
        { category: 'Produce', items: ['spinach', 'tomatoes'] },
        { category: 'Proteins', items: ['chicken breast', 'salmon'] },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a plan with no shopping list', () => {
    const result = Plan.safeParse({
      coachNote: 'x',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(buildDay),
    })
    expect(result.success).toBe(false)
  })

  it('rejects a plan with fewer than 7 days', () => {
    const result = Plan.safeParse({ coachNote: 'x', days: [], shoppingList: [{ category: 'Pantry', items: ['salt'] }] })
    expect(result.success).toBe(false)
  })

  it('accepts a day with 3 meals (low meal count)', () => {
    const day3 = (name: string) => ({
      name,
      meals: [
        { slot: 'Breakfast', name: 'Oats', calories: 500, protein: 30, carbs: 60, fat: 12, ingredients: ['oats'] },
        { slot: 'Lunch', name: 'Bowl', calories: 700, protein: 55, carbs: 70, fat: 18, ingredients: ['chicken'] },
        { slot: 'Dinner', name: 'Plate', calories: 800, protein: 60, carbs: 60, fat: 28, ingredients: ['salmon'] },
      ],
      totals: { calories: 2000, protein: 145, carbs: 190, fat: 58 },
    })
    const result = Plan.safeParse({
      coachNote: 'Three squares. Nothing in between.',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day3),
      shoppingList: [{ category: 'Proteins', items: ['chicken'] }],
    })
    expect(result.success).toBe(true)
  })
})

describe('Lead schema', () => {
  it('accepts a valid email + phone', () => {
    const result = Lead.safeParse({ email: 'jase@bba.com', phone: '+61400000000' })
    expect(result.success).toBe(true)
  })

  it('rejects malformed email', () => {
    const result = Lead.safeParse({ email: 'not-an-email', phone: '+61400000000' })
    expect(result.success).toBe(false)
  })

  it('rejects too-short phone', () => {
    const result = Lead.safeParse({ email: 'a@b.co', phone: '12' })
    expect(result.success).toBe(false)
  })
})
