# GoHighLevel Integration — Build Plan

**Owner:** Bryan (BBA SUMAIT lead)
**For:** Developer picking up this work
**Status:** Spec'd, not yet built
**Source spec:** Jase Stuart × Bryan, Apr 30 2026 meeting (`Clients/Better Body Academy/Meeting-Notes/Jase X Bryan MEETING APRIL 30.html`, quote at 44:40)
**Target:** Wire the meal plan generator's lead-capture form to BBA's GoHighLevel sub-account so emails + phones land in GHL as contacts, get tagged, and trigger an automated email containing the meal plan + shopping list.

---

## 1. Context — What Already Exists

The repo is `bryansumaitautomate/bba-meal-plan-generator` (public). It is live at `https://bba-meal-plan-generator.vercel.app`.

There are two product surfaces:

| Route | Audience | Lead Capture? |
|---|---|---|
| `/` | Non-member (lead magnet) | **Yes** — email + phone form appears under the generated plan |
| `/member` | Authed BBA member (auth deferred) | No — members are already in CRM |

The form posts to `POST /api/lead`. The route is at [`app/api/lead/route.ts`](../../app/api/lead/route.ts) and currently:

1. Validates payload against the `Lead` zod schema (`lib/schema.ts`).
2. Logs to `stderr` (visible in Vercel function logs).
3. **If `LEAD_WEBHOOK_URL` env var is set, forwards the validated lead to that URL as JSON.**

That env var is the integration hook. We will point it at GHL.

**Lead payload shape that already ships out of `/api/lead` when a webhook URL is set:**

```json
{
  "email": "person@example.com",
  "phone": "+61400000000",
  "consentToContact": true,
  "capturedAt": "2026-04-30T12:00:00.000Z",
  "source": "bba-meal-plan-generator"
}
```

What the route does NOT yet send:
- The generated meal plan itself (`coachNote`, `days`, `shoppingList`).
- A first/last name split.
- Any custom-field hints.

We will add those in step 3 below.

---

## 2. Target State — End-to-End Flow

```
User                      Next.js (Vercel)              GoHighLevel
────                      ────────────────              ───────────
1. Submits email +
   phone on /             ──► POST /api/lead
                              validates with zod
                              attaches plan JSON
                          ──► POST GHL inbound
                              webhook                    ──► Workflow trigger
                                                              fires
                                                          ──► Create / update contact
                                                          ──► Apply tags
                                                          ──► Send email with
                                                              meal plan + shopping list
                                                          ──► (Optional) SMS
                                                              follow-up at +24h
                              200 OK ◄──
   "Done. Check your
    inbox." ◄──
```

**Total user-perceived latency** at form submit: target under 1 second. The webhook forward is fire-and-forget.

---

## 3. GHL Setup (Configuration, no Next.js changes)

This part is done **inside GoHighLevel** by the BBA team, not by the developer. The developer needs the resulting webhook URL to plug into the Next.js env var.

### 3.1 Custom fields to create on the contact

Sub-Account Settings → Custom Fields → Contact:

| Field name | Type | Purpose |
|---|---|---|
| `Lead Source App` | Single Line | Always `bba-meal-plan-generator` for these leads |
| `Plan Goal` | Single Line | `cut`, `maintain`, or `gain` |
| `Plan Calories` | Number | Daily target |
| `Plan Protein` | Number | Protein target in grams |
| `Plan Meals Per Day` | Number | 3, 4, or 5 |
| `Plan Fasting Breakfast` | Checkbox | Skip-breakfast / IF flag |
| `Coach Note` | Multi-Line | The Jase-voice intro line from the plan |
| `Plan JSON` | Multi-Line | Full plan + shopping list as JSON string. Used by the email template if HTML rendering is preferred over PDF |

### 3.2 Tags to create

- `meal-plan-lead`
- `non-member`
- `goal-cut`, `goal-maintain`, `goal-gain` (one of, applied dynamically)

### 3.3 Workflow: "Meal Plan Lead Inbound"

Automation → Workflows → Create Workflow:

1. **Trigger:** `Inbound Webhook`. Save the URL it generates — that goes in `LEAD_WEBHOOK_URL`. Format will look like `https://services.leadconnectorhq.com/hooks/<location_id>/webhook-trigger/<webhook_id>`.
2. **Action:** `Create or Update Contact`
   - Email = `{{inboundWebhookRequest.email}}`
   - Phone = `{{inboundWebhookRequest.phone}}`
   - First Name = `{{inboundWebhookRequest.firstName}}` (the Next.js side will best-effort split or pass empty)
   - Last Name = `{{inboundWebhookRequest.lastName}}`
   - Custom field `Lead Source App` = `{{inboundWebhookRequest.source}}`
   - Custom field `Plan Goal` = `{{inboundWebhookRequest.plan.goal}}`
   - Custom field `Plan Calories` = `{{inboundWebhookRequest.plan.calories}}`
   - Custom field `Plan Protein` = `{{inboundWebhookRequest.plan.protein}}`
   - Custom field `Plan Meals Per Day` = `{{inboundWebhookRequest.plan.mealsPerDay}}`
   - Custom field `Plan Fasting Breakfast` = `{{inboundWebhookRequest.plan.fastBreakfast}}`
   - Custom field `Coach Note` = `{{inboundWebhookRequest.plan.coachNote}}`
   - Custom field `Plan JSON` = `{{inboundWebhookRequest.plan.json}}`
3. **Action:** `Add Contact Tag` → `meal-plan-lead`, `non-member`, and goal-tag.
4. **Action:** `Send Email`
   - Subject: *Your week. Real food. No BS.*
   - Body: HTML template that pulls from custom fields. See section 5 for a starter template the developer can hand to the BBA team for in-GHL editing.
   - Attachment (optional v2): pdfUrl from custom field if PDF generation is wired (see section 6).
5. **Action (optional):** `Wait 24 hours` → `Send SMS`: *"That meal plan we sent yesterday — any questions? Reply here. - Jase"*

---

## 4. Next.js Changes Required

Two files change in this repo. Both edits are small.

### 4.1 Extend the Lead schema to accept first/last name (lib/schema.ts)

Currently:

```ts
export const Lead = z.object({
  email: z.string().email().max(200),
  phone: z.string().min(7).max(30),
  consentToContact: z.boolean().default(true),
})
```

Add optional name fields. They can stay optional because asking for them now would lower conversion — we will best-effort derive them from the email or pass blank:

```ts
export const Lead = z.object({
  email: z.string().email().max(200),
  phone: z.string().min(7).max(30),
  firstName: z.string().max(100).default(''),
  lastName: z.string().max(100).default(''),
  consentToContact: z.boolean().default(true),
})
```

If the lead form should ask for first name (recommended — small conversion hit, much better personalization), add a single text input above email in [`components/LeadCapture.tsx`](../../components/LeadCapture.tsx). Keep last name optional or skip it.

### 4.2 Forward the captured plan to the webhook (app/api/lead/route.ts)

Currently the route only forwards email/phone/consent. We need it to also forward the meal plan that was just generated, so GHL can put it in the email and tag the contact by goal.

The cleanest design: have the **client** include the plan in the lead POST. The plan already lives in React state on the page when the lead form appears.

#### a. Update the Lead schema to optionally carry the plan (already-generated, validated)

In `lib/schema.ts`, add:

```ts
import { Plan } from './schema' // already exported

export const LeadWithPlan = Lead.extend({
  plan: Plan.optional(),
  intake: z.object({
    goal: z.enum(['cut', 'maintain', 'gain']),
    calories: z.number().int(),
    protein: z.number().int(),
    mealsPerDay: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    fastBreakfast: z.boolean(),
  }).optional(),
})

export type LeadWithPlanInput = z.infer<typeof LeadWithPlan>
```

#### b. In `components/LeadCapture.tsx`, accept the plan + intake as props and include them in the POST body

Currently `LeadCapture` is dumb — it just owns its form. Update its props:

```tsx
interface LeadCaptureProps {
  plan?: PlanType   // already in scope on the result page
  intake?: IntakeInput
}
```

In the submit handler, send `{ ...formValues, plan, intake }`.

In `components/PlanGrid.tsx`, pass `plan` and `intake` down:

```tsx
{showLeadCapture && <LeadCapture plan={plan} intake={intake} />}
```

`PlanGrid` does not currently receive `intake`. Pipe it from `app/page.tsx` where the form was submitted.

#### c. Update `app/api/lead/route.ts` to validate against `LeadWithPlan` and reshape the webhook payload for GHL

```ts
import { LeadWithPlan } from '@/lib/schema'

const result = LeadWithPlan.safeParse(body)
// ... existing error handling ...

const lead = result.data
const fullName = (lead.firstName + ' ' + lead.lastName).trim()

const payload = {
  email: lead.email,
  phone: lead.phone,
  firstName: lead.firstName,
  lastName: lead.lastName,
  fullName,
  source: 'bba-meal-plan-generator',
  capturedAt: new Date().toISOString(),
  plan: lead.plan && lead.intake ? {
    goal: lead.intake.goal,
    calories: lead.intake.calories,
    protein: lead.intake.protein,
    mealsPerDay: lead.intake.mealsPerDay,
    fastBreakfast: lead.intake.fastBreakfast,
    coachNote: lead.plan.coachNote,
    json: JSON.stringify(lead.plan),
  } : null,
}

if (webhook) {
  await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
```

Keep the existing best-effort error handling — if GHL is down or slow, the user still gets a success response.

---

## 5. Email Template (HTML body) for the GHL Workflow

The BBA team owns the design in GHL's email editor. Hand them this starter Markdown / HTML so the dev does not block on copy.

```html
<!-- Subject -->
Your week. Real food. No BS.

<!-- Body -->
<p>Hey {{contact.first_name}},</p>

<p>Your seven day plan is below. Built around your goal: <strong>{{contact.plan_goal}}</strong>.
Daily target: <strong>{{contact.plan_calories}} cal</strong>, <strong>{{contact.plan_protein}}g protein</strong>.</p>

<blockquote>
  "{{contact.coach_note}}"<br>
  — Jase
</blockquote>

<p>Full plan + shopping list in the attached PDF. (If you need it again later, just hit reply.)</p>

<p>One thing: this plan is a starting point. Real coaching is real life — what you actually eat, what works, what you hate. If you want to talk about going further, hit me back on this email or the number you gave us.</p>

<p>— Jase Stuart<br>
The Better Body Coach</p>
```

Custom-field merge tokens shown above (`{{contact.plan_goal}}` etc.) match the field names from section 3.1.

---

## 6. PDF Generation — Two Paths, Pick One

Jase's quote: *"if you want this email to you with a, as a PDF with a shopping list."* We need to honour the PDF.

### Path A — HTML email only (v1, simplest)

Skip the PDF for the first launch. The HTML email body renders the plan + shopping list inline. Most coaches deliver lead magnets this way.

**Effort:** Zero extra dev — the workflow does it all. Email body becomes longer.

**Tradeoff:** Not "a PDF" as Jase requested. Convert later.

### Path B — Server-side PDF, hosted on Vercel Blob, link or attachment in email (v2, recommended)

1. Add `@react-pdf/renderer` (or `puppeteer-core` + `@sparticuz/chromium` for serverless — heavier).
2. Create a PDF component mirroring `PlanGrid` styling.
3. New route: `app/api/pdf/route.ts`. Takes a Plan + Intake, returns a `Buffer` PDF.
4. From `/api/lead`: after validation, `await fetch('/api/pdf')` (or call the renderer directly), upload the Buffer to Vercel Blob, get a public URL, include `pdfUrl` in the GHL webhook payload.
5. In the GHL workflow's Send Email action, set Attachment = `{{contact.pdf_url}}` (after wiring a `Plan PDF URL` custom field).

**Effort:** ~1 day for a Next.js dev fluent in `@react-pdf/renderer`.

**Tradeoff:** Vercel Blob is paid past the free tier. Alternative: Cloudflare R2, Supabase Storage, S3.

### Recommendation

**Ship Path A (HTML email) on day one. Ship Path B in week two** after you have lead-capture conversion data. Avoids gold-plating before the loop is proven.

---

## 7. Environment Variables

Add to Vercel project settings (production + preview):

| Variable | Source | Notes |
|---|---|---|
| `LEAD_WEBHOOK_URL` | GHL workflow inbound webhook URL (section 3.3) | Required for forward. Without it, route logs to stderr only. |
| `GHL_LOCATION_ID` | (Optional, only if Path B writes via API instead of webhook) | Defer until needed |
| `GHL_API_KEY` | (Optional, same as above) | Defer until needed |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (Path B only) | Only when we ship PDFs |

**Already set:** `OPENAI_API_KEY` (production + preview).

---

## 8. Test Scenarios

The dev should run all of these before handing back to BBA.

| # | Action | Expected |
|---|---|---|
| 1 | Submit form on `/` with a valid email + phone, no plan yet generated | 400 — should not be possible since LeadCapture only renders post-plan, but defend at API |
| 2 | Submit form post-plan, with `LEAD_WEBHOOK_URL` unset | 200, stderr log shows email + phone, no GHL contact created |
| 3 | Submit form post-plan, valid `LEAD_WEBHOOK_URL` | 200 to user, GHL contact appears with all custom fields populated within ~5s |
| 4 | Same submission again (same email) | 200 to user, GHL upserts (does not duplicate) |
| 5 | Webhook URL returns 500 | User still sees success state, stderr shows the failure |
| 6 | Bad email format | 400, no webhook fired |
| 7 | Inspect contact in GHL | Tags applied: `meal-plan-lead`, `non-member`, `goal-cut`/`goal-maintain`/`goal-gain` |
| 8 | Check email arrives | Subject and body match section 5, custom field merges work |
| 9 | (Path B) PDF attached to email | Opens, shows full plan + shopping list, brand styling matches site |

---

## 9. Acceptance Criteria

Dev can mark this done when:

- [ ] `LEAD_WEBHOOK_URL` set in Vercel production env
- [ ] Schema + LeadCapture component changes merged to `main`
- [ ] `/api/lead` forwards full payload (email, phone, name, plan, intake) to GHL
- [ ] Test submission appears in GHL within 10s as a contact with all custom fields populated
- [ ] Workflow tags apply correctly across all three goals
- [ ] HTML email arrives at the test inbox with the correct contact-name merge
- [ ] Failure mode: if GHL is unreachable, the user still sees the inline success state ("Done. Check your inbox.")
- [ ] (Path B only) PDF attaches and renders cleanly on Gmail + Apple Mail + Outlook

---

## 10. Out of Scope (Future Phases)

These are flagged here so they do not get added to this scope by accident.

- Member auth on `/member` (separate scope — needs PT Distinction integration or NextAuth).
- SMS delivery of the plan (GHL workflow can do this with a separate action; not in v1).
- Rate limiting on `/api/lead` (Vercel KV when abuse appears, not before).
- Multi-language email templates.
- Webhook signature verification on inbound (GHL → us). Not needed here because the flow is one-directional (us → GHL).
- Replacing PT Distinction with this app (deferred per Jase, separate roadmap item).

---

## 11. Effort Estimate

| Path | Dev hours | Calendar |
|---|---|---|
| Path A (HTML email only) | 2 to 3 hours | Same day |
| Path B (with server-side PDF) | 1 day | Same week |

Both paths assume the GHL custom fields + workflow are pre-built by the BBA team or a GHL admin. If the dev also needs to set those up, add ~2 hours.

---

## 12. Reference Code Locations

- Lead capture UI: [`components/LeadCapture.tsx`](../../components/LeadCapture.tsx)
- Lead API route: [`app/api/lead/route.ts`](../../app/api/lead/route.ts)
- Lead schema: [`lib/schema.ts`](../../lib/schema.ts) (search for `export const Lead`)
- Plan schema (for the typed plan we ship to GHL): same file (search for `export const Plan`)
- Where LeadCapture is rendered: [`components/PlanGrid.tsx`](../../components/PlanGrid.tsx)
- Brand voice rules (informs email copy tone): `Clients/Better Body Academy/Brand-Guidelines.md` in the parent workspace

---

## 13. Questions to Confirm with Bryan / Jase Before Building

1. **Which GHL sub-account** does this go to? (Bryan to provide login or webhook URL.)
2. **Path A or Path B?** HTML email v1 vs PDF v2 from day one.
3. **First name field:** ask on the lead form or skip? (Recommendation: ask.)
4. **SMS follow-up at +24h** — yes / no / part of v2?
5. **Source field naming convention** — confirm `bba-meal-plan-generator` matches the rest of GHL's lead-source taxonomy.
6. **Workflow ownership** — Bryan builds the workflow, or hand off to BBA's GHL admin?

---

**End of build plan.** Any ambiguity, ping Bryan. The repo is public — open a PR against `main` and tag `@bryansumaitautomate`.
