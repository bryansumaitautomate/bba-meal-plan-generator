'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'motion/react'
import { z } from 'zod'
import { Lead, type LeadInput, type PlanType, type IntakeInput } from '@/lib/schema'

type LeadFormValues = z.input<typeof Lead>
type Status = 'idle' | 'submitting' | 'sent' | 'error'

interface LeadCaptureProps {
  plan?: PlanType
  intake?: IntakeInput
}

export function LeadCapture({ plan, intake }: LeadCaptureProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues, undefined, LeadInput>({
    resolver: zodResolver(Lead),
    defaultValues: { email: '', phone: '', firstName: '', consentToContact: true },
  })

  async function onSubmit(values: LeadInput): Promise<void> {
    setStatus('submitting')
    setErrorMsg('')
    try {
      const payload = plan && intake
        ? { ...values, plan, intake: pickIntakeForGHL(intake) }
        : values
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      setStatus('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  function pickIntakeForGHL(i: IntakeInput) {
    return {
      goal: i.goal,
      calories: i.calories,
      protein: i.protein,
      mealsPerDay: i.mealsPerDay,
      fastBreakfast: i.fastBreakfast,
      trainingDays: i.trainingDays,
      dietStyle: i.dietStyle,
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className="relative px-6 md:px-12 py-16 md:py-24 max-w-4xl mx-auto"
    >
      <div className="relative bg-surface border border-bba-border p-8 md:p-12 overflow-hidden">
        {/* Gold corner accent */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-blue to-transparent" />
          <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-blue to-transparent" />
        </div>

        <p className="text-kicker mb-3">
          <span className="text-blue">●</span>&nbsp;&nbsp;Want this in your inbox?
        </p>
        <h3 className="text-display-md mb-4">
          Get the <span className="text-italic-display text-blue">PDF + shopping list</span> emailed.
        </h3>
        <p className="text-muted-fg text-base md:text-lg max-w-xl mb-8 leading-snug">
          Drop your details. We'll send the plan as a clean PDF with the shopping list ready to print or share.
        </p>

        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-2 border-success pl-5 py-4"
            >
              <p className="font-display text-2xl md:text-3xl text-text mb-2">Done. Check your inbox.</p>
              <p className="text-kicker text-success">●&nbsp;&nbsp;You're on the list.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
            >
              <div className="md:col-span-2 border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
                <label htmlFor="lead-firstName" className="block text-kicker mb-2">First Name</label>
                <input
                  id="lead-firstName"
                  type="text"
                  placeholder="Mate"
                  autoComplete="given-name"
                  {...register('firstName')}
                  className="w-full bg-transparent text-text font-display text-xl md:text-2xl outline-none placeholder:text-faint placeholder:italic placeholder:font-light"
                />
              </div>

              <div className="border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
                <label htmlFor="lead-email" className="block text-kicker mb-2">Email</label>
                <input
                  id="lead-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full bg-transparent text-text font-display text-xl md:text-2xl outline-none placeholder:text-faint placeholder:italic placeholder:font-light"
                />
                {errors.email && <p className="text-alert text-kicker mt-2">{errors.email.message}</p>}
              </div>

              <div className="border-b-2 border-bba-border focus-within:border-blue transition-colors pb-3">
                <label htmlFor="lead-phone" className="block text-kicker mb-2">Phone</label>
                <input
                  id="lead-phone"
                  type="tel"
                  placeholder="+61 400 000 000"
                  autoComplete="tel"
                  {...register('phone')}
                  className="w-full bg-transparent text-text font-display text-xl md:text-2xl outline-none placeholder:text-faint placeholder:italic placeholder:font-light"
                />
                {errors.phone && <p className="text-alert text-kicker mt-2">{errors.phone.message}</p>}
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="group bg-blue text-bg font-display font-bold uppercase tracking-wider px-8 md:px-10 py-4 md:py-5 text-base md:text-lg hover:bg-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="inline-flex items-center gap-3">
                    {status === 'submitting' ? 'Sending...' : 'Email me the plan'}
                    {status !== 'submitting' && (
                      <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    )}
                  </span>
                </button>
                {status === 'error' && (
                  <p className="text-alert text-kicker">●&nbsp;&nbsp;{errorMsg}</p>
                )}
                {status === 'idle' && (
                  <p className="text-kicker">No spam. We'll send the PDF and shut up.</p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
