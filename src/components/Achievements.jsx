import React, { useEffect, useState } from 'react'
import { listUnlocked, getState } from '../lib/achievements'

export default function Achievements() {
  const [state, setState] = useState({})

  useEffect(() => {
    setState(getState())
    // refresh every 1s in case something changed while open
    const id = setInterval(()=> setState(getState()), 1000)
    return ()=>clearInterval(id)
  }, [])

  const unlocked = state.unlocked || {}
  const counters = state.counters || {}
  const keys = Object.keys(unlocked)

  return (
    <div className="achievements-panel">
      <div className="ach-header"><h4>🏅 Achievements</h4></div>
      <div className="ach-grid">
        {keys.length===0 && <div className="muted">No badges yet — keep practicing!</div>}
        {keys.map(k=> (
          <div key={k} className="badge-card">
            <div className="badge-emoji">{k.split(' ')[0]}</div>
            <div className="badge-name">{k}</div>
          </div>
        ))}
      </div>

      <div className="counters">
        <div>🔊 Audio Qs: <strong>{counters.audio_questions || 0}</strong></div>
        <div>✅ Words done: <strong>{counters.words_done || 0}</strong></div>
        <div>🔥 Best streak: <strong>{state.streak || 0}</strong></div>
      </div>
    </div>
  )
}
