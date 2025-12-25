import React, { useState, useEffect } from 'react'
import QuestionCard from '../question/QuestionCard'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeProblem(difficulty = 'easy') {
  // כיתה ג׳: חיבור/חיסור גם עם מספרים גדולים מ-90, כפל בסיסי, וחילוק עם תוצאה שלמה
  if (difficulty === 'easy') {
    // חיבור/חיסור עד 100 (כולל דו-ספרתי)
    const op = Math.random() < 0.6 ? '+' : '-'
    let a = randInt(10, 99)
    let b = randInt(1, 99)
    if (op === '-' && b > a) ;[a, b] = [b, a] // לא שלילי
    return { a, b, op, result: op === '+' ? a + b : a - b }
  }

  if (difficulty === 'medium') {
    // חיבור/חיסור עד 1000 (כולל >90), ותוספת כפל קל
    const r = Math.random()
    if (r < 0.45) {
      const a = randInt(100, 999)
      const b = randInt(10, 399)
      return { a, b, op: '+', result: a + b }
    }
    if (r < 0.9) {
      let a = randInt(100, 999)
      let b = randInt(10, 699)
      if (b > a) ;[a, b] = [b, a]
      return { a, b, op: '-', result: a - b }
    }
    // כפל בינוני
    const a = randInt(2, 12)
    const b = randInt(2, 12)
    return { a, b, op: '×', result: a * b }
  }

  // hard
  // שילוב: כפל גדול יותר + חילוק עם תוצאה שלמה + חיבור/חיסור גדולים
  const r = Math.random()
  if (r < 0.4) {
    const a = randInt(12, 30)
    const b = randInt(6, 20)
    return { a, b, op: '×', result: a * b }
  }
  if (r < 0.75) {
    // חילוק שלם: dividend / divisor = quotient
    const divisor = randInt(2, 12)
    const quotient = randInt(2, 20)
    const dividend = divisor * quotient
    return { a: dividend, b: divisor, op: '÷', result: quotient }
  }
  // חיבור/חיסור מאות/אלפים
  const op = Math.random() < 0.5 ? '+' : '-'
  let a = randInt(200, 1500)
  let b = randInt(50, 1200)
  if (op === '-' && b > a) ;[a, b] = [b, a]
  return { a, b, op, result: op === '+' ? a + b : a - b }
}

function generateOptions(correct) {
  const set = new Set([correct])
  let guard = 0

  // מפזר תשובות סביב הנכון – מותאם גם לתוצאות גדולות
  while (set.size < 4 && guard < 200) {
    const magnitude =
      Math.abs(correct) < 20 ? 6 :
      Math.abs(correct) < 100 ? 15 :
      Math.abs(correct) < 500 ? 40 : 120

    const delta = randInt(1, magnitude) * (Math.random() > 0.5 ? 1 : -1)
    const candidate = correct + delta
    if (candidate >= 0) set.add(candidate)
    guard++
  }

  const arr = Array.from(set)

  // shuffle
  for (let j = arr.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1))
    ;[arr[j], arr[k]] = [arr[k], arr[j]]
  }

  return arr.map(String)
}

// מציג תרגיל במאונך (מיישר לשמאל)
function formatVertical(a, b, op) {
  const aStr = String(a)
  const bStr = String(b)
  const width = Math.max(aStr.length, bStr.length + 1) // +1 בשביל האופרטור לפני b

  const line1 = aStr.padStart(width, ' ')
  const line2 = (op + bStr).padStart(width, ' ')
  const line3 = ''.padStart(width, '—') // קו

  // חשוב: כדי לשמור רווחים, נרנדר בתוך <pre>
  return `${line1}\n${line2}\n${line3}`
}

export default function MathMode({ onResult }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [prob, setProb] = useState(() => makeProblem('easy'))
  const [options, setOptions] = useState(() => generateOptions(prob.result))

  useEffect(() => {
    setOptions(generateOptions(prob.result))
  }, [prob])

  const next = () => {
    const p = makeProblem(difficulty)
    setProb(p)
  }

  const handleAnswer = (i) => {
    const val = Number(options[i])
    const correct = val === prob.result
    onResult({ correct, meta: { difficulty, op: prob.op } })
    next()
  }

  const verticalText = formatVertical(prob.a, prob.b, prob.op)
  const correctIndex = options.findIndex((o) => Number(o) === prob.result)

  return (
    <div className="math-mode" style={{ textAlign: 'left' }}>
      {/* אם כבר יש לך מסך הורים/הגדרות קושי – תחבר לשם במקום הכפתורים האלו */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'flex-start' }}>
        <button onClick={() => setDifficulty('easy')}>קל</button>
        <button onClick={() => setDifficulty('medium')}>בינוני</button>
        <button onClick={() => setDifficulty('hard')}>קשה</button>
      </div>

      <QuestionCard
        direction="ltr"
        // שולחים JSX כדי לקבל תצוגה במאונך (pre שומר רווחים ושורות)
        text={
          <pre style={{ margin: 0, textAlign: 'right', fontFamily: 'inherit', lineHeight: 1.2 }}>
            {verticalText}
          </pre>
        }
        options={options}
        correctIndex={correctIndex}
        onAnswer={handleAnswer}
        hideAudio={true}
      />
    </div>
  )
}
