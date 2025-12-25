import React, { useEffect, useMemo, useState } from 'react'
import { getState } from '../lib/achievements'

function nextStreakTarget(streak) {
  const targets = [3, 5, 8]
  const next = targets.find(t => streak < t)
  if (!next) return { next: null, remaining: 0 }
  return { next, remaining: next - streak }
}

export default function Achievements({ compact = false }) {

  const [state, setState] = useState({})

  useEffect(() => {
    setState(getState())
    const id = setInterval(() => setState(getState()), 1000)
    return () => clearInterval(id)
  }, [])

  const unlocked = state.unlocked || {}
  const keys = Object.keys(unlocked)

  // נסה לקרוא כמה שיותר שדות אפשריים בלי לשבור כלום
  const points =
    state.points ??
    state.score ??
    state.total_points ??
    state.counters?.points ??
    0

  const streak =
    state.streak_current ??
    state.currentStreak ??
    state.streak ??
    0

  const bestStreak =
    state.best_streak ??
    state.streak_best ??
    state.bestStreak ??
    state.counters?.best_streak ??
    streak

  const qNumber =
    state.question_index ??
    state.qIndex ??
    state.questionNumber ??
    null

  const { next, remaining } = useMemo(() => nextStreakTarget(streak), [streak])

  const medalText = next
    ? `עוד ${remaining} לרצף`
    : '🥇 הושג!'

  return (
    <div className="achievements-screen" dir="rtl">
      {/* כותרת/סרגל כמו בתמונה */}
      <div className="ach-top">
        {/* <button className="ach-icon-btn" title="רענון" onClick={() => setState(getState())}>
          ↻
        </button> */}

        <div className="ach-center">
          {/* “שאלה X” קטן באמצע */}
          <div className="ach-question-wrap">
            <div className="ach-question-big">
              {qNumber ? `שאלה ${qNumber}` : 'שאלה 1'}
            </div>
            <div className="ach-question-sub">המשך תרגול כדי לפתוח הישגים</div>
          </div>

          <div className="ach-chips">
            {/* מדליה / יעד לרצף */}
            <div className="ach-medal">
              <div className="ach-medal-emoji">🎖️</div>
              <div className="ach-medal-text">{medalText}</div>
            </div>

            {/* שיא */}
            <div className="ach-chip ach-chip-soft">
              <div className="ach-chip-num">{bestStreak}</div>
              <div className="ach-chip-icon">⭐</div>
              <div className="ach-chip-label">שיא</div>
            </div>

            {/* רצף */}
            <div className="ach-chip ach-chip-soft">
              <div className="ach-chip-num">{streak}</div>
              <div className="ach-chip-icon">🔥</div>
              <div className="ach-chip-label">רצף</div>
            </div>

            {/* נקודות (רחב) */}
            <div className="ach-chip ach-chip-wide">
              <div className="ach-chip-label">נקודות</div>
              <div className="ach-chip-num">{points}</div>
              <div className="ach-chip-icon">⭐</div>
            </div>
          </div>
        </div>

        {/* <button className="ach-icon-btn" title="דף הבית" onClick={() => (window.location.href = '/')}>
          ⌂
        </button> */}
      </div>

      {/* Badges (אפשר להשאיר, רק בעיצוב יותר עדין) */}
      <div className={compact ? "ach-body ach-body-compact" : "ach-body"}>
      <div className="ach-badges">
        <div className="ach-badges-title">🏅 הישגים</div>

        {keys.length === 0 ? (
          <div className="ach-muted">אין עדיין תגי הישג — ממשיכים לתרגל!</div>
        ) : (
          <div className="ach-grid">
            {keys.map(k => (
              <div key={k} className="badge-card">
                <div className="badge-emoji">{k.split(' ')[0]}</div>
                <div className="badge-name">{k}</div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

    </div>
  )
}
