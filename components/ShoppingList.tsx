'use client'

import { motion } from 'motion/react'
import type { ShoppingSectionType } from '@/lib/schema'

interface ShoppingListProps {
  sections: ShoppingSectionType[]
}

export function ShoppingList({ sections }: ShoppingListProps) {
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className="relative px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto"
    >
      <header className="mb-10 md:mb-14 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-kicker mb-4">
            <span className="text-blue">04</span>&nbsp;&nbsp;The Cart
          </p>
          <h2 className="text-display-lg">
            Shopping <span className="text-italic-display text-blue">list.</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-kicker mb-1">Items</p>
          <p className="text-numeral font-display text-3xl md:text-5xl font-bold text-blue leading-none">
            {totalItems}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sections.map((section, idx) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="bg-surface border border-bba-border p-6 md:p-7 hover:border-bba-border-strong transition-colors"
          >
            <header className="flex items-baseline justify-between mb-4 pb-3 border-b border-bba-border">
              <h3 className="font-display font-bold uppercase tracking-tight text-text">
                {section.category}
              </h3>
              <span className="text-kicker text-numeral">{String(section.items.length).padStart(2, '0')}</span>
            </header>
            <ul className="space-y-2.5">
              {section.items.map((item, i) => (
                <li key={`${section.category}-${i}`} className="flex items-start gap-3 group">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block w-3 h-px bg-faint flex-shrink-0 group-hover:bg-blue group-hover:w-5 transition-all"
                  />
                  <span className="text-text leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
