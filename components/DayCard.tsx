'use client'

import { motion } from 'motion/react'
import type { DayType } from '@/lib/schema'

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

export function DayCard({ day, index }: DayCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-surface border border-bba-border p-6 md:p-8 group hover:border-bba-border-strong transition-colors"
    >
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
