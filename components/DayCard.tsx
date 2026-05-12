'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { DayType, MealType } from '@/lib/schema'

interface DayCardProps {
  day: DayType
  index: number
}

const DAY_ABBR: Record<DayType['name'], string> = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
}

type ImgState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'failed' }

export function DayCard({ day, index }: DayCardProps) {
  const heroMeal = pickHeroMeal(day.meals)
  const [img, setImg] = useState<ImgState>({ status: 'idle' })

  // Trigger image fetch when the card enters the viewport (cheap proxy:
  // fire on mount with a staggered delay so 7 cards don't hammer kie.ai
  // at the exact same millisecond).
  useEffect(() => {
    if (!heroMeal) return
    let cancelled = false

    const t = setTimeout(async () => {
      if (cancelled) return
      setImg({ status: 'loading' })
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mealName: heroMeal.name,
            ingredients: heroMeal.ingredients,
            aspectRatio: '4:3',
          }),
        })
        if (!res.ok) throw new Error(`Image API ${res.status}`)
        const data: { url?: string } = await res.json()
        if (cancelled) return
        if (data.url) setImg({ status: 'ready', url: data.url })
        else setImg({ status: 'failed' })
      } catch {
        if (!cancelled) setImg({ status: 'failed' })
      }
    }, index * 250) // stagger 0/250/500ms... up to 1.5s for day 7

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [heroMeal, index])

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-surface border border-bba-border p-6 md:p-8 group hover:border-bba-border-strong transition-colors"
    >
      {/* Hero image (Noemi's request — May 12) */}
      {heroMeal && (
        <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-elevated border border-bba-border">
          {/* Skeleton shimmer */}
          {img.status !== 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-elevated via-surface to-elevated animate-pulse" />
              <p className="relative z-10 text-kicker text-faint">
                {img.status === 'failed' ? heroMeal.name : 'Plating it'}
              </p>
            </div>
          )}
          {img.status === 'ready' && (
            <motion.img
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              src={img.url}
              alt={heroMeal.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Hero meal label overlay */}
          {img.status === 'ready' && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent p-4 md:p-5">
              <p className="text-kicker text-text/80">{heroMeal.slot.toUpperCase()}</p>
              <p className="font-display text-italic-display text-xl md:text-2xl text-text leading-tight">
                {heroMeal.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Spread header */}
      <header className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-bba-border">
        <div>
          <p className="text-kicker mb-1">
            <span className="text-blue">DAY</span>&nbsp;&nbsp;{String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none">
            {day.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-numeral font-display text-3xl md:text-4xl font-bold text-blue leading-none">
            {day.totals.calories}
          </p>
          <p className="text-kicker mt-1">cal · {day.totals.protein}g pro</p>
        </div>
      </header>

      {/* Meals list — editorial style */}
      <div className="space-y-5">
        {day.meals.map((meal, i) => (
          <div key={meal.slot} className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4">
            <div className="pt-1">
              <p className="text-kicker">{meal.slot.slice(0, 3).toUpperCase()}</p>
              <p className="text-numeral text-faint text-sm mt-1">
                {String(i + 1).padStart(2, '0')}
              </p>
            </div>
            <div className="border-l border-bba-border pl-5">
              <p className="font-display text-lg md:text-xl text-text leading-tight mb-1">
                <span className="text-italic-display">{meal.name}</span>
              </p>
              {meal.ingredients.length > 0 && (
                <p className="text-muted-fg text-sm mb-2 leading-snug">
                  {meal.ingredients.join(', ')}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-numeral text-xs text-faint">
                <span><span className="text-text">{meal.calories}</span> cal</span>
                <span><span className="text-text">{meal.protein}</span>p</span>
                <span><span className="text-text">{meal.carbs}</span>c</span>
                <span><span className="text-text">{meal.fat}</span>f</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer macros — full bar */}
      <footer className="mt-7 pt-5 border-t border-bba-border grid grid-cols-4 gap-3 text-numeral">
        <Macro label="CAL" value={day.totals.calories} />
        <Macro label="PRO" value={`${day.totals.protein}g`} />
        <Macro label="CARB" value={`${day.totals.carbs}g`} />
        <Macro label="FAT" value={`${day.totals.fat}g`} />
      </footer>

      {/* Side day label (decorative, lg+) */}
      <span
        aria-hidden="true"
        className="hidden lg:block absolute -left-3 top-8 text-kicker text-faint origin-top-left rotate-90 whitespace-nowrap pointer-events-none"
      >
        {DAY_ABBR[day.name]} / {String(index + 1).padStart(2, '0')}
      </span>
    </motion.article>
  )
}

/**
 * Picks the most "visual" meal of the day for the hero image.
 * Priority: Dinner > Lunch > Breakfast > first available.
 * Snacks fall through — they rarely look like a magazine plate.
 */
function pickHeroMeal(meals: MealType[]): MealType | null {
  if (meals.length === 0) return null
  const priority: MealType['slot'][] = ['Dinner', 'Lunch', 'Breakfast', 'Snack', 'Snack 2']
  for (const slot of priority) {
    const found = meals.find((m) => m.slot === slot)
    if (found) return found
  }
  return meals[0] ?? null
}

interface MacroProps {
  label: string
  value: string | number
}

function Macro({ label, value }: MacroProps) {
  return (
    <div>
      <p className="text-kicker mb-1">{label}</p>
      <p className="font-display text-base md:text-lg font-bold text-text">{value}</p>
    </div>
  )
}
