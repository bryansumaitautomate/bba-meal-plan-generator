'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { z } from 'zod'
import { Intake, type IntakeInput } from '@/lib/schema'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type IntakeFormValues = z.input<typeof Intake>

interface IntakeFormProps {
  onSubmit: (intake: IntakeInput) => void
  disabled?: boolean
}

const cuisineOptions = ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'] as const
const dietOptions = ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'] as const
const goalOptions = [
  { value: 'cut', label: 'Cut', sub: 'Strip fat' },
  { value: 'maintain', label: 'Maintain', sub: 'Hold the line' },
  { value: 'bulk', label: 'Bulk', sub: 'Build size' },
] as const

export function IntakeForm({ onSubmit, disabled }: IntakeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<IntakeFormValues, undefined, IntakeInput>({
    resolver: zodResolver(Intake),
    defaultValues: {
      goal: 'cut',
      calories: 2000,
      protein: 180,
      allergies: '',
      trainingDays: 4,
      dietStyle: 'omnivore',
      cuisines: [],
      dislikes: '',
    },
  })

  const trainingDays = watch('trainingDays')

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
          <span className="text-gold">02</span>&nbsp;&nbsp;The Brief
        </p>
        <h2 className="text-display-lg mb-6">
          Tell us<br />
          <span className="text-italic-display text-gold">what you want.</span>
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
                    className="flex flex-col items-start gap-2 p-6 md:p-7 border border-bba-border bg-surface text-left transition-all hover:border-bba-border-strong data-[pressed]:bg-bg data-[pressed]:border-gold data-[pressed]:shadow-[0_0_0_1px_var(--color-gold)]"
                  >
                    <span className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-text">
                      {opt.label}
                    </span>
                    <span className="text-kicker">{opt.sub}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Block>

        {/* CALORIES + PROTEIN */}
        <Block number="02" label="Daily Targets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
          </div>
        </Block>

        {/* TRAINING DAYS */}
        <Block number="03" label="Training Volume">
          <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-6">
              <p className="font-display text-2xl md:text-3xl text-text">
                Training <span className="text-italic-display text-muted-fg">days</span> per week
              </p>
              <span className="text-numeral text-display-lg text-gold leading-none">
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

        {/* DIET STYLE */}
        <Block number="04" label="Diet Style">
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
                    className="px-5 md:px-6 py-3 md:py-3.5 border border-bba-border bg-surface text-text capitalize font-display font-semibold tracking-wide transition-all hover:border-bba-border-strong data-[pressed]:bg-gold data-[pressed]:text-bg data-[pressed]:border-gold"
                  >
                    {s}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Block>

        {/* CUISINES */}
        <Block number="05" label="Cuisine Preference">
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
                    className="px-5 md:px-6 py-3 md:py-3.5 border border-bba-border bg-surface text-text font-display font-semibold tracking-wide transition-all hover:border-bba-border-strong data-[pressed]:bg-gold data-[pressed]:text-bg data-[pressed]:border-gold"
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
        <Block number="06" label="Off the Table">
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
            className="group relative overflow-hidden w-full md:w-auto bg-gold text-bg font-display font-bold uppercase tracking-wider px-10 md:px-14 py-5 md:py-6 text-base md:text-lg rounded-none transition-all hover:bg-gold-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
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
          <span className="text-gold">{number}</span>
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
    <div className="border-b-2 border-bba-border focus-within:border-gold transition-colors pb-3">
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
    <div className="border-b-2 border-bba-border focus-within:border-gold transition-colors pb-3">
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
