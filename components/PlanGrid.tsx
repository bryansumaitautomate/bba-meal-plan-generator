'use client'

import { motion } from 'motion/react'
import type { PlanType } from '@/lib/schema'
import { DayCard } from './DayCard'
import { ShoppingList } from './ShoppingList'
import { LeadCapture } from './LeadCapture'

interface PlanGridProps {
  plan: PlanType
  showLeadCapture?: boolean
}

export function PlanGrid({ plan, showLeadCapture = true }: PlanGridProps) {
  const totalMeals = plan.days.reduce((sum, d) => sum + d.meals.length, 0)

  return (
    <>
      <section className="relative px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-kicker mb-4">
            <span className="text-gold">03</span>&nbsp;&nbsp;The Plan
          </p>
          <h2 className="text-display-lg mb-2">
            Your <span className="text-italic-display text-gold">week.</span>
          </h2>
          <p className="text-muted-fg text-lg max-w-xl font-display font-light leading-snug">
            Seven days. {totalMeals} meals. Cut for you.
          </p>
        </motion.header>

        {/* Coach quote — magazine pull-quote style */}
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mb-16 md:mb-24 max-w-4xl"
        >
          <span
            aria-hidden="true"
            className="absolute -left-2 md:-left-6 -top-8 md:-top-16 font-display text-gold leading-none select-none pointer-events-none glyph-quote"
          >
            &ldquo;
          </span>
          <p className="relative font-display text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-text pl-6 md:pl-12">
            <span className="text-italic-display font-bold">{plan.coachNote}</span>
          </p>
          <footer className="mt-6 md:mt-8 pl-6 md:pl-12 flex items-center gap-4">
            <div className="h-px w-12 bg-gold" />
            <p className="text-kicker">
              <span className="text-text">Jase Stuart</span>
              &nbsp;&nbsp;The Better Body Coach
            </p>
          </footer>
        </motion.blockquote>

        <hr className="rule-gold" />

        {/* Day grid — magazine spread */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-12 md:mt-16">
          {plan.days.map((day, i) => (
            <DayCard key={day.name} day={day} index={i} />
          ))}
        </div>
      </section>

      <hr className="rule-gold mx-6 md:mx-12" />

      {/* Shopping list — Jase's request 41:29 */}
      <ShoppingList sections={plan.shoppingList} />

      {/* Lead capture — non-member only, 44:40 */}
      {showLeadCapture && (
        <>
          <hr className="rule-gold mx-6 md:mx-12" />
          <LeadCapture />
        </>
      )}

      <div className="text-center text-kicker pb-8 px-6">
        ·&nbsp;&nbsp;End of brief&nbsp;&nbsp;·
      </div>
    </>
  )
}
