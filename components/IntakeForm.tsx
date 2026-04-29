'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Intake, type IntakeInput } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type IntakeFormValues = z.input<typeof Intake>

interface IntakeFormProps {
  onSubmit: (intake: IntakeInput) => void
  disabled?: boolean
}

const cuisineOptions = ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American'] as const
const dietOptions = ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'] as const

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label className="text-text font-display uppercase tracking-wide">Goal</Label>
        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              value={[field.value]}
              onValueChange={(v) => v[0] && field.onChange(v[0])}
              className="justify-start gap-2"
            >
              <ToggleGroupItem value="cut" className="data-[pressed]:bg-gold data-[pressed]:text-bg border border-bba-border">Cut</ToggleGroupItem>
              <ToggleGroupItem value="maintain" className="data-[pressed]:bg-gold data-[pressed]:text-bg border border-bba-border">Maintain</ToggleGroupItem>
              <ToggleGroupItem value="bulk" className="data-[pressed]:bg-gold data-[pressed]:text-bg border border-bba-border">Bulk</ToggleGroupItem>
            </ToggleGroup>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories" className="text-text font-display uppercase tracking-wide">Daily calories</Label>
          <Input
            id="calories"
            type="number"
            {...register('calories', { valueAsNumber: true })}
            className="bg-surface border-bba-border text-text"
          />
          {errors.calories && <p className="text-alert text-sm">{errors.calories.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein" className="text-text font-display uppercase tracking-wide">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            {...register('protein', { valueAsNumber: true })}
            className="bg-surface border-bba-border text-text"
          />
          {errors.protein && <p className="text-alert text-sm">{errors.protein.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-text font-display uppercase tracking-wide">
          Training days per week: <span className="text-gold">{trainingDays}</span>
        </Label>
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
      </div>

      <div className="space-y-2">
        <Label className="text-text font-display uppercase tracking-wide">Diet style</Label>
        <Controller
          name="dietStyle"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              value={[field.value]}
              onValueChange={(v) => v[0] && field.onChange(v[0])}
              className="flex-wrap justify-start gap-2"
            >
              {dietOptions.map((s) => (
                <ToggleGroupItem
                  key={s}
                  value={s}
                  className="data-[pressed]:bg-gold data-[pressed]:text-bg border border-bba-border capitalize"
                >
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-text font-display uppercase tracking-wide">Cuisine preferences</Label>
        <Controller
          name="cuisines"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              multiple
              value={field.value ?? []}
              onValueChange={(v) => field.onChange(v)}
              className="flex-wrap justify-start gap-2"
            >
              {cuisineOptions.map((c) => (
                <ToggleGroupItem
                  key={c}
                  value={c}
                  className="data-[pressed]:bg-gold data-[pressed]:text-bg border border-bba-border"
                >
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies" className="text-text font-display uppercase tracking-wide">Allergies</Label>
        <Input
          id="allergies"
          type="text"
          placeholder="e.g. peanuts, shellfish"
          {...register('allergies')}
          className="bg-surface border-bba-border text-text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dislikes" className="text-text font-display uppercase tracking-wide">Dislikes</Label>
        <Input
          id="dislikes"
          type="text"
          placeholder="e.g. mushrooms, broccoli"
          {...register('dislikes')}
          className="bg-surface border-bba-border text-text"
        />
      </div>

      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-gold hover:bg-gold-hover text-bg font-display font-bold uppercase tracking-wide py-6 text-lg disabled:opacity-50"
      >
        Generate My Week
      </Button>
    </form>
  )
}
