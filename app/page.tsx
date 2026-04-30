'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
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

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form-wrap"
            ref={formRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <IntakeForm onSubmit={handleSubmit} disabled={stage === 'loading'} />
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 md:px-12 max-w-2xl mx-auto pb-20"
        >
          <div className="border border-alert bg-alert/5 p-6 md:p-8">
            <p className="text-kicker mb-3">
              <span className="text-alert">●</span>&nbsp;&nbsp;Error
            </p>
            <p className="font-display text-2xl md:text-3xl text-text mb-6 leading-tight">
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="bg-text text-bg font-display font-bold uppercase tracking-wider px-6 py-3 hover:bg-muted-fg transition-colors"
            >
              Try Again →
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {stage === 'loading' && <LoadingOverlay />}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'result' && plan && (
          <motion.div
            key="result-wrap"
            ref={resultRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pb-12"
          >
            <PlanGrid plan={plan} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
