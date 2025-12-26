import React, { useState, useEffect } from 'react'
import AvatarSelector from './AvatarSelector'
import { subscribe } from '../lib/events'

export default function AvatarBanner({ avatar, profileId, onUpdateAvatar }) {
  // avatar prop comes from App -> profile.avatar
  const [open, setOpen] = useState(false)
  const [react, setReact] = useState(null)

  useEffect(() => {
    const u1 = subscribe('reaction', (p) => {
      if (p.type === 'correct') {
        setReact('correct')
        setTimeout(() => setReact(null), 700)
      } else if (p.type === 'wrong') {
        setReact('wrong')
        setTimeout(() => setReact(null), 700)
      }
    })
    const u2 = subscribe('unlock', () => {
      setReact('unlock')
      setTimeout(() => setReact(null), 1200)
    })
    return () => { u1(); u2() }
  }, [])

  return (
    <div className="avatar-banner">
      <span className={`avatar ${react ? 'react-' + react : ''}`} style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>{avatar}</span>
      {open && <AvatarSelector profileId={profileId} currentAvatar={avatar} onSelect={(newAv) => { onUpdateAvatar(newAv); setOpen(false); }} />}
    </div>
  )
}
