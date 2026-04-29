import OpenAI from 'openai'

let client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (client) return client

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env.local for dev or Vercel env vars for production.')
  }

  client = new OpenAI({ apiKey })
  return client
}
