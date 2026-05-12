'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { z } from 'zod'
import { Intake, type IntakeInput } from '@/lib/schema'
import { calcDailyTargets } from '@/lib/calc'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type IntakeFormValues = z.input<typeof Intake>
type CalorieMode = 'know' | 'calculate'
type Sex = 'male' | 'female'
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

interface IntakeFormProps {
  onSubmit: (intake: IntakeInput) => void
  disabled?: boolean
}

interface CalcState {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: Activity
}

const cuisineOptions = ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'] as const
const dietOptions = ['omnivore', 'vegetarian', 'vegan'] as const
const goalOptions = [
  { value: 'cut', label: 'Cut', sub: 'Strip fat' },
  { value: 'maintain', label: 'Maintain', sub: 'Hold the line' },
  { value: 'gain', label: 'Gain', sub: 'Build size' },
] as const
const mealCountOptions = [3, 4, 5] as const
const activityOptions: { value: Activity; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Sedentary', sub: 'Desk job, no training' },
  { value: 'light', label: 'Light', sub: '1 to 3 days a week' },
  { value: 'moderate', label: 'Moderate', sub: '3 to 5 days a week' },
  { value: 'active', label: 'Active', sub: '6 to 7 days a week' },
  { value: 'very_active', label: 'Very Active', sub: 'Daily plus physical job' },
]

export function IntakeForm({ onSubmit, disabled }: IntakeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<IntakeFormValues, undefined, IntakeInput>({
    resolver: zodResolver(Intake),
    defaultValues: {
      goal: 'cut',
      calories: 2000,
      protein: 180,
      mealsPerDay: 4,
      fastBreakfast: false,
      allergies: '',
      trainingDays: 4,
      dietStyle: 'omnivore',
      cuisines: [],
      dislikes: '',
    },
  })

  const trainingDays = watch('trainingDays')
  const watchedGoal = watch('goal')

  // Calorie mode: 'know' (user types their own) vs 'calculate' (Mifflin-St Jeor)
  // Default to 'calculate' per Noemi's feedback — most leads don't know their numbers.
  const [calorieMode, setCalorieMode] = useState<CalorieMode>('calculate')
  const [calc, setCalc] = useState<CalcState>({
    sex: 'male',
    age: 42,
    heightCm: 180,
    weightKg: 90,
    activityLevel: 'moderate',
  })

  // When in calculate mode, recompute calories + protein every time the
  // calc inputs OR the goal change, and write them into the form state.
  useEffect(() => {
    if (calorieMode !== 'calculate') return
    const goalForCalc = (watchedGoal ?? 'cut') as 'cut' | 'maintain' | 'gain'
    const targets = calcDailyTargets({ ...calc, goal: goalForCalc })
    setValue('calories', targets.calories, { shouldValidate: true })
    setValue('protein', targets.protein, { shouldValidate: true })
  }, [calorieMode, calc, watchedGoal, setValue])

  const livePreview = calcDailyTargets({
    ...calc,
    goal: (watchedGoal ?? 'cut') as 'cut' | 'maintain' | 'gain',
  })

  return (
    <section className="relative px-6 md:px-12 py-20 md:py-32 max-w-5xl mx-auto">
      {/* Section header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-16 md:mb-20"
      >
        <p className="text-kicker mb-4">
          <span className="text-blue">02</span>&nbsp;&nbsp;The Brief
        </p>
        <h2 className="text-display-lg mb-6">
          Tell us<br />
          <span className="text-italic-display text-blue">what you want.</span>
        </h2>
        <p className="text-muted-fg text-lg max-w-xl font-display font-light leading-snug">
          Eight questions. Honest answers. That's all we need.
        </p>
      </motion.header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-16 md:space-y-20">
        {/* GOAL */}
        <Block number="01" label="Goal">
          <Controller
            name="goal"
            control={control}
            render={({ field }) => (
              <ToggleGroup
                value={[field.value]}
                onValueChange={(v) => v[0] && field.onChange(v[0])}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
              >
                {goalOptions.map((opt) => (
                  <ToggleGroupItem
                    key={opt.value}
                    value={opt.value}
                    className="h-auto min-h-28 md:min-h-32 p-6 md:p-7 border border-bba-border bg-surface transition-all hover:border-bba-border-strong data-[pressed]:bg-bg data-[pressed]:border-blue data-[pressed]:shadow-[0_0_0_1px_var(--color-blue)]"
                  >
                    <span className="flex flex-col items-start justify-center gap-2 w-full text-left">
                      <span className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-text leading-none">
                        {opt.label}
                      </span>
                      <span className="text-kicker">{opt.sub}</span>
                    </span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Block>

        {/* CALORIES + PROTEIN — two modes */}
        <Block number="02" label="Daily Targets">
          {/* Mode switch */}
          <div className="mb-6 inline-flex p-1 border border-bba-border bg-surface rounded-sm">
            <button
              type="button"
              onClick={() => setCalorieMode('calculate')}
              aria-pressed={calorieMode === "calculate" ? true : false}
              className={`px-4 md:px-5 py-2 md:py-2.5 text-kicker transition-colors ${calorieMode === 'calculate' ? 'bg-blue text-bg' : 'text-muted-fg hover:text-text'}`}
            >
              Calculate for me
            </button>
            <button
              type="button"
              onClick={() => setCalorieMode('know')}
              aria-pressed={calorieMode === "know" ? true : false}
              className={`px-4 md:px-5 py-2 md:py-2.5 text-kicker transition-colors ${calorieMode === 'know' ? 'bg-blue text-bg' : 'text-muted-fg hover:text-text'}`}
            >
              I know my numbers
            </button>
          </div>

          <AnimatePresence mode="wait">
            {calorieMode === 'calculate' ? (
              <motion.div
                key="calc-mode"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <p className="text-muted-fg text-sm md:text-base leading-snug max-w-xl">
                  Most people don't know their calories. We'll figure it out from a few stats. This is the same equation a dietitian would use (Mifflin-St Jeor).
                </p>

                {/* Sex */}
                <div>
                  <p className="text-kicker mb-3">Sex</p>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    {(['male', 'female'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCalc((c) => ({ ...c, sex: s }))}
                        aria-pressed={calc.sex === s ? true : false}
                        className={`p-4 md:p-5 border text-left capitalize transition-all ${calc.sex === s ? 'border-blue bg-bg shadow-[0_0_0_1px_var(--color-blue)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
                      >
                        <span className="font-display text-xl md:text-2xl font-bold text-text">
                          {s}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age + Height + Weight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <CalcNumber id="calc-age" label="Age" suffix="yrs" value={calc.age} onChange={(v) => setCalc((c) => ({ ...c, age: v }))} min={16} max={99} />
                  <CalcNumber id="calc-height" label="Height" suffix="cm" value={calc.heightCm} onChange={(v) => setCalc((c) => ({ ...c, heightCm: v }))} min={120} max={230} />
                  <CalcNumber id="calc-weight" label="Weight" suffix="kg" value={calc.weightKg} onChange={(v) => setCalc((c) => ({ ...c, weightKg: v }))} min={35} max={250} step={0.5} />
                </div>

                {/* Activity */}
                <div>
                  <p className="text-kicker mb-3">Activity Level</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCalc((c) => ({ ...c, activityLevel: opt.value }))}
                        aria-pressed={calc.activityLevel === opt.value ? true : false}
                        className={`p-4 md:p-5 border text-left transition-all ${calc.activityLevel === opt.value ? 'border-blue bg-bg shadow-[0_0_0_1px_var(--color-blue)]' : 'border-bba-border bg-surface hover:border-bba-border-strong'}`}
                      >
                        <p className="font-display text-lg md:text-xl font-bold text-text mb-1">{opt.label}</p>
                        <p className="text-kicker">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live preview */}
                <div className="border-t border-bba-border pt-6 grid grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <p className="text-kicker mb-1">BMR</p>
                    <p className="text-numeral font-display text-2xl md:text-3xl font-bold text-muted-fg leading-none">{livePreview.bmr}</p>
                    <p className="text-kicker mt-1 text-faint">Resting</p>
                  </div>
                  <div>
                    <p className="text-kicker mb-1">Calories</p>
                    <p className="text-numeral font-display text-3xl md:text-4xl font-bold text-blue leading-none">{livePreview.calories}</p>
                    <p className="text-kicker mt-1 text-faint">Target / day</p>
                  </div>
                  <div>
                    <p className="text-kicker mb-1">Protein</p>
                    <p className="text-numeral font-display text-3xl md:text-4xl font-bold text-blue leading-none">{livePreview.protein}g</p>
                    <p className="text-kicker mt-1 text-faint">Target / day</p>
                  </div>
                </div>
                <p className="text-kicker text-faint">
                  These numbers update with your goal (cut, maintain, gain).
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="know-mode"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
              >
                <NumberField
                  id="calories"
                  labelTop="Calories"
                  suffix="cal"
                  registerProps={register('calories', { valueAsNumber: true })}
                  error={errors.calories?.message}
                />
                <NumberField
                  id="protein"
                  labelTop="Protein"
                  suffix="g"
                  registerProps={register('protein', { valueAsNumber: true })}
                  error={errors.protein?.message}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Block>

        {/* TRAINING DAYS */}
        <Block number="03" label="Training Volume">
          <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-6">
              <p className="font-display text-2xl md:text-3xl text-text">
                Training <span className="text-italic-display text-muted-fg">days</span> per week
              </p>
              <span className="text-numeral text-display-lg text-blue leading-none">
                {String(trainingDays).padStart(2, '0')}
              </span>
            </div>
            <Controller
              name="trainingDays"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={7}
                  step={1}
                  value={[field.value]}
                  onValueChange={(v) => {
                    const next = Array.isArray(v) ? v[0] : v
                    field.onChange(next)
                  }}
                />
              )}
            />
            <div className="flex justify-between text-kicker">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </div>
        </Block>

        {/* MEALS + FASTING */}
        <Block number="04" label="Meals & Timing">
          <div className="space-y-8">
            <div>
              <p className="text-kicker mb-3">How many meals per day?</p>
              <Controller
                name="mealsPerDay"
                control={control}
                render={({ field }) => (
                  <ToggleGroup
                    value={[String(field.value ?? 4)]}
                    onValueChange={(v) => v[0] && field.onChange(Number(v[0]))}
                    className="grid grid-cols-3 gap-2 md:gap-3"
                  >
                    {mealCountOptions.map((n) => (
                      <ToggleGroupItem
                        key={n}
                        value={String(n)}
                        className="h-auto min-h-24 md:min-h-28 py-4 md:py-5 px-2 border border-bba-border bg-surface text-text transition-all hover:border-bba-border-strong data-[pressed]:bg-bg data-[pressed]:border-blue data-[pressed]:shadow-[0_0_0_1px_var(--color-blue)]"
                      >
                        <span className="flex flex-col items-center justify-center gap-2 w-full">
                          <span className="font-display text-3xl md:text-4xl font-bold leading-none">{n}</span>
                          <span className="text-kicker text-center whitespace-nowrap">
                            {n === 3 ? 'three squares' : n === 4 ? 'three plus snack' : 'plus two snacks'}
                          </span>
                        </span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </div>

            <div className="border-t border-bba-border pt-6">
              <Controller
                name="fastBreakfast"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    aria-pressed={field.value ?? false}
                    className="flex items-center justify-between gap-4 w-full text-left p-5 md:p-6 border border-bba-border bg-surface hover:border-bba-border-strong transition-colors group"
                  >
                    <div>
                      <p className="font-display text-xl md:text-2xl text-text mb-1">
                        Fast through breakfast?
                      </p>
                      <p className="text-kicker">
                        Skip breakfast, eat later. Intermittent fasting style.
                      </p>
                    </div>
                    <div
                      className={`relative inline-flex w-14 h-8 rounded-full border transition-colors flex-shrink-0 ${field.value ? 'bg-blue border-blue' : 'bg-elevated border-bba-border-strong'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-7 h-7 rounded-full transition-transform ${field.value ? 'translate-x-6 bg-bg' : 'translate-x-0.5 bg-text'}`}
                      />
                    </div>
                  </button>
                )}
              />
            </div>
          </div>
        </Block>

        {/* DIET STYLE */}
        <Block number="05" label="Diet Style">
          <Controller
            name="dietStyle"
            control={control}
            render={({ field }) => (
              <ToggleGroup
                value={[field.value]}
                onValueChange={(v) => v[0] && field.onChange(v[0])}
                className="flex flex-wrap gap-2 md:gap-3"
              >
                {dietOptions.map((s) => (
                  <ToggleGroupItem
                    key={s}
                    value={s}
                    className="px-5 md:px-6 py-3 md:py-3.5 border border-bba-border bg-surface text-text capitalize font-display font-semibold tracking-wide transition-all hover:border-bba-border-strong data-[pressed]:bg-blue data-[pressed]:text-bg data-[pressed]:border-blue"
                  >
                    {s}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Block>

        {/* CUISINES */}
        <Block number="06" label="Cuisine Preference">
          <Controller
            name="cuisines"
            control={control}
            render={({ field }) => (
              <ToggleGroup
                multiple
                value={field.value ?? []}
                onValueChange={(v) => field.onChange(v)}
                className="flex flex-wrap gap-2 md:gap-3"
              >
                {cuisineOptions.map((c) => (
                  <ToggleGroupItem
                    key={c}
                    value={c}
                    className="px-5 md:px-6 py-3 md:py-3.5 border border-bba-border bg-surface text-text font-display font-semibold tracking-wide transition-all hover:border-bba-border-strong data-[pressed]:bg-blue data-[pressed]:text-bg data-[pressed]:border-blue"
                  >
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
          <p className="text-kicker mt-3">Pick none, one, or all. No wrong answer.</p>
        </Block>

        {/* ALLERGIES + DISLIKES */}
        <Block number="07" label="Off the Table">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <TextField
              id="allergies"
              labelTop="Allergies"
              placeholder="peanuts, shellfish..."
              registerProps={register('allergies')}
            />
            <TextField
              id="dislikes"
              labelTop="Hard No's"
              placeholder="mushrooms, broccoli..."
              registerProps={register('dislikes')}
            />
          </div>
        </Block>

        {/* SUBMIT */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="pt-8 border-t border-bba-border"
        >
          <button
            type="submit"
            disabled={disabled}
            className="group relative overflow-hidden w-full md:w-auto bg-blue text-bg font-display font-bold uppercase tracking-wider px-10 md:px-14 py-5 md:py-6 text-base md:text-lg rounded-none transition-all hover:bg-blue-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-4"
          >
            <span className="relative z-10 inline-flex items-center gap-3">
              Cut My Week
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </button>
          <p className="text-kicker mt-5">Plan generates in 10 seconds. No login. No spam.</p>
        </motion.div>
      </form>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Subcomponents
   ───────────────────────────────────────────── */

interface BlockProps {
  number: string
  label: string
  children: React.ReactNode
}

function Block({ number, label, children }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-10"
    >
      <div className="md:pt-2">
        <p className="text-kicker">
          <span className="text-blue">{number}</span>
          <span className="block mt-2 text-faint">{label}</span>
        </p>
      </div>
      <div>{children}</div>
    </motion.div>
  )
}

interface NumberFieldProps {
  id: string
  labelTop: string
  suffix: string
  registerProps: ReturnType<ReturnType<typeof useForm>['register']>
  error?: string
}

function NumberField({ id, labelTop, suffix, registerProps, error }: NumberFieldProps) {
  return (
    <div className="border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
      <label htmlFor={id} className="block text-kicker mb-2">
        {labelTop}
      </label>
      <div className="flex items-baseline gap-3">
        <input
          id={id}
          type="number"
          {...registerProps}
          className="w-full bg-transparent text-numeral text-4xl md:text-5xl font-display font-bold text-text outline-none placeholder:text-faint [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-muted-fg font-display text-lg uppercase tracking-wide">{suffix}</span>
      </div>
      {error && <p className="text-alert text-kicker mt-2">{error}</p>}
    </div>
  )
}

interface TextFieldProps {
  id: string
  labelTop: string
  placeholder: string
  registerProps: ReturnType<ReturnType<typeof useForm>['register']>
}

function TextField({ id, labelTop, placeholder, registerProps }: TextFieldProps) {
  return (
    <div className="border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
      <label htmlFor={id} className="block text-kicker mb-2">
        {labelTop}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        {...registerProps}
        className="w-full bg-transparent text-text font-display text-xl md:text-2xl outline-none placeholder:text-faint placeholder:italic placeholder:font-light"
      />
    </div>
  )
}

interface CalcNumberProps {
  id: string
  label: string
  suffix: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}

function CalcNumber({ id, label, suffix, value, onChange, min, max, step = 1 }: CalcNumberProps) {
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
          className="w-full bg-transparent text-numeral text-3xl md:text-4xl font-display font-bold text-text outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-muted-fg font-display text-base uppercase tracking-wide">{suffix}</span>
      </div>
    </div>
  )
}
