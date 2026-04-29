import { NextResponse } from 'next/server'
import { Intake, Plan } from '@/lib/schema'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import { getOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const intakeResult = Intake.safeParse(body)
  if (!intakeResult.success) {
    return NextResponse.json(
      { error: 'Invalid intake', issues: intakeResult.error.issues },
      { status: 400 },
    )
  }
  const intake = intakeResult.data

  let rawContent: string | null = null
  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.8,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(intake) },
      ],
    })
    rawContent = completion.choices[0]?.message?.content ?? null
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown OpenAI error'
    return NextResponse.json({ error: 'Generation failed. Try again.', detail: message }, { status: 500 })
  }

  if (!rawContent) {
    return NextResponse.json({ error: 'Empty response from model' }, { status: 500 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawContent)
  } catch {
    return NextResponse.json({ error: 'Model returned invalid JSON' }, { status: 500 })
  }

  const planResult = Plan.safeParse(parsed)
  if (!planResult.success) {
    return NextResponse.json({ error: 'Model returned a malformed plan' }, { status: 500 })
  }

  return NextResponse.json(planResult.data, { status: 200 })
}
