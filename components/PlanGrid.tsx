import type { PlanType } from '@/lib/schema'
import { DayCard } from './DayCard'

interface PlanGridProps {
  plan: PlanType
}

export function PlanGrid({ plan }: PlanGridProps) {
  return (
    <section className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="bg-elevated border border-gold/30 rounded-lg p-6 text-center">
        <p className="font-display text-xl text-text italic">"{plan.coachNote}"</p>
        <p className="font-mono text-xs uppercase text-gold mt-2">Jase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plan.days.map((day) => (
          <DayCard key={day.name} day={day} />
        ))}
      </div>
    </section>
  )
}
