'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { BBALogo } from './BBALogo'

interface HeroProps {
  onCta: () => void
}

export function Hero({ onCta }: HeroProps) {
  return (
    <section className="relative grain min-h-[100svh] flex flex-col overflow-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Top kicker bar */}
      <header className="relative z-10 px-6 md:px-12 pt-8 md:pt-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BBALogo size={48} />
          <span className="text-kicker hidden sm:inline">Better Body Academy</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/member"
            className="text-kicker hover:text-blue transition-colors group inline-flex items-center gap-2"
          >
            <span>Member</span>
            <span aria-hidden="true" className="text-blue transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <span className="text-kicker hidden sm:inline text-faint">Issue 01 / 2026</span>
        </div>
      </header>

      {/* Big editorial moment */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 py-16 md:py-24">
        {/* Oversized BB monogram, off-edge anchor */}
        <div
          aria-hidden="true"
          className="absolute right-[-8vw] md:right-[-4vw] top-1/2 -translate-y-1/2 pointer-events-none select-none"
        >
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 0.06, x: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-none text-text glyph-bb-hero"
          >
            BB
          </motion.div>
        </div>

        <div className="relative max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-kicker mb-6 md:mb-8"
          >
            <span className="text-blue">●</span>&nbsp;&nbsp;The Transformation Brief
          </motion.p>

          <h1 className="text-display-xl mb-8 md:mb-10">
            <RevealLine delay={0.15}>Your week.</RevealLine>
            <RevealLine delay={0.3}>
              <span className="text-italic-display text-blue">Real</span> food.
            </RevealLine>
            <RevealLine delay={0.45}>No BS.</RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-muted-fg text-lg md:text-2xl max-w-2xl leading-snug font-display font-light"
          >
            Tell us what you're chasing. We'll cut you a seven day plan in Jase's voice. Built for men who are done playing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-10 md:mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <button
              type="button"
              onClick={onCta}
              className="group relative overflow-hidden bg-blue text-bg font-display font-bold uppercase tracking-wider px-8 md:px-10 py-5 text-base md:text-lg rounded-none transition-all hover:bg-blue-hover focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-4"
            >
              <span className="relative z-10 inline-flex items-center gap-3">
                Generate Your Week
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
            <p className="text-kicker">Takes 60 seconds. Coach voice. Real macros.</p>
          </motion.div>
        </div>
      </div>

      {/* Bottom rule + meta strip */}
      <footer className="relative z-10 px-6 md:px-12 pb-8 md:pb-10">
        <div className="border-t border-bba-border pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-kicker">
          <div>
            <span className="block text-text font-display text-2xl font-bold mb-1">01</span>
            Built for transformation
          </div>
          <div>
            <span className="block text-text font-display text-2xl font-bold mb-1">07</span>
            Days, ready in 60 seconds
          </div>
          <div>
            <span className="block text-text font-display text-2xl font-bold mb-1">∞</span>
            Variations on demand
          </div>
          <div>
            <span className="block text-text font-display text-2xl font-bold mb-1 text-blue">No BS</span>
            Honest plans, real food
          </div>
        </div>
      </footer>
    </section>
  )
}

interface RevealLineProps {
  children: React.ReactNode
  delay?: number
}

function RevealLine({ children, delay = 0 }: RevealLineProps) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  )
}
