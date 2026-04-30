'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { PlanGrid } from '@/components/PlanGrid'
import { Step1Maintenance } from '@/components/member/Step1Maintenance'
import { Step2Goal } from '@/components/member/Step2Goal'
import { Step3Preferences } from '@/components/member/Step3Preferences'
import { calcDailyTargets } from '@/lib/calc'
import type { MemberIntakeInput, PlanType, IntakeInput } from '@/lib/schema'

interface MaintenanceInputs {
  sex: 'male' | 'female'
  age: number
  heightCm: number
  weightKg: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
}

type Stage = 'step1' | 'step2' | 'step3' | 'loading' | 'result' | 'error'

export default function MemberPage() {
  const [stage, setStage] = useState<Stage>('step1')
  const [maintenance, setMaintenance] = useState<MaintenanceInputs | null>(null)
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'gain'>('cut')
  const [plan, setPlan] = useState<PlanType | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const targets = maintenance
    ? calcDailyTargets({ ...maintenance, goal })
    : null

  function handleStep1(data: MaintenanceInputs): void {
    setMaintenance(data)
    setStage('step2')
  }

  function handleStep2(g: 'cut' | 'maintain' | 'gain'): void {
    setGoal(g)
    setStage('step3')
  }

  async function handleStep3(prefs: Pick<MemberIntakeInput, 'mealsPerDay' | 'fastBreakfast' | 'dietStyle' | 'cuisines' | 'allergies' | 'dislikes'> & { trainingDays: number }): Promise<void> {
    if (!maintenance || !targets) return

    setStage('loading')
    setErrorMsg('')

    const intakePayload: IntakeInput = {
      goal,
      calories: targets.calories,
      protein: targets.protein,
      mealsPerDay: prefs.mealsPerDay,
      fastBreakfast: prefs.fastBreakfast,
      allergies: prefs.allergies,
      trainingDays: prefs.trainingDays,
      dietStyle: prefs.dietStyle,
      cuisines: prefs.cuisines,
      dislikes: prefs.dislikes,
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(intakePayload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      const data: PlanType = await res.json()
      setPlan(data)
      setStage('result')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't cook this one up. Try again.")
      setStage('error')
    }
  }

  function handleBackToStep(s: Stage): void {
    setStage(s)
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* TOP BAR */}
      <header className="grain relative">
        <div className="grain-overlay" aria-hidden="true" />
        <div className="relative z-10 px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-bba-border">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-display text-2xl font-bold tracking-tight">
              <span className="text-text">B</span>
              <span className="text-gold">B</span>
            </span>
            <span className="text-kicker hidden sm:inline group-hover:text-gold transition-colors">Member</span>
          </Link>
          <StepIndicator stage={stage} />
        </div>
      </header>

      {/* STAGES */}
      <AnimatePresence mode="wait">
        {stage === 'step1' && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Step1Maintenance defaults={maintenance ?? undefined} onNext={handleStep1} />
          </motion.div>
        )}

        {stage === 'step2' && targets && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Step2Goal
              tdee={targets.tdee}
              bmr={targets.bmr}
              defaultGoal={goal}
              onNext={handleStep2}
              onBack={() => handleBackToStep('step1')}
            />
          </motion.div>
        )}

        {stage === 'step3' && targets && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Step3Preferences
              calories={targets.calories}
              protein={targets.protein}
              goal={goal}
              onNext={handleStep3}
              onBack={() => handleBackToStep('step2')}
            />
          </motion.div>
        )}

        {stage === 'loading' && <LoadingOverlay />}

        {stage === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 md:px-12 max-w-2xl mx-auto py-20"
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
                onClick={() => setStage('step3')}
                className="bg-text text-bg font-display font-bold uppercase tracking-wider px-6 py-3 hover:bg-muted-fg transition-colors"
              >
                Try Again →
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'result' && plan && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pb-12"
          >
            <PlanGrid plan={plan} showLeadCapture={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

interface StepIndicatorProps {
  stage: Stage
}

function StepIndicator({ stage }: StepIndicatorProps) {
  const labels: { key: Stage; label: string }[] = [
    { key: 'step1', label: '01 · Maintenance' },
    { key: 'step2', label: '02 · Goal' },
    { key: 'step3', label: '03 · Plan' },
  ]
  const idx = labels.findIndex((l) => l.key === stage)
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {labels.map((l, i) => {
        const isActive = i === idx
        const isDone = i < idx
        return (
          <span
            key={l.key}
            className={`text-kicker ${isActive ? 'text-gold' : isDone ? 'text-text' : 'text-faint'}`}
          >
            <span className="hidden md:inline">{l.label}</span>
            <span className="md:hidden">{String(i + 1).padStart(2, '0')}</span>
            {i < labels.length - 1 && <span className="ml-3 md:ml-4 text-faint">/</span>}
          </span>
        )
      })}
    </div>
  )
}
