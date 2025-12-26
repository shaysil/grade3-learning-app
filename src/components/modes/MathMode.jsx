import React, { useState, useEffect } from 'react'
import QuestionCard from '../question/QuestionCard'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// function makeProblem: already implemented checks for negatives in most places, assuming logic is sound.
// Let's enforce strict checks just in case.

function makeProblem(difficulty = 'easy') {
  // Common check to swap if result < 0
  const ensurePositive = (p) => {
    if (p.result < 0 && p.op === '-') {
      return { a: p.b, b: p.a, op: p.op, result: p.b - p.a }
    }
    return p
  }

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

  // Final safety checks
  if (p.op === '-' && p.result < 0) {
    p = { a: p.b, b: p.a, op: p.op, result: p.b - p.a }
  }
  return p
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

export default function MathMode({ onResult }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [prob, setProb] = useState(() => makeProblem('easy'))
  const [options, setOptions] = useState(() => generateOptions(prob.result))

  // Re-generate problem when difficulty changes
  useEffect(() => {
    setProb(makeProblem(difficulty))
  }, [difficulty])

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

    // Only advance if correct. If wrong, QuestionCard will unlock and let user retry.
    if (correct) {
      next()
    }
  }

  const verticalText = formatVertical(prob.a, prob.b, prob.op)
  const correctIndex = options.findIndex((o) => Number(o) === prob.result)

  return (
    <div className="math-mode" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'flex-start' }}>
        <button onClick={() => setDifficulty('easy')} style={{ opacity: difficulty === 'easy' ? 1 : 0.6 }}>קל</button>
        <button onClick={() => setDifficulty('medium')} style={{ opacity: difficulty === 'medium' ? 1 : 0.6 }}>בינוני</button>
        <button onClick={() => setDifficulty('hard')} style={{ opacity: difficulty === 'hard' ? 1 : 0.6 }}>קשה</button>
      </div>

      <QuestionCard
        direction="ltr"
        // Force re-render key if needed, mostly redundant now with dependency fix but good safety
        key={`${prob.a}${prob.op}${prob.b}`}
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
