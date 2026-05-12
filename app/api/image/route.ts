import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const KIE_CREATE = 'https://api.kie.ai/api/v1/jobs/createTask'
const KIE_POLL = 'https://api.kie.ai/api/v1/jobs/recordInfo'
const POLL_INTERVAL_MS = 2_000
const POLL_TIMEOUT_MS = 55_000

const ImageRequest = z.object({
  mealName: z.string().min(1).max(200),
  ingredients: z.array(z.string()).max(20).default([]),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:4']).default('4:3'),
})

interface SuccessResponse {
  url: string
  cached: false
  taskId: string
}

interface ErrorResponse {
  error: string
  detail?: string
}

interface KieCreateResp {
  code: number
  msg?: string
  data?: { taskId?: string }
}

interface KiePollResp {
  code: number
  msg?: string
  data?: {
    taskId: string
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail'
    resultJson?: string
    failMsg?: string
  } | null
}

interface KieResultPayload {
  resultUrls?: string[]
}

/**
 * Generates a food-photography image for a single meal via kie.ai's
 * gpt-image-2-text-to-image model. Submits a task, polls every 2s up to
 * 55s, returns the resulting image URL.
 *
 * NOTE: kie.ai result URLs expire after ~24 hours. v1 ships without
 * persistent caching — same meal name across plans will regenerate.
 * Add Vercel Blob caching as a separate scope when warranted.
 */
export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    return NextResponse.json<ErrorResponse>(
      { error: 'KIE_API_KEY not configured' },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ErrorResponse>({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ImageRequest.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ErrorResponse>({ error: 'Invalid image request' }, { status: 400 })
  }
  const { mealName, ingredients, aspectRatio } = parsed.data

  const prompt = buildPrompt(mealName, ingredients)

  let taskId: string
  try {
    taskId = await createImageTask({ apiKey, prompt, aspectRatio })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to start image generation', detail },
      { status: 502 },
    )
  }

  try {
    const url = await pollForResult({ apiKey, taskId })
    return NextResponse.json<SuccessResponse>({ url, cached: false, taskId })
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json<ErrorResponse>(
      { error: 'Image generation failed', detail },
      { status: 502 },
    )
  }
}

function buildPrompt(mealName: string, ingredients: string[]): string {
  const ingredientList = ingredients.length > 0 ? ingredients.join(', ') : 'as plated'
  return [
    `Editorial food photography of "${mealName}".`,
    `The dish contains: ${ingredientList}.`,
    `Plated on a dark slate or charcoal surface with soft moody natural lighting from the side.`,
    `Overhead 45-degree angle, photorealistic, magazine-quality, deep contrast, rich saturated colors.`,
    `No text, no logos, no people, no captions. Clean composition. Minimal styling.`,
  ].join(' ')
}

async function createImageTask(args: {
  apiKey: string
  prompt: string
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4'
}): Promise<string> {
  const res = await fetch(KIE_CREATE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2-text-to-image',
      input: {
        prompt: args.prompt,
        aspect_ratio: args.aspectRatio,
      },
    }),
  })
  if (!res.ok) {
    throw new Error(`kie.ai createTask returned ${res.status}`)
  }
  const json = (await res.json()) as KieCreateResp
  const taskId = json.data?.taskId
  if (!taskId) {
    throw new Error(json.msg || 'kie.ai createTask missing taskId')
  }
  return taskId
}

async function pollForResult(args: { apiKey: string; taskId: string }): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)

    const res = await fetch(`${KIE_POLL}?taskId=${encodeURIComponent(args.taskId)}`, {
      headers: { Authorization: `Bearer ${args.apiKey}` },
    })
    if (!res.ok) {
      throw new Error(`kie.ai poll returned ${res.status}`)
    }

    const json = (await res.json()) as KiePollResp
    const state = json.data?.state

    if (state === 'success') {
      const raw = json.data?.resultJson ?? ''
      try {
        const parsed = JSON.parse(raw) as KieResultPayload
        const url = parsed.resultUrls?.[0]
        if (!url) throw new Error('Empty resultUrls')
        return url
      } catch (err) {
        throw new Error(`Failed to parse resultJson: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }

    if (state === 'fail') {
      throw new Error(json.data?.failMsg || 'kie.ai task failed')
    }
    // waiting / queuing / generating -> loop
  }

  throw new Error('Image generation timed out after 55s')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
