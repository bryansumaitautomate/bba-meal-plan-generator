'use client'

import { useState, useRef } from 'react'
import { Hero } from '@/components/Hero'
import { IntakeForm } from '@/components/IntakeForm'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { PlanGrid } from '@/components/PlanGrid'
import type { IntakeInput, PlanType } from '@/lib/schema'

type Stage = 'idle' | 'form' | 'loading' | 'result' | 'error'

export default function HomePage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [plan, setPlan] = useState<PlanType | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  function handleCta(): void {
    setStage('form')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function handleSubmit(intake: IntakeInput): Promise<void> {
    setStage('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(intake),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      const data: PlanType = await res.json()
      setPlan(data)
      setStage('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't cook this one up. Try again."
      setErrorMsg(message)
      setStage('error')
    }
  }

  function handleRetry(): void {
    setStage('form')
    setErrorMsg('')
  }

  const showForm = stage === 'form' || stage === 'loading' || stage === 'error' || stage === 'result'

  return (
    <main className="min-h-screen bg-bg text-text">
      <Hero onCta={handleCta} />

      {showForm && (
        <div ref={formRef}>
          <IntakeForm onSubmit={handleSubmit} disabled={stage === 'loading'} />
        </div>
      )}

      {stage === 'error' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-alert/10 border border-alert rounded-lg p-4 text-center">
            <p className="text-alert font-display">{errorMsg}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 bg-alert hover:bg-alert/80 text-text font-display font-bold uppercase px-6 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {stage === 'loading' && <LoadingOverlay />}

      {stage === 'result' && plan && (
        <div ref={resultRef} className="pb-12">
          <PlanGrid plan={plan} />
        </div>
      )}
    </main>
  )
}
