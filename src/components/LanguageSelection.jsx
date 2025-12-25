import React, { useEffect } from 'react'

export default function LanguageSelection({ onSelect }) {
  useEffect(()=>console.log('LanguageSelection mounted'))
  return (
    <div className="language-selection card">
      <h2 className="ls-title">מה רוצים ללמוד?</h2>
      <p className="ls-sub">בחרו שפה או מתמטיקה — המשחק מותאם לילדים כיתה ג׳</p>

      <div className="buttons">
        <button className="mode-card" onClick={() => onSelect('english')}>
          <div className="emoji">🇬🇧</div>
          <div className="label">English</div>
          <div className="sm">Listening + Spelling</div>
        </button>

        <button className="mode-card" onClick={() => onSelect('hebrew')}>
          <div className="emoji">🇮🇱</div>
          <div className="label">עברית</div>
          <div className="sm">האזנה ואיות</div>
        </button>

        <button className="mode-card" onClick={() => onSelect('math')}>
          <div className="emoji">➕</div>
          <div className="label">Math</div>
          <div className="sm">חיבור / חיסור / כפל</div>
        </button>
      </div>

      {/* <div className="hint">Tip: Tap the big button to start — audio questions will play automatically</div>
      <div className="mode-help" style={{marginTop:12,color:'var(--muted)'}}>הערה: בעברית העברית UI תהיה RTL, במתמטיקה הטקסט מיושר לשמאל</div> */}
    </div>
  )
}
