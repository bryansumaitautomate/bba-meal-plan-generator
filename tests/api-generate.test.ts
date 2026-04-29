import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
vi.mock('@/lib/openai', () => ({
  getOpenAI: () => ({
    chat: { completions: { create: mockCreate } },
  }),
}))

import { POST } from '@/app/api/generate/route'

const validIntake = {
  goal: 'cut',
  calories: 2000,
  protein: 180,
  allergies: 'peanuts',
  trainingDays: 4,
  dietStyle: 'omnivore',
  cuisines: ['Italian'],
  dislikes: '',
}

const sampleDay = (name: string) => ({
  name,
  meals: [
    { slot: 'Breakfast', name: 'Oats', calories: 400, protein: 25, carbs: 50, fat: 10, ingredients: ['oats'] },
    { slot: 'Lunch', name: 'Chicken bowl', calories: 600, protein: 50, carbs: 60, fat: 15, ingredients: ['chicken'] },
    { slot: 'Dinner', name: 'Salmon plate', calories: 700, protein: 55, carbs: 50, fat: 25, ingredients: ['salmon'] },
    { slot: 'Snack', name: 'Greek yogurt', calories: 200, protein: 20, carbs: 15, fat: 5, ingredients: ['yogurt'] },
  ],
  totals: { calories: 1900, protein: 150, carbs: 175, fat: 55 },
})

const validPlan = {
  coachNote: "Right. One week. No BS. Let's go.",
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(sampleDay),
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('returns 400 on invalid intake', async () => {
    const res = await POST(makeRequest({ goal: 'shred', calories: 2000 }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with a valid plan when OpenAI returns valid JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validPlan) } }],
    })
    const res = await POST(makeRequest(validIntake))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.coachNote).toBe(validPlan.coachNote)
    expect(body.days).toHaveLength(7)
  })

  it('returns 500 when OpenAI returns malformed JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not json' } }],
    })
    const res = await POST(makeRequest(validIntake))
    expect(res.status).toBe(500)
  })

  it('returns 500 when OpenAI throws', async () => {
    mockCreate.mockRejectedValue(new Error('OpenAI down'))
    const res = await POST(makeRequest(validIntake))
    expect(res.status).toBe(500)
  })

  it('returns 500 when OpenAI returns JSON that fails Plan schema', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ coachNote: 'x', days: [] }) } }],
    })
    const res = await POST(makeRequest(validIntake))
    expect(res.status).toBe(500)
  })
})
