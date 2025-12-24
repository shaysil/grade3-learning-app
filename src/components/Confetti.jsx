import React, { useState, useEffect } from 'react'
import { subscribe } from '../lib/events'

export default function Confetti() {
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    const unsub = subscribe('unlock', () => {
      setBurst((b) => b + 1)
      setTimeout(() => setBurst((b) => Math.max(0, b - 1)), 2200)
    })
    return unsub
  }, [])

  if (!burst) return null

  // render a few confetti containers based on burst
  const pieces = Array.from({ length: 36 }).map((_, i) => (
    <i key={i} className={`confetti-piece piece-${i % 8}`}></i>
  ))

  return <div className="confetti-wrap">{pieces}</div>
}
