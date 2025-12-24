import React, { useState, useEffect } from 'react'
import QuestionCard from '../question/QuestionCard'

function makeProblem(difficulty='easy'){
  const rnd = (n)=> Math.floor(Math.random()*n)+1
  if (difficulty==='easy'){
    const a=rnd(9), b=rnd(9)
    return { a, b, op: '+', result: a+b }
  }
  if (difficulty==='medium'){
    const a=rnd(90)+9, b=rnd(90)+9
    return { a, b, op: '-', result: a-b }
  }
  // hard: mixed
  const a=rnd(12), b=rnd(12)
  return { a, b, op: '×', result: a*b }
}

function generateOptions(correct){
  const set = new Set([correct])
  let i = 1
  while(set.size < 4 && i < 20){
    const delta = Math.ceil(Math.random()*6) * (Math.random() > 0.5 ? 1 : -1)
    const candidate = correct + delta
    if (candidate >= 0) set.add(candidate)
    i++
  }
  const arr = Array.from(set)
  // shuffle
  for (let j = arr.length -1; j>0; j--){
    const k = Math.floor(Math.random()*(j+1))
    ;[arr[j], arr[k]] = [arr[k], arr[j]]
  }
  return arr.map(n => String(n))
}

export default function MathMode({ onResult }){
  const [prob, setProb] = useState(()=>makeProblem('easy'))
  const [options, setOptions] = useState(()=>generateOptions(prob.result))

  useEffect(()=>{
    setOptions(generateOptions(prob.result))
  }, [prob])

  const next = () => {
    const p = makeProblem('medium')
    setProb(p)
  }

  const handleAnswer = (i) => {
    const val = Number(options[i])
    const correct = val === prob.result
    onResult({ correct })
    next()
  }

  return (
    <div className="math-mode">
      <QuestionCard
        direction="ltr"
        text={`${prob.a} ${prob.op} ${prob.b}`}
        options={options}
        correctIndex={options.findIndex(o => Number(o) === prob.result)}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
