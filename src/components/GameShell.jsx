import React, { useEffect, useState, useMemo } from 'react'
import HebrewMode from './modes/HebrewMode'
import EnglishMode from './modes/EnglishMode'
import MathMode from './modes/MathMode'
import ScoreBoard from './ScoreBoard'
import { incrementCounter as achInc, setStreak as achSetStreak } from '../lib/achievements'
import Achievements from './Achievements'
import { publish } from '../lib/events'
import BadgeToast from './BadgeToast'
import Confetti from './Confetti'

import { getScopedData, setScopedData } from '../lib/storage'

export default function GameShell({ mode, onExit, words, profileId }) {
  const [points, setPoints] = useState(() => Number(getScopedData('points', profileId) || 0))
  const [streak, setStreak] = useState(() => Number(getScopedData('streak', profileId) || 0))

  // אם אין לך מספר שאלה אמיתי כרגע, זה פשוט מציג "שאלה 1"
  // אם תרצה לחבר למספר אמיתי בהמשך – תן לי מאיפה הוא מגיע ואחבר.
  const questionLabel = useMemo(() => 'שאלה 1', [])

  useEffect(() => {
    setScopedData('points', String(points), profileId)
  }, [points, profileId])

  useEffect(() => {
    setScopedData('streak', String(streak), profileId)
  }, [streak, profileId])

  const onResult = ({ correct, meta }) => {
    if (correct) {
      setPoints(p => p + 10)
      setStreak(s => {
        const next = s + 1
        const newUnlocks = achSetStreak(profileId, next) || []
        newUnlocks.forEach(n => publish('unlock', n))
        publish('reaction', { type: 'correct', streak: next })
        return next
      })
    } else {
      const newUnlocks = achSetStreak(profileId, 0) || []
      newUnlocks.forEach(n => publish('unlock', n))
      publish('reaction', { type: 'wrong', streak: 0 })
      setStreak(0)
    }

    if (meta && meta.audio) {
      const newUnlocks = achInc(profileId, 'audio_questions', 1) || []
      newUnlocks.forEach(n => publish('unlock', n))
    }

    const newUnlocks2 = achInc(profileId, 'words_done', 1) || []
    newUnlocks2.forEach(n => publish('unlock', n))
  }

  return (
    <section className="game-shell" >
      {/* TOP BAR (אחד ויחיד) */}
      <div className="topbar">
        {/* LEFT – ניווט קבוע */}
        <div className="topbar-left">
          <button
            className="icon-btn"
            onClick={onExit}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>
        </div>

        {/* CENTER – ריק או כותרת */}
        <div className="topbar-center" />

        {/* RIGHT – ניקוד */}
        <div className="topbar-right">
          <ScoreBoard points={points} streak={streak} />
        </div>
      </div>

      <div className="ach-inline">
        <Achievements compact profileId={profileId} />
      </div>

      {/* הישגים בתוך המסך, בלי Top פנימי
      <div className="ach-inline">
        <Achievements compact />
      </div> */}

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
