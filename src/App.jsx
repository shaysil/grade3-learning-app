import React, { useEffect, useState } from 'react'
import LanguageSelection from './components/LanguageSelection'
import GameShell from './components/GameShell'
import ParentDashboard from './components/ParentDashboard'
import AvatarBanner from './components/AvatarBanner'
import Welcome from './components/Welcome'
import { loadWords } from './data/wordsLoader'

export default function App() {
  const [mode, setMode] = useState(null) // 'hebrew' | 'english' | 'math' | 'parent'
  const [words, setWords] = useState([])
  const [name, setName] = useState(() => localStorage.getItem('child_name') || '')

  useEffect(()=>{
    console.log('App rendered. name=', name)
  },[name])
  useEffect(() => {
    loadWords().then((w) => setWords(w))
  }, [])

  const handleStart = (n) => {
    setName(n)
  }

  return (
    <div className={`app ${mode === 'hebrew' ? 'rtl' : ''}`}>
      <header className="header">
        <h1 className="brand">לומדים כיתה ג׳</h1>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {name ? <div className="greeting">שלום, {name} 👋</div> : null}
          <AvatarBanner />
        </div>
      </header>

      {!name && <Welcome onStart={handleStart} />}

      {name && !mode && (
        <LanguageSelection onSelect={(m) => setMode(m)} />
      )}

      {mode && mode !== 'parent' && (
        <GameShell
          mode={mode}
          onExit={() => setMode(null)}
          words={words}
        />
      )}

      {mode === 'parent' && (
        <ParentDashboard words={words} onExit={() => setMode(null)} onUpdateWords={setWords} />
      )}

      <footer className="footer">
        <button onClick={() => setMode('parent')}>Parent 🚪</button>
      </footer>
    </div>
  )
}
