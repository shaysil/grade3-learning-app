import React, { useState, useEffect } from 'react'
import { listUnlocked } from '../lib/achievements'

const ALL_AVATARS = [
  { id: 'kid1', icon: '🙂', unlock: null },
  { id: 'fox', icon: '🦊', unlock: '📘 Vocabulary Master' },
  { id: 'rocket', icon: '🚀', unlock: '🚀 No Mistakes' }
]

export default function AvatarSelector() {
  const [selected, setSelected] = useState(localStorage.getItem('selected_avatar') || '🙂')
  const [unlocked, setUnlocked] = useState({})

  useEffect(()=>setUnlocked(listUnlocked()), [])

  const choose = (icon, avail) => {
    if (!avail) return alert('Locked — earn badge to unlock')
    setSelected(icon)
    localStorage.setItem('selected_avatar', icon)
    window.location.reload()
  }

  return (
    <div className="avatar-selector">
      <h4>Choose avatar</h4>
      <div style={{display:'flex',gap:8}}>
        {ALL_AVATARS.map(a=>{
          const avail = !a.unlock || unlocked[a.unlock]
          return (
            <button key={a.id} onClick={()=>choose(a.icon, avail)} style={{fontSize:24,opacity: avail?1:0.4}}>
              {a.icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}
