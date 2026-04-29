# Better Body Academy Meal Plan Generator

Tier 1 MVP demo for Better Body Academy. Eight-field intake form generates a 7-day meal plan in Jase Stuart's brand voice via OpenAI gpt-4o.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (base-ui) + OpenAI SDK + zod + react-hook-form. Vitest for tests. Bun as package manager.

## Local Development

```bash
bun install
cp .env.example .env.local
# add your OPENAI_API_KEY to .env.local
bun dev
```

Open http://localhost:3000.

## Tests

```bash
bun run test
```

18 tests cover zod schemas, the prompt builder, and the API route (with mocked OpenAI).

## Deployment

Auto-deploys to Vercel on push to `main`. Set `OPENAI_API_KEY` in Vercel project settings (production + preview).

## Brand Tokens

See the BBA brand guidelines at `Clients/Better Body Academy/Brand-Guidelines.md` in the parent workspace. Primary palette: dark theme (#0a0a0a) with electric gold accent (#d4a843). Typography: Outfit for display, Inter for body, JetBrains Mono for data.

## Out of Scope (Tier 2 follow-up)

Streaming responses, regenerate-this-meal button, PDF export, grocery list, macro charts, save/share URL, multi-client roster, WhatsApp send, auth, persistence, PWA manifest.
