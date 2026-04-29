import { describe, it, expect } from 'vitest'
import { Intake, Plan } from '@/lib/schema'

describe('Intake schema', () => {
  it('accepts a complete valid intake', () => {
    const result = Intake.safeParse({
      goal: 'cut',
      calories: 2000,
      protein: 180,
      allergies: 'peanuts',
      trainingDays: 4,
      dietStyle: 'omnivore',
      cuisines: ['Italian', 'Mediterranean'],
      dislikes: 'mushrooms',
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for optional string and array fields', () => {
    const result = Intake.parse({
      goal: 'maintain',
      calories: 2200,
      protein: 150,
      trainingDays: 3,
      dietStyle: 'vegetarian',
    })
    expect(result.allergies).toBe('')
    expect(result.dislikes).toBe('')
    expect(result.cuisines).toEqual([])
  })

  it('rejects calories below 1200', () => {
    const result = Intake.safeParse({
      goal: 'cut',
      calories: 800,
      protein: 150,
      trainingDays: 4,
      dietStyle: 'omnivore',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown goal value', () => {
    const result = Intake.safeParse({
      goal: 'shred',
      calories: 2000,
      protein: 150,
      trainingDays: 4,
      dietStyle: 'omnivore',
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

  it('accepts a valid 7-day plan', () => {
    const result = Plan.safeParse({
      coachNote: "Right. One week. No BS. Let's go.",
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(buildDay),
    })
    expect(result.success).toBe(true)
  })

  it('rejects a plan with fewer than 7 days', () => {
    const result = Plan.safeParse({ coachNote: 'x', days: [] })
    expect(result.success).toBe(false)
  })
})
