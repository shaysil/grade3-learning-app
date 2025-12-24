import React from 'react'

export default function ScoreBoard({ points, streak }) {
  const nextMilestone = 100
  const pct = Math.min(100, Math.round((points / nextMilestone) * 100))
  return (
    <div className="scoreboard">
      <div className="points">⭐ {points}</div>
      <div className="progress">
        <div className="bar"><div className="fill" style={{width: pct + '%'}}></div></div>
        <div className="milestone">Next: {nextMilestone} ({pct}%)</div>
      </div>
      <div className="streak">🔥 {streak}</div>
    </div>
  )
}
