import type { DayType } from '@/lib/schema'

interface DayCardProps {
  day: DayType
}

export function DayCard({ day }: DayCardProps) {
  return (
    <article className="bg-surface border border-bba-border rounded-lg p-6 space-y-4 hover:bg-elevated transition-colors">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-display text-2xl font-bold uppercase">{day.name}</h3>
        <div className="font-mono text-sm text-muted-fg">
          <span className="text-gold">{day.totals.calories}</span> cal
          <span className="mx-2 text-faint">|</span>
          <span className="text-gold">{day.totals.protein}g</span> protein
        </div>
      </header>

      <div className="space-y-3">
        {day.meals.map((meal) => (
          <div key={meal.slot} className="border-l-2 border-gold pl-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-xs uppercase text-faint mr-2">{meal.slot}</span>
                <span className="font-display font-semibold">{meal.name}</span>
              </div>
              <span className="font-mono text-xs text-muted-fg">
                {meal.calories} cal . {meal.protein}p . {meal.carbs}c . {meal.fat}f
              </span>
            </div>
            {meal.ingredients.length > 0 && (
              <p className="text-sm text-muted-fg mt-1">{meal.ingredients.join(', ')}</p>
            )}
          </div>
        ))}
      </div>

      <footer className="pt-3 border-t border-bba-border font-mono text-xs text-faint flex justify-between">
        <span>Carbs: <span className="text-muted-fg">{day.totals.carbs}g</span></span>
        <span>Fat: <span className="text-muted-fg">{day.totals.fat}g</span></span>
      </footer>
    </article>
  )
}
