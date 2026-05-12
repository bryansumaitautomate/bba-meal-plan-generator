'use client'

import { useState } from 'react'

type Goal = 'cut' | 'maintain' | 'gain'

interface Step2GoalProps {
  bmr: number
  tdee: number
  defaultGoal: Goal
  onNext: (goal: Goal) => void
  onBack: () => void
}

const GOAL_OPTIONS: { value: Goal; label: string; sub: string; offset: string }[] = [
  { value: 'cut', label: 'Cut', sub: 'Strip the fat', offset: 'maintenance minus 500' },
  { value: 'maintain', label: 'Maintain', sub: 'Hold the line', offset: 'right at maintenance' },
  { value: 'gain', label: 'Gain', sub: 'Build size', offset: 'maintenance plus 400' },
]

export function Step2Goal({ bmr, tdee, defaultGoal, onNext, onBack }: Step2GoalProps) {
  const [goal, setGoal] = useState<Goal>(defaultGoal)

  function preview(g: Goal): number {
    if (g === 'cut') return Math.max(1200, tdee - 500)
    if (g === 'gain') return tdee + 400
    return tdee
  }

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
      <header className="mb-10 md:mb-14">
        <p className="text-kicker mb-4">
          <span className="text-blue">02</span>&nbsp;&nbsp;Pick the Direction
        </p>
        <h1 className="text-display-lg mb-6">
          What are you<br />
          <span className="text-italic-display text-blue">chasing?</span>
        </h1>
        <p className="text-muted-fg text-lg max-w-xl font-display font-light leading-snug">
          Cut, maintain, or gain. We'll set targets from your maintenance number.
        </p>
      </header>

      {/* Maintenance reference */}
      <div className="mb-10 md:mb-14 grid grid-cols-2 gap-6 max-w-md">
        <div>
          <p className="text-kicker mb-1">BMR</p>
          <p className="text-numeral font-display text-2xl md:text-3xl font-bold text-muted-fg leading-none">{bmr}</p>
        </div>
        <div>
          <p className="text-kicker mb-1">Maintenance</p>
          <p className="text-numeral font-display text-2xl md:text-3xl font-bold text-blue leading-none">{tdee}</p>
        </div>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-14">
        {GOAL_OPTIONS.map((opt) => {
          const isActive = goal === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGoal(opt.value)}
              aria-pressed={isActive}
              className={`p-6 md:p-8 border text-left transition-all ${isActive ? 'border-blue bg-bg shadow-[0_0_0_1px_var(--color-blue)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
            >
              <p className="text-kicker mb-3">{opt.offset}</p>
              <p className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-text mb-2">{opt.label}</p>
              <p className="text-muted-fg text-sm md:text-base mb-4">{opt.sub}</p>
              <div className="border-t border-bba-border pt-3">
                <p className="text-kicker mb-1">Daily target</p>
                <p className={`text-numeral font-display text-3xl md:text-4xl font-bold leading-none ${isActive ? 'text-blue' : 'text-text'}`}>
                  {preview(opt.value)}
                </p>
                <p className="text-kicker mt-1 text-faint">cal</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Nav */}
      <div className="border-t border-bba-border pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-kicker text-faint hover:text-text transition-colors text-left"
        >
          ←&nbsp;&nbsp;Back to maintenance
        </button>
        <button
          type="button"
          onClick={() => onNext(goal)}
          className="group bg-blue text-bg font-display font-bold uppercase tracking-wider px-8 md:px-10 py-4 md:py-5 text-base md:text-lg hover:bg-blue-hover transition-colors"
        >
          <span className="inline-flex items-center justify-center gap-3">
            Continue with {goal}
            <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>
      </div>
    </section>
  )
}
