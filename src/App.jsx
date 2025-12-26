import React, { useEffect, useState } from 'react'
import LanguageSelection from './components/LanguageSelection'
import GameShell from './components/GameShell'
import ParentDashboard from './components/ParentDashboard'
import AvatarBanner from './components/AvatarBanner'
import ProfileSelection from './components/ProfileSelection'
import { loadWords } from './data/wordsLoader'
import { getCurrentProfileId, getProfile, migrateLegacyDataIfNeeded, setCurrentProfileId } from './lib/storage'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [mode, setMode] = useState(null) // 'hebrew' | 'english' | 'math' | 'parent'
  const [words, setWords] = useState([])

  // Init: Check migration & Load current user
  useEffect(() => {
    migrateLegacyDataIfNeeded()

    // Check if we have a last active profile
    const lastId = getCurrentProfileId()
    if (lastId) {
      const p = getProfile(lastId)
      if (p) {
        setProfile(p)
      }
    }

    loadWords().then((w) => setWords(w))
  }, [])

  const handleProfileSelect = (p) => {
    setProfile(p)
  }

  const handleLogout = () => {
    setMode(null)
    setProfile(null)
    setCurrentProfileId(null)
  }

  return (
    <div className={`app ${mode === 'hebrew' ? 'rtl' : ''}`}>
      <header className="header">
        <h1 className="brand">לומדים כיתה ג' 3</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile && (
            <div
              className="greeting"
              onClick={handleLogout}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              title="החלף משתמש"
            >
              <span>שלום, {profile.name}</span>
              <span style={{ fontSize: '1.5rem' }}>{profile.avatar}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(יציאה)</span>
            </div>
          )}
          {/* Reuse AvatarBanner maybe? Or just use profile avatar directly logic above */}
          {/* <AvatarBanner /> - We might not need this old component if profile has avatar inside */}
        </div>
      </header>

      {!profile && (
        <ProfileSelection onSelect={handleProfileSelect} />
      )}

      {profile && !mode && (
        <LanguageSelection onSelect={(m) => setMode(m)} />
      )}

      {profile && mode && mode !== 'parent' && (
        <GameShell
          mode={mode}
          onExit={() => setMode(null)}
          words={words}
          profileId={profile.id}
        />
      )}

      {profile && mode === 'parent' && (
        <ParentDashboard words={words} onExit={() => setMode(null)} onUpdateWords={setWords} />
      )}
    </div>
  )
}
