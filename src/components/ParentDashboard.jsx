import React, { useState } from 'react'

export default function ParentDashboard({ words, onExit, onUpdateWords }) {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [localWords, setLocalWords] = useState(words || [])

  const tryAuth = ()=>{
    if (password === 'parent123') setAuthed(true)
    else alert('Wrong password')
  }

  const addWord = ()=>{
    const id = Date.now()
    const nw = { id, text: 'דוגמה', category: 'אוכל', difficulty: 'easy', audio_url: '', sentence_audio_url: '', options: ['דוגמה','דוגמהא','דוגמהב','דוגמהג'], correct_option:0 }
    const next = [...localWords, nw]
    setLocalWords(next)
    onUpdateWords(next)
    localStorage.setItem('words_he_cache', JSON.stringify(next))
  }

  if (!authed) return (
    <div className="parent-login">
      <h2>Parent Area 🔒</h2>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <button onClick={tryAuth}>Enter</button>
      <button onClick={onExit}>Cancel</button>
    </div>
  )

  return (
    <div className="parent-dashboard">
      <h2>Manage Hebrew Words</h2>
      <button onClick={addWord}>➕ Add sample word</button>
      <ul>
        {localWords.map(w=> (
          <li key={w.id}>{w.text} — {w.category} — {w.difficulty}</li>
        ))}
      </ul>
      <button onClick={onExit}>Done</button>
    </div>
  )
}
