'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { calcDailyTargets } from '@/lib/calc'

type Sex = 'male' | 'female'
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

interface MaintenanceInputs {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: Activity
}

interface Step1MaintenanceProps {
  defaults?: MaintenanceInputs
  onNext: (data: MaintenanceInputs) => void
}

const ACTIVITY_OPTIONS: { value: Activity; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Sedentary', sub: 'Desk job, no training' },
  { value: 'light', label: 'Light', sub: '1 to 3 days a week' },
  { value: 'moderate', label: 'Moderate', sub: '3 to 5 days a week' },
  { value: 'active', label: 'Active', sub: '6 to 7 days a week' },
  { value: 'very_active', label: 'Very Active', sub: 'Daily plus physical job' },
]

export function Step1Maintenance({ defaults, onNext }: Step1MaintenanceProps) {
  const [sex, setSex] = useState<Sex>(defaults?.sex ?? 'male')
  const [age, setAge] = useState<number>(defaults?.age ?? 42)
  const [heightCm, setHeightCm] = useState<number>(defaults?.heightCm ?? 180)
  const [weightKg, setWeightKg] = useState<number>(defaults?.weightKg ?? 90)
  const [activityLevel, setActivityLevel] = useState<Activity>(defaults?.activityLevel ?? 'moderate')

  // Live preview of maintenance calc
  const preview = calcDailyTargets({ sex, age, heightCm, weightKg, activityLevel, goal: 'maintain' })

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    onNext({ sex, age, heightCm, weightKg, activityLevel })
  }

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
      <header className="mb-12 md:mb-16">
        <p className="text-kicker mb-4">
          <span className="text-blue">01</span>&nbsp;&nbsp;Find Your Maintenance
        </p>
        <h1 className="text-display-lg mb-6">
          Let's find your<br />
          <span className="text-italic-display text-blue">maintenance calories.</span>
        </h1>
        <p className="text-muted-fg text-lg max-w-xl font-display font-light leading-snug">
          The number you can eat without gaining or losing. We'll calculate it from a few stats.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 md:space-y-14">
        {/* Sex */}
        <Field label="01" caption="Sex">
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {(['male', 'female'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                aria-pressed={sex === s}
                className={`p-5 md:p-6 border text-left transition-all capitalize ${sex === s ? 'border-blue bg-bg shadow-[0_0_0_1px_var(--color-blue)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
              >
                <span className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-text">
                  {s}
                </span>
              </button>
            ))}
          </div>
        </Field>

        {/* Age + Height + Weight */}
        <Field label="02" caption="Stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <NumberInput id="age" label="Age" suffix="yrs" value={age} onChange={setAge} min={16} max={99} />
            <NumberInput id="heightCm" label="Height" suffix="cm" value={heightCm} onChange={setHeightCm} min={120} max={230} />
            <NumberInput id="weightKg" label="Weight" suffix="kg" value={weightKg} onChange={setWeightKg} min={35} max={250} step={0.5} />
          </div>
        </Field>

        {/* Activity */}
        <Field label="03" caption="Activity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActivityLevel(opt.value)}
                aria-pressed={activityLevel === opt.value}
                className={`p-5 md:p-6 border text-left transition-all ${activityLevel === opt.value ? 'border-blue bg-bg shadow-[0_0_0_1px_var(--color-blue)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
              >
                <p className="font-display text-xl md:text-2xl font-bold text-text mb-1">{opt.label}</p>
                <p className="text-kicker">{opt.sub}</p>
              </button>
            ))}
          </div>
        </Field>

        {/* Live preview */}
        <motion.div
          key={`${preview.bmr}-${preview.tdee}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="border-t border-bba-border pt-8 grid grid-cols-2 md:grid-cols-3 gap-6 items-end"
        >
          <div>
            <p className="text-kicker mb-2">BMR</p>
            <p className="text-numeral font-display text-4xl md:text-5xl font-bold text-muted-fg leading-none">
              {preview.bmr}
            </p>
            <p className="text-kicker mt-2 text-faint">Resting burn</p>
          </div>
          <div>
            <p className="text-kicker mb-2">Maintenance</p>
            <p className="text-numeral font-display text-5xl md:text-6xl font-bold text-blue leading-none">
              {preview.tdee}
            </p>
            <p className="text-kicker mt-2 text-faint">Cal per day</p>
          </div>
          <div className="md:flex md:justify-end md:col-span-1 col-span-2">
            <button
              type="submit"
              className="group bg-blue text-bg font-display font-bold uppercase tracking-wider px-8 md:px-10 py-4 md:py-5 text-base md:text-lg hover:bg-blue-hover transition-colors w-full md:w-auto"
            >
              <span className="inline-flex items-center justify-center gap-3">
                Continue
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          </div>
        </motion.div>
      </form>
    </section>
  )
}

interface FieldProps {
  label: string
  caption: string
  children: React.ReactNode
}

function Field({ label, caption, children }: FieldProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-10">
      <div className="md:pt-2">
        <p className="text-kicker">
          <span className="text-blue">{label}</span>
          <span className="block mt-2 text-faint">{caption}</span>
        </p>
      </div>
      <div>{children}</div>
    </div>
  )
}

interface NumberInputProps {
  id: string
  label: string
  suffix: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}

function NumberInput({ id, label, suffix, value, onChange, min, max, step = 1 }: NumberInputProps) {
  return (
    <div className="border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
      <label htmlFor={id} className="block text-kicker mb-2">{label}</label>
      <div className="flex items-baseline gap-3">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-numeral text-4xl md:text-5xl font-display font-bold text-text outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-muted-fg font-display text-lg uppercase tracking-wide">{suffix}</span>
      </div>
    </div>
  )
}
