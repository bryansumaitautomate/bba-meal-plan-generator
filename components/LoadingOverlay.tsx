'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const QUOTES = [
  'Cooking up your week.',
  'No BS plans here.',
  'Real food incoming.',
  'Pulling it together.',
  'Almost there.',
] as const

const TICKER = [
  'CALORIES',
  'PROTEIN',
  'CARBS',
  'FAT',
  'INGREDIENTS',
  'TIMING',
  'VARIETY',
  'BALANCE',
] as const

export function LoadingOverlay() {
  const [index, setIndex] = useState(0)
  const [tick, setTick] = useState(0)
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((i) => (i + 1) % TICKER.length), 600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000
      // pseudo-progress: ease toward 99 over ~12 seconds, never quite reaching 100
      const pct = Math.min(99, Math.round((1 - Math.exp(-elapsed / 4)) * 100))
      setCounter(pct)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 grain bg-bg flex flex-col"
    >
      <div className="grain-overlay" aria-hidden="true" />

      {/* Top status bar */}
      <div className="relative z-10 px-6 md:px-12 pt-8 md:pt-12 flex items-center justify-between">
        <p className="text-kicker">
          <span className="text-gold">●</span>&nbsp;&nbsp;Generating
        </p>
        <p className="text-kicker text-numeral text-text">
          {String(counter).padStart(3, '0')}
          <span className="text-faint">/100</span>
        </p>
      </div>

      {/* Centerpiece */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Big BB pulse */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display font-bold leading-none mb-12 select-none glyph-bb-loading"
        >
          <span className="text-text">B</span>
          <span className="text-gold">B</span>
        </motion.div>

        {/* Rotating quote */}
        <div className="h-[3.5rem] md:h-[4.5rem] flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={QUOTES[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-display-md text-text"
            >
              {QUOTES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Word ticker (kicker-style) */}
        <div className="flex items-center gap-4 text-kicker">
          <span className="text-faint">Tuning</span>
          <span className="vertical-rule h-3 inline-block" />
          <AnimatePresence mode="wait">
            <motion.span
              key={TICKER[tick]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-gold tracking-[0.3em]"
            >
              {TICKER[tick]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom progress rule */}
      <div className="relative z-10 px-6 md:px-12 pb-8 md:pb-12">
        <div className="h-px w-full bg-bba-border-strong relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gold"
            animate={{ width: `${counter}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
