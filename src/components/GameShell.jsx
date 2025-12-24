import React, { useEffect, useState } from 'react'
import HebrewMode from './modes/HebrewMode'
import EnglishMode from './modes/EnglishMode'
import MathMode from './modes/MathMode'
import ScoreBoard from './ScoreBoard'
import { incrementCounter as achInc, setStreak as achSetStreak } from '../lib/achievements'
import Achievements from './Achievements'
import { publish } from '../lib/events'
import BadgeToast from './BadgeToast'
import Confetti from './Confetti'

export default function GameShell({ mode, onExit, words }) {
  const [points, setPoints] = useState(() => Number(localStorage.getItem('points') || 0))
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || 0))

  useEffect(() => {
    localStorage.setItem('points', String(points))
  }, [points])

  useEffect(() => {
    localStorage.setItem('streak', String(streak))
  }, [streak])


  const onResult = ({ correct, meta }) => {
    if (correct) {
      setPoints((p) => p + 10)
      setStreak((s) => {
        const next = s + 1
        const newUnlocks = achSetStreak(next) || []
        newUnlocks.forEach(n=>publish('unlock', n))
        publish('reaction', { type: 'correct', streak: next })
        return next
      })
    } else {
      const newUnlocks = achSetStreak(0) || []
      newUnlocks.forEach(n=>publish('unlock', n))
      publish('reaction', { type: 'wrong', streak: 0 })
      setStreak(0)
    }

    // record audio questions count if meta.audio==true
    if (meta && meta.audio) {
      const newUnlocks = achInc('audio_questions', 1) || []
      newUnlocks.forEach(n=>publish('unlock', n))
    }
    // generic counter for words done
    const newUnlocks2 = achInc('words_done', 1) || []
    newUnlocks2.forEach(n=>publish('unlock', n))
  }

  return (
    <section className="game-shell">
      <div className="topbar">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="back-btn" onClick={onExit}>◀️ Back</button>
          <Achievements />
        </div>
        <ScoreBoard points={points} streak={streak} />
      </div>
      <BadgeToast />
      <Confetti />

      <div className="game-card card">
        {mode === 'hebrew' && <HebrewMode words={words} onResult={onResult} />}
        {mode === 'english' && <EnglishMode onResult={onResult} />}
        {mode === 'math' && <MathMode onResult={onResult} />}
      </div>
    </section>
  )
}
