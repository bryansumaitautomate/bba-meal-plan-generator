import { describe, it, expect } from 'vitest'
import { calcBMR, calcTDEE, calcDailyTargets, ACTIVITY_FACTOR } from '@/lib/calc'

describe('calcBMR (Mifflin-St Jeor)', () => {
  it('male: 10*kg + 6.25*cm - 5*age + 5', () => {
    // 80kg, 180cm, 30y -> 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calcBMR({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 })).toBe(1780)
  })

  it('female: 10*kg + 6.25*cm - 5*age - 161', () => {
    // 65kg, 165cm, 30y -> 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25 -> 1370
    expect(calcBMR({ sex: 'female', weightKg: 65, heightCm: 165, age: 30 })).toBe(1370)
  })
})

describe('calcTDEE', () => {
  it('multiplies BMR by activity factor', () => {
    // BMR 1780, moderate (1.55) -> 2759
    expect(calcTDEE(1780, 'moderate')).toBe(2759)
  })

  it('matches activity table values', () => {
    expect(ACTIVITY_FACTOR.sedentary).toBe(1.2)
    expect(ACTIVITY_FACTOR.light).toBe(1.375)
    expect(ACTIVITY_FACTOR.moderate).toBe(1.55)
    expect(ACTIVITY_FACTOR.active).toBe(1.725)
    expect(ACTIVITY_FACTOR.very_active).toBe(1.9)
  })
})

describe('calcDailyTargets', () => {
  it('cut: TDEE - 500, protein 1g per pound (2.2g/kg)', () => {
    // 80kg male, 180cm, 30y, moderate activity, cut
    // BMR 1780, TDEE 1780*1.55 = 2759, cut = 2759 - 500 = 2259
    // Protein: 2.2 * 80 = 176
    const t = calcDailyTargets({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activityLevel: 'moderate', goal: 'cut' })
    expect(t.calories).toBe(2259)
    expect(t.protein).toBe(176)
  })

  it('maintain: TDEE unchanged, protein 1g per kg * 1.8', () => {
    const t = calcDailyTargets({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activityLevel: 'moderate', goal: 'maintain' })
    expect(t.calories).toBe(2759)
    expect(t.protein).toBe(144) // 1.8 * 80
  })

  it('gain: TDEE + 400, protein 2g/kg', () => {
    const t = calcDailyTargets({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, activityLevel: 'moderate', goal: 'gain' })
    expect(t.calories).toBe(3159) // 2759 + 400
    expect(t.protein).toBe(160) // 2.0 * 80
  })

  it('floors calories at 1200', () => {
    // very small + sedentary + cut should not push under 1200
    const t = calcDailyTargets({ sex: 'female', weightKg: 45, heightCm: 150, age: 60, activityLevel: 'sedentary', goal: 'cut' })
    expect(t.calories).toBeGreaterThanOrEqual(1200)
  })
})
