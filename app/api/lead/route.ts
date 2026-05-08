import { NextResponse } from 'next/server'
import { LeadWithPlan } from '@/lib/schema'

export const runtime = 'nodejs'

interface LeadResponse {
  success: boolean
  error?: string
}

/**
 * Captures non-member lead info (email + phone + name + optional generated plan)
 * and forwards to GoHighLevel via inbound webhook.
 *
 * Behaviour:
 *   1. Validates payload against LeadWithPlan schema.
 *   2. Logs the email + phone to stderr (Vercel surfaces in function logs).
 *   3. If LEAD_WEBHOOK_URL is set, forwards a flattened payload optimized for
 *      GHL's inbound webhook trigger — top-level keys map directly to GHL
 *      contact fields and custom fields. Plan JSON is stringified so a single
 *      Multi-Line custom field can hold it.
 *   4. Webhook forward is best-effort. If GHL is unreachable, the user still
 *      sees the inline success state.
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<LeadResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = LeadWithPlan.safeParse(body)
  if (!result.success) {
    return NextResponse.json<LeadResponse>(
      { success: false, error: 'Invalid lead' },
      { status: 400 },
    )
  }

  const lead = result.data
  const webhook = process.env.LEAD_WEBHOOK_URL

  process.stderr.write(`[lead] ${lead.email} · ${lead.phone} · ${lead.firstName || '(no name)'}\n`)

  if (webhook) {
    const payload = buildGhlPayload(lead)
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        process.stderr.write(`[lead] webhook returned ${res.status}\n`)
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'unknown webhook error'
      process.stderr.write(`[lead] webhook failed: ${detail}\n`)
    }
  }

  return NextResponse.json<LeadResponse>({ success: true })
}

/**
 * Flattens the validated lead into a payload shape that maps cleanly to
 * GoHighLevel's inbound webhook trigger.
 *
 * GHL's inbound webhook trigger exposes every top-level key in the JSON body
 * as a merge variable in the workflow (e.g. {{inboundWebhookRequest.email}}),
 * and contact custom fields are mapped via the workflow UI rather than the
 * payload structure. So the cleanest contract is a flat object.
 */
function buildGhlPayload(lead: ReturnType<typeof LeadWithPlan.parse>) {
  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim()
  const tagFromGoal = lead.intake ? `goal-${lead.intake.goal}` : null

  return {
    // GHL standard contact fields
    email: lead.email,
    phone: lead.phone,
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    fullName,

    // Provenance
    source: 'bba-meal-plan-generator',
    capturedAt: new Date().toISOString(),
    consentToContact: lead.consentToContact,

    // Tag hints — workflow can apply these literally
    tags: ['meal-plan-lead', 'non-member', tagFromGoal].filter(Boolean),

    // Plan custom fields (only populated when the user actually generated a plan)
    planGoal: lead.intake?.goal ?? null,
    planCalories: lead.intake?.calories ?? null,
    planProtein: lead.intake?.protein ?? null,
    planMealsPerDay: lead.intake?.mealsPerDay ?? null,
    planFastingBreakfast: lead.intake?.fastBreakfast ?? null,
    planTrainingDays: lead.intake?.trainingDays ?? null,
    planDietStyle: lead.intake?.dietStyle ?? null,
    coachNote: lead.plan?.coachNote ?? null,

    // Full plan as JSON string — for in-email rendering
    planJson: lead.plan ? JSON.stringify(lead.plan) : null,
  }
}
