'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'motion/react'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
const SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const
const MARQUEE_TOP = '  TRANSFORM  ·  NO BS  ·  REAL FOOD  ·  CUT  ·  BUILD  ·  BURN  ·  DAY 01  ·  DAY 02  ·  DAY 03  ·  DAY 04  ·  DAY 05  ·  DAY 06  ·  DAY 07  '
const MARQUEE_BOTTOM = '  BREAKFAST  ·  LUNCH  ·  DINNER  ·  SNACK  ·  PROTEIN  ·  CARBS  ·  FAT  ·  FUEL  ·  WIN  ·  THE BETTER BODY  ·  '

export function LoadingOverlay() {
  const [dayIdx, setDayIdx] = useState(0)
  const [slotIdx, setSlotIdx] = useState(0)
  const [counter, setCounter] = useState(0)

  // Cycle days every 1.4s
  useEffect(() => {
    const id = setInterval(() => setDayIdx((i) => (i + 1) % DAYS.length), 1400)
    return () => clearInterval(id)
  }, [])

  // Cycle meal slots faster (every 350ms)
  useEffect(() => {
    const id = setInterval(() => setSlotIdx((i) => (i + 1) % SLOTS.length), 350)
    return () => clearInterval(id)
  }, [])

  // Counter eases toward 99 over ~12s
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000
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
      className="fixed inset-0 z-50 grain bg-bg overflow-hidden"
    >
      <div className="grain-overlay" aria-hidden="true" />

      {/* ─── BACKGROUND MARQUEES ─── */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between py-20 md:py-32 pointer-events-none select-none" aria-hidden="true">
        <Marquee text={MARQUEE_TOP} direction="left" speed={45} className="text-text/[0.04]" />
        <Marquee text={MARQUEE_BOTTOM} direction="right" speed={60} className="text-blue/[0.06]" />
      </div>

      {/* ─── TOP STATUS BAR ─── */}
      <div className="absolute top-0 inset-x-0 z-20 px-6 md:px-12 pt-8 md:pt-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block w-2 h-2 rounded-full bg-blue"
          />
          <p className="text-kicker text-text">Generating</p>
        </div>
        <p className="text-kicker text-numeral text-text">
          {String(counter).padStart(3, '0')}
          <span className="text-faint">/100</span>
        </p>
      </div>

      {/* ─── CENTER STAGE ─── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 md:px-12">
        {/* Top kicker — cycling meal slot */}
        <div className="mb-8 md:mb-10 h-6 flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={SLOTS[slotIdx]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-kicker text-blue tracking-[0.4em]"
            >
              · {SLOTS[slotIdx]} ·
            </motion.p>
          </AnimatePresence>
        </div>

        {/* MAIN: Day flip card */}
        <div className="perspective-[1000px] mb-10 md:mb-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={DAYS[dayIdx]}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center origin-bottom"
            >
              <p className="text-kicker text-faint mb-3">DAY {String(dayIdx + 1).padStart(2, '0')}</p>
              <p className="font-display glyph-day-flip font-bold leading-none tracking-tight text-text">
                {DAYS[dayIdx]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Macro tickers — slot machine style */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 w-full max-w-2xl">
          <MacroTicker label="CAL" target={2000} />
          <MacroTicker label="PRO" target={180} suffix="g" highlight />
          <MacroTicker label="DAYS" target={7} static />
        </div>

        {/* Status line under tickers */}
        <p className="mt-12 md:mt-16 text-kicker text-faint">
          Cooking up your week.&nbsp;&nbsp;<span className="text-blue">No BS plans here.</span>
        </p>
      </div>

      {/* ─── BOTTOM PROGRESS RULE ─── */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-6 md:px-12 pb-8 md:pb-12">
        <div className="flex items-center justify-between mb-3">
          <p className="text-kicker text-faint">7 days · 28 meals · cut for you</p>
          <p className="text-kicker text-numeral text-faint">DAY {String(dayIdx + 1).padStart(2, '0')} / 07</p>
        </div>
        <div className="h-px w-full bg-bba-border-strong relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-blue"
            animate={{ width: `${counter}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Marquee — infinite horizontal scroll
   ───────────────────────────────────────────── */

interface MarqueeProps {
  text: string
  direction: 'left' | 'right'
  speed: number // seconds per loop
  className?: string
}

function Marquee({ text, direction, speed, className = '' }: MarqueeProps) {
  const x = direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className={`flex font-display font-bold uppercase tracking-tight glyph-marquee ${className}`}
      >
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MacroTicker — slot machine numeral
   Cycles to random values every ~1.4s, then re-rolls
   ───────────────────────────────────────────── */

interface MacroTickerProps {
  label: string
  target: number
  suffix?: string
  highlight?: boolean
  static?: boolean
}

function MacroTicker({ label, target, suffix = '', highlight, static: isStatic }: MacroTickerProps) {
  const value = useMotionValue(0)
  const display = useTransform(value, (v) => Math.round(v).toString())
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isStatic) {
      const c = animate(value, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1] })
      return c.stop
    }

    let cancelled = false
    let cleanup: (() => void) | undefined

    const cycle = () => {
      if (cancelled) return
      // pick a random target near the real target
      const next = Math.round(target * (0.6 + Math.random() * 0.7))
      const c = animate(value, next, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
      cleanup = () => c.stop()
    }

    cycle()
    const id = setInterval(cycle, 1400)
    return () => {
      cancelled = true
      clearInterval(id)
      cleanup?.()
    }
  }, [value, target, isStatic])

  useEffect(() => {
    const unsub = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v
    })
    return unsub
  }, [display])

  return (
    <div className="text-center">
      <p className="text-kicker mb-2">{label}</p>
      <p className={`font-display text-numeral text-3xl md:text-5xl font-bold leading-none ${highlight ? 'text-blue' : 'text-text'}`}>
        <span ref={ref}>0</span>
        {suffix && <span className="text-muted-fg text-base md:text-2xl ml-1">{suffix}</span>}
      </p>
    </div>
  )
}
