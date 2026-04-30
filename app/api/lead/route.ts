import { NextResponse } from 'next/server'
import { Lead } from '@/lib/schema'

export const runtime = 'nodejs'

interface LeadResponse {
  success: boolean
  error?: string
}

/**
 * Captures non-member lead info (email + phone) so the future PDF email
 * delivery + n8n / SMTP wiring can pick it up.
 *
 * MVP behaviour: validates the payload, logs to stderr (Vercel will surface
 * it in the function logs) and returns success. No persistence yet.
 *
 * Hook for future: forward to LEAD_WEBHOOK_URL if set (e.g. an n8n webhook).
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<LeadResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = Lead.safeParse(body)
  if (!result.success) {
    return NextResponse.json<LeadResponse>(
      { success: false, error: 'Invalid lead' },
      { status: 400 },
    )
  }

  const lead = result.data
  const webhook = process.env.LEAD_WEBHOOK_URL

  // Server-side log for Vercel function inspection
  process.stderr.write(`[lead] ${lead.email} · ${lead.phone}\n`)

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...lead, capturedAt: new Date().toISOString(), source: 'bba-meal-plan-generator' }),
      })
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'unknown webhook error'
      process.stderr.write(`[lead] webhook failed: ${detail}\n`)
      // We still succeed for the user — the webhook is best-effort.
    }
  }

  return NextResponse.json<LeadResponse>({ success: true })
}
