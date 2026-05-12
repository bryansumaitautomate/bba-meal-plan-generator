'use client'

import { useState } from 'react'

interface BBALogoProps {
  size?: number
  className?: string
  /** When true, renders the typographic BB fallback even if /logo.png exists. */
  forceFallback?: boolean
}

/**
 * Renders the BBA Transformation Team logo from /public/logo.png.
 * Falls back to the typographic "BB" mark if the file is missing or fails
 * to load — so the app looks intentional whether or not the logo asset
 * has been dropped into public/.
 *
 * Drop the real logo at: public/logo.png (or .svg, then update the src).
 */
export function BBALogo({ size = 48, className = '' }: BBALogoProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    // Typographic fallback — same B/B treatment used elsewhere.
    return (
      <span
        aria-label="Better Body Academy"
        className={`inline-flex items-baseline font-display font-bold tracking-tight leading-none ${className}`}
        style={{ fontSize: size * 0.7 }}
      >
        <span className="text-text">B</span>
        <span className="text-blue">B</span>
      </span>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="Better Body Academy"
      width={size}
      height={size}
      onError={(e) => {
        const img = e.currentTarget
        // First failure: try SVG fallback. Second failure: typographic.
        if (img.src.endsWith('/logo.png')) {
          img.src = '/logo.svg'
          return
        }
        setErrored(true)
      }}
      className={`object-contain ${className}`}
    />
  )
}
