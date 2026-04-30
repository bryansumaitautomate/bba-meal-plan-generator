import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import type { IntakeInput } from '@/lib/schema'

const sampleIntake: IntakeInput = {
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
}

describe('buildSystemPrompt', () => {
  it('mentions Jase Stuart and Better Body Academy', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain('Jase Stuart')
    expect(prompt).toContain('Better Body Academy')
  })

  it('includes the no-dashes rule', () => {
    const prompt = buildSystemPrompt()
    expect(prompt.toLowerCase()).toContain('never use dashes')
  })

  it('specifies strict JSON output with coachNote and days', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain('coachNote')
    expect(prompt).toContain('days')
  })

  it('specifies 7 days, 4 meals per day', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toMatch(/7 days/i)
    expect(prompt).toMatch(/4 entries|4 meals|3 meals plus 1 snack/i)
  })
})

describe('buildUserPrompt', () => {
  it('interpolates all intake fields', () => {
    const prompt = buildUserPrompt(sampleIntake)
    expect(prompt).toContain('cut')
    expect(prompt).toContain('2000')
    expect(prompt).toContain('180')
    expect(prompt).toContain('peanuts')
    expect(prompt).toContain('omnivore')
    expect(prompt).toContain('Italian')
    expect(prompt).toContain('Mediterranean')
    expect(prompt).toContain('mushrooms')
  })

  it('handles empty allergies and dislikes gracefully', () => {
    const prompt = buildUserPrompt({ ...sampleIntake, allergies: '', dislikes: '' })
    expect(prompt).toMatch(/allergies:\s*none/i)
    expect(prompt).toMatch(/dislikes:\s*none/i)
  })

  it('handles empty cuisines as no preference', () => {
    const prompt = buildUserPrompt({ ...sampleIntake, cuisines: [] })
    expect(prompt).toMatch(/cuisines:\s*no preference/i)
  })

  it('includes meals per day', () => {
    const prompt = buildUserPrompt({ ...sampleIntake, mealsPerDay: 5 })
    expect(prompt).toMatch(/meals per day:\s*5/i)
  })

  it('reflects fastBreakfast=true with skip-breakfast wording', () => {
    const prompt = buildUserPrompt({ ...sampleIntake, fastBreakfast: true })
    expect(prompt.toLowerCase()).toContain('skip breakfast')
  })
})

describe('buildSystemPrompt — shopping list', () => {
  it('mentions categorized shopping list output', () => {
    const prompt = buildSystemPrompt()
    expect(prompt.toLowerCase()).toContain('shoppinglist')
    expect(prompt).toContain('Produce')
    expect(prompt).toContain('Proteins')
    expect(prompt).toContain('Pantry')
  })

  it('mentions meal slot variability and Snack 2', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain('Snack 2')
    expect(prompt.toLowerCase()).toContain('meal count per day is variable')
  })
})
