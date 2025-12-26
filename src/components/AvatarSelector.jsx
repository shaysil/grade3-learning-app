import React, { useState, useEffect } from 'react'
import { listUnlocked } from '../lib/achievements'
import { getProfiles, createProfile } from '../lib/storage' // We might need to update profile in storage directly

const ALL_AVATARS = [
  { id: 'kid1', icon: '🙂', unlock: null },
  { id: 'kid2', icon: '👧', unlock: null },
  { id: 'kid3', icon: '👦', unlock: null },
  { id: 'fox', icon: '🦊', unlock: '📘 Vocabulary Master' },
  { id: 'rocket', icon: '🚀', unlock: '🚀 No Mistakes' },
  { id: 'tiger', icon: '🐯', unlock: '🎧 Excellent Listener' }
]

export default function AvatarSelector({ profileId, currentAvatar, onSelect }) {
  const [unlocked, setUnlocked] = useState({})

  useEffect(() => setUnlocked(listUnlocked(profileId)), [profileId])

  const choose = (icon, avail) => {
    if (!avail) return alert('נעול — השג הישגים כדי לפתוח!')
    onSelect(icon)
  }

  return (
    <div className="avatar-selector">
      <h4>בחר דמות</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {ALL_AVATARS.map(a => {
          const avail = !a.unlock || unlocked[a.unlock]
          const isSelected = currentAvatar === a.icon
          return (
            <button key={a.id} onClick={() => choose(a.icon, avail)} style={{ fontSize: 24, opacity: avail ? 1 : 0.4, border: isSelected ? '2px solid blue' : '1px solid transparent', borderRadius: '50%', background: 'white' }}>
              {a.icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}
