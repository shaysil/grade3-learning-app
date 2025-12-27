import React, { useState, useEffect } from 'react'
import QuestionCard from '../question/QuestionCard'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateOptions(result) {
  const opts = new Set()
  opts.add(result)

  // Generate 3 distractors
  let attempts = 0
  while (opts.size < 4 && attempts < 50) {
    attempts++
    // Create reasonable distractors close to the answer
    const diff = randInt(1, 5) // difference of 1-5
    const sign = Math.random() < 0.5 ? 1 : -1
    const val = result + (diff * sign)

    if (val >= 0) { // Keep non-negative for 3rd grade usually
      opts.add(val)
    }
  }

  // Fallback if we couldn't generate enough unique close numbers (rare)
  while (opts.size < 4) {
    const val = randInt(0, result + 20)
    opts.add(val)
  }

  return shuffle(Array.from(opts))
}

function formatVertical(a, b, op) {
  const sa = String(a)
  const sb = String(b)
  const len = Math.max(sa.length, sb.length) + 1
  const line1 = sa.padStart(len, ' ')
  const line2 = op + sb.padStart(len - 1, ' ')
  const sep = '-'.repeat(len)
  return `${line1}\n${line2}\n${sep}`
}

// Helper for mixed problems
function makeMixedProblem(difficulty) {
  let p = { a: 1, b: 1, op: '+', result: 2 }

  if (difficulty === 'easy') {
    const op = Math.random() < 0.6 ? '+' : '-'
    let a = randInt(10, 99)
    let b = randInt(1, 99)
    p = { a, b, op, result: op === '+' ? a + b : a - b }
  } else if (difficulty === 'medium') {
    const r = Math.random()
    if (r < 0.45) {
      const a = randInt(100, 999)
      const b = randInt(10, 399)
      p = { a, b, op: '+', result: a + b }
    } else if (r < 0.9) {
      const a = randInt(100, 999)
      const b = randInt(10, 699)
      p = { a, b, op: '-', result: a - b }
    } else {
      const a = randInt(2, 12)
      const b = randInt(2, 12)
      p = { a, b, op: '×', result: a * b }
    }
  } else {
    // hard
    const r = Math.random()
    if (r < 0.4) {
      const a = randInt(12, 30)
      const b = randInt(6, 20)
      p = { a, b, op: '×', result: a * b }
    } else if (r < 0.75) {
      const divisor = randInt(2, 12)
      const quotient = randInt(2, 20)
      const dividend = divisor * quotient
      p = { a: dividend, b: divisor, op: '÷', result: quotient }
    } else {
      const op = Math.random() < 0.5 ? '+' : '-'
      let a = randInt(200, 1500)
      let b = randInt(50, 1200)
      p = { a, b, op, result: op === '+' ? a + b : a - b }
    }
  }

  // Safety check for negatives
  if (p.op === '-' && p.result < 0) {
    p = { a: p.b, b: p.a, op: p.op, result: p.b - p.a }
  }
  return p
}

// Helper for multiplication table problems
function makeMultiplesProblem(table) {
  const tableNum = Number(table)
  const multiplier = randInt(1, 10)
  // Randomize order: 5x3 or 3x5
  const swap = Math.random() < 0.5
  const a = swap ? multiplier : tableNum
  const b = swap ? tableNum : multiplier
  return { a, b, op: '×', result: a * b }
}

export default function MathMode({ onResult }) {
  // Mode State: null (menu) | 'mix' | 'multiples' | 'word_problems'
  const [subMode, setSubMode] = useState(null)

  // Settings State
  const [difficulty, setDifficulty] = useState('easy') // For 'mix'
  const [selectedTable, setSelectedTable] = useState(null) // For 'multiples': 1-10

  // Game State
  const [prob, setProb] = useState(null)
  const [options, setOptions] = useState([])

  // Word Problem State
  const [wordProblemsData, setWordProblemsData] = useState([])
  const [shuffledWP, setShuffledWP] = useState([])
  const [wpIndex, setWpIndex] = useState(0)

  // Load Word Problems
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}math_word_problems.json`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load")
        return res.json()
      })
      .then(data => setWordProblemsData(data))
      .catch(err => console.warn("Failed to load word problems", err))
  }, [])

  // Init game when settings change
  useEffect(() => {
    if (subMode === 'mix') {
      const p = makeMixedProblem(difficulty)
      setProb(p)
      setOptions(generateOptions(p.result))
    } else if (subMode === 'multiples' && selectedTable) {
      const p = makeMultiplesProblem(selectedTable)
      setProb(p)
      setOptions(generateOptions(p.result))
    } else if (subMode === 'word_problems') {
      // Shuffle all available questions
      if (wordProblemsData.length > 0) {
        setShuffledWP(shuffle([...wordProblemsData]))
        setWpIndex(0)
      }
    } else {
      // Menu or reset
      setProb(null)
    }
  }, [subMode, difficulty, selectedTable, wordProblemsData])

  // Initial load for first specific WP logic
  useEffect(() => {
    if (subMode === 'word_problems' && shuffledWP.length > 0) {
      const currentQ = shuffledWP[wpIndex % shuffledWP.length]
      setProb({ result: currentQ.answer, question: currentQ.question })
      setOptions(generateOptions(currentQ.answer))
    }
  }, [shuffledWP, wpIndex, subMode])

  const next = () => {
    if (subMode === 'mix') {
      const p = makeMixedProblem(difficulty)
      setProb(p)
      setOptions(generateOptions(p.result))
    } else if (subMode === 'multiples') {
      const p = makeMultiplesProblem(selectedTable)
      setProb(p)
      setOptions(generateOptions(p.result))
    } else if (subMode === 'word_problems') {
      setWpIndex(prev => prev + 1)
      // The useEffect will pick up the change in wpIndex
    }
  }

  const handleAnswer = (i) => {
    if (!prob) return
    const val = Number(options[i])
    const correct = val === prob.result
    onResult({ correct, meta: { difficulty, op: prob.op, subMode } })

    if (correct) {
      next()
    }
  }

  // Render: Main Menu
  if (!subMode) {
    return (
      <div className="math-menu" style={{ textAlign: 'center', marginTop: 20 }}>
        <h2>בחר סוג אימון</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setSubMode('mix')}
            style={{ padding: '20px 40px', fontSize: '1.5rem', width: '300px' }}
          >
            אימון מעורב
          </button>
          <button
            onClick={() => setSubMode('select_table')}
            style={{ padding: '20px 40px', fontSize: '1.5rem', width: '300px' }}
          >
            לוח הכפל
          </button>
          <button
            onClick={() => setSubMode('word_problems')}
            style={{ padding: '20px 40px', fontSize: '1.5rem', width: '300px' }}
          >
            בעיות מילוליות
          </button>
        </div>
      </div>
    )
  }

  // Render: Multiplication Table Selection
  if (subMode === 'select_table') {
    return (
      <div className="math-table-select" style={{ textAlign: 'center' }}>
        <h3>בחר כפולות של מספר</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxWidth: 400, margin: '20px auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              onClick={() => { setSelectedTable(n); setSubMode('multiples'); }}
              style={{ padding: '20px', fontSize: '1.5rem' }}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={() => setSubMode(null)} style={{ marginTop: 20 }}>🔙 חזרה</button>
      </div>
    )
  }

  // Render: Active Game (Mix or Multiples or Word Problems)
  if (!prob) return <div>Loading...</div>

  // Different format for Word Problems vs Arithmetic
  let questionTextContent
  let dir = 'ltr'

  if (subMode === 'word_problems') {
    dir = 'rtl'
    questionTextContent = (
      <div style={{ fontSize: '1.5rem', textAlign: 'center', direction: 'rtl', padding: 10, whiteSpace: 'pre-wrap' }}>
        {prob.question}
      </div>
    )
  } else {
    // Vertical arithmetic
    const verticalText = formatVertical(prob.a, prob.b, prob.op)
    questionTextContent = (
      <pre style={{ margin: 0, textAlign: 'right', fontFamily: 'inherit', lineHeight: 1.2 }}>
        {verticalText}
      </pre>
    )
  }

  const correctIndex = options.findIndex((o) => Number(o) === prob.result)

  return (
    <div className="math-mode" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setSubMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🔙 תפריט</button>

        {subMode === 'mix' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDifficulty('easy')} style={{ opacity: difficulty === 'easy' ? 1 : 0.6 }}>קל</button>
            <button onClick={() => setDifficulty('medium')} style={{ opacity: difficulty === 'medium' ? 1 : 0.6 }}>בינוני</button>
            <button onClick={() => setDifficulty('hard')} style={{ opacity: difficulty === 'hard' ? 1 : 0.6 }}>קשה</button>
          </div>
        )}
        {subMode === 'multiples' && (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>כפולות של {selectedTable}</div>
        )}
        {subMode === 'word_problems' && (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>בעיות מילוליות</div>
        )}
      </div>

      <QuestionCard
        direction={dir}
        key={subMode === 'word_problems' ? prob.question : `${prob.a}${prob.op}${prob.b}`}
        text={questionTextContent}
        options={options}
        correctIndex={correctIndex}
        onAnswer={handleAnswer}
        hideAudio={true}
        instruction="בחר את התשובה הנכונה"
      />
    </div>
  )
}
