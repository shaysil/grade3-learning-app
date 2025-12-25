import React, { useState, useEffect } from 'react'

export default function Welcome({ onStart }) {
  const [name, setName] = useState('')

  useEffect(()=>console.log('Welcome mounted'),[])

  const start = () => {
    const n = (name || 'חבר').slice(0,20)
    localStorage.setItem('child_name', n)
    onStart(n)
  }

  return (
    <div className="welcome-card">
      <div className="welcome-decor">🌸 ✨ 🦋 🌷</div>
      <div className="hero-emoji">👋</div>
      <h2>שלום! 👋</h2>
      <p className="sub">ברוכים הבאים ללומדים אנגלית — מה השם שלך? 🌟</p>

      <form className="name-input" onSubmit={(e) => { e.preventDefault(); start(); }}>
        <input placeholder="מה השם שלך?" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit" className="big primary">התחל</button>
      </form>
      
    </div>
  )
}
