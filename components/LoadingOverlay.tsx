'use client'

import { useEffect, useState } from 'react'

const QUOTES = [
  'Cooking up your week.',
  'No BS plans here.',
  'Hold tight. Real food incoming.',
  'Pulling it together.',
  'Almost there.',
] as const

export function LoadingOverlay() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-8">
      <div className="font-display text-8xl font-bold animate-pulse text-text">
        BB
      </div>
      <p className="font-display text-2xl text-muted-fg text-center max-w-md px-6 transition-opacity">
        {QUOTES[index]}
      </p>
    </div>
  )
}
