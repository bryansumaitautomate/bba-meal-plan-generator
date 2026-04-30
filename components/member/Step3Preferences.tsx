'use client'

import { useState } from 'react'
import type { MemberIntakeInput } from '@/lib/schema'

type DietStyle = MemberIntakeInput['dietStyle']
type Cuisine = MemberIntakeInput['cuisines'][number]
type Goal = 'cut' | 'maintain' | 'gain'

type PrefsPayload = Pick<MemberIntakeInput, 'mealsPerDay' | 'fastBreakfast' | 'dietStyle' | 'cuisines' | 'allergies' | 'dislikes'> & {
  trainingDays: number
}

interface Step3PreferencesProps {
  calories: number
  protein: number
  goal: Goal
  onNext: (prefs: PrefsPayload) => void | Promise<void>
  onBack: () => void
}

const DIET_OPTIONS: DietStyle[] = ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo']
const CUISINE_OPTIONS: Cuisine[] = ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American']
const MEAL_OPTIONS = [3, 4, 5] as const

export function Step3Preferences({ calories, protein, goal, onNext, onBack }: Step3PreferencesProps) {
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(4)
  const [fastBreakfast, setFastBreakfast] = useState(false)
  const [trainingDays, setTrainingDays] = useState(4)
  const [dietStyle, setDietStyle] = useState<DietStyle>('omnivore')
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [allergies, setAllergies] = useState('')
  const [dislikes, setDislikes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggleCuisine(c: Cuisine): void {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onNext({ mealsPerDay, fastBreakfast, trainingDays, dietStyle, cuisines, allergies, dislikes })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
      <header className="mb-10 md:mb-14">
        <p className="text-kicker mb-4">
          <span className="text-gold">03</span>&nbsp;&nbsp;Dial in the Plan
        </p>
        <h1 className="text-display-lg mb-6">
          Last few<br />
          <span className="text-italic-display text-gold">preferences.</span>
        </h1>
        <p className="text-muted-fg text-lg max-w-xl font-display font-light leading-snug">
          Already locked in: {calories} cal, {protein}g protein, {goal}. Now tell us how you eat.
        </p>
      </header>

      {/* Targets summary */}
      <div className="mb-10 md:mb-14 grid grid-cols-3 gap-4 md:gap-6 border-y border-bba-border py-6">
        <Stat label="Goal" value={goal} highlight={false} capitalize />
        <Stat label="Calories" value={String(calories)} highlight />
        <Stat label="Protein" value={`${protein}g`} highlight={false} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 md:space-y-14">
        {/* Meals per day */}
        <Field label="01" caption="Meals">
          <p className="text-kicker mb-3">How many meals per day?</p>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {MEAL_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMealsPerDay(n)}
                aria-pressed={mealsPerDay === n}
                className={`flex flex-col items-center gap-1 py-4 md:py-5 border transition-all ${mealsPerDay === n ? 'border-gold bg-bg shadow-[0_0_0_1px_var(--color-gold)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
              >
                <span className="font-display text-3xl md:text-4xl font-bold text-text">{n}</span>
                <span className="text-kicker">{n === 3 ? 'three squares' : n === 4 ? 'three plus snack' : 'plus two snacks'}</span>
              </button>
            ))}
          </div>
        </Field>

        {/* Fasting toggle */}
        <Field label="02" caption="Timing">
          <button
            type="button"
            onClick={() => setFastBreakfast((v) => !v)}
            aria-pressed={fastBreakfast}
            className="flex items-center justify-between gap-4 w-full text-left p-5 md:p-6 border border-bba-border bg-surface hover:border-bba-border-strong transition-colors"
          >
            <div>
              <p className="font-display text-xl md:text-2xl text-text mb-1">
                Fast through breakfast?
              </p>
              <p className="text-kicker">
                Skip breakfast, eat later. Intermittent fasting style.
              </p>
            </div>
            <div className={`relative inline-flex w-14 h-8 rounded-full border transition-colors flex-shrink-0 ${fastBreakfast ? 'bg-gold border-gold' : 'bg-elevated border-bba-border-strong'}`}>
              <span className={`absolute top-0.5 w-7 h-7 rounded-full transition-transform ${fastBreakfast ? 'translate-x-6 bg-bg' : 'translate-x-0.5 bg-text'}`} />
            </div>
          </button>
        </Field>

        {/* Training days */}
        <Field label="03" caption="Training">
          <div className="flex items-baseline justify-between gap-6 mb-4">
            <p className="font-display text-xl md:text-2xl text-text">
              Training <span className="text-italic-display text-muted-fg">days</span> per week
            </p>
            <span className="text-numeral text-display-lg text-gold leading-none">
              {String(trainingDays).padStart(2, '0')}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={7}
            step={1}
            value={trainingDays}
            onChange={(e) => setTrainingDays(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-kicker mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (<span key={n}>{n}</span>))}
          </div>
        </Field>

        {/* Diet style */}
        <Field label="04" caption="Diet Style">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {DIET_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDietStyle(s)}
                aria-pressed={dietStyle === s}
                className={`px-5 md:px-6 py-3 md:py-3.5 border font-display font-semibold tracking-wide capitalize transition-all ${dietStyle === s ? 'bg-gold text-bg border-gold' : 'border-bba-border bg-surface text-text hover:border-bba-border-strong'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Cuisines */}
        <Field label="05" caption="Cuisines">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {CUISINE_OPTIONS.map((c) => {
              const active = cuisines.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  aria-pressed={active}
                  className={`px-5 md:px-6 py-3 md:py-3.5 border font-display font-semibold tracking-wide transition-all ${active ? 'bg-gold text-bg border-gold' : 'border-bba-border bg-surface text-text hover:border-bba-border-strong'}`}
                >
                  {c}
                </button>
              )
            })}
          </div>
          <p className="text-kicker mt-3">Pick none, one, or all. No wrong answer.</p>
        </Field>

        {/* Allergies + dislikes */}
        <Field label="06" caption="Off the Table">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <FreeText id="allergies" label="Allergies" placeholder="peanuts, shellfish..." value={allergies} onChange={setAllergies} />
            <FreeText id="dislikes" label="Hard No's" placeholder="mushrooms, broccoli..." value={dislikes} onChange={setDislikes} />
          </div>
        </Field>

        {/* Nav */}
        <div className="border-t border-bba-border pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="text-kicker text-faint hover:text-text transition-colors text-left disabled:opacity-50"
          >
            ←&nbsp;&nbsp;Back to goal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group bg-gold text-bg font-display font-bold uppercase tracking-wider px-8 md:px-12 py-4 md:py-5 text-base md:text-lg hover:bg-gold-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center justify-center gap-3">
              Cut My Week
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
        </div>
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
          <span className="text-gold">{label}</span>
          <span className="block mt-2 text-faint">{caption}</span>
        </p>
      </div>
      <div>{children}</div>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  highlight: boolean
  capitalize?: boolean
}

function Stat({ label, value, highlight, capitalize }: StatProps) {
  return (
    <div>
      <p className="text-kicker mb-1">{label}</p>
      <p className={`text-numeral font-display text-2xl md:text-3xl font-bold leading-none ${highlight ? 'text-gold' : 'text-text'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  )
}

interface FreeTextProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}

function FreeText({ id, label, placeholder, value, onChange }: FreeTextProps) {
  return (
    <div className="border-b-2 border-bba-border focus-within:border-gold transition-colors pb-3">
      <label htmlFor={id} className="block text-kicker mb-2">{label}</label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-text font-display text-xl md:text-2xl outline-none placeholder:text-faint placeholder:italic placeholder:font-light"
      />
    </div>
  )
}
