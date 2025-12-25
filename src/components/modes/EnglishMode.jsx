import React, { useState, useEffect, useMemo } from 'react'
import QuestionCard from '../question/QuestionCard'

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


export default function EnglishMode({ onResult }) {
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [playedAudio, setPlayedAudio] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize with empty array, will be populated after fetch
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  useEffect(() => {
    fetch('/words_en.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load questions')
        }
        return res.json()
      })
      .then(data => {
        setQuestions(data)
        setShuffledQuestions(shuffle(data))
        setLoading(false)
      })
      .catch(err => {
        console.error("Error loading questions:", err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading questions...</div>
  if (error) return <div>Error: {error}</div>
  if (shuffledQuestions.length === 0) return <div>No questions found</div>

  const q = shuffledQuestions[qIndex % shuffledQuestions.length]

  // ✅ Shuffle יציב לכל שאלה (תלוי רק ב-qIndex)
  const { shuffledOptions, shuffledCorrectIndex } = useMemo(() => {
    const decorated = q.options.map((text, idx) => ({
      text,
      isCorrect: idx === q.correct
    }))

    const shuffled = shuffle(decorated)
    const correctIdx = shuffled.findIndex(x => x.isCorrect)

    return {
      shuffledOptions: shuffled.map(x => x.text),
      shuffledCorrectIndex: correctIdx
    }
  }, [qIndex]) // חשוב: רק qIndex כדי שלא ישתנה על playedAudio

  const handlePlayed = () => {
    setPlayedAudio(true)
  }

  const answer = (i) => {
    const correct = i === shuffledCorrectIndex
    onResult({ correct, meta: { audio: playedAudio } })
    setPlayedAudio(false)
    setQIndex(qIndex + 1)
  }

  return (
    <div className="english-mode">
      <QuestionCard
        direction="ltr"
        text={q.word}
        options={shuffledOptions}
        correctIndex={shuffledCorrectIndex}
        onAnswer={answer}
        ttsText={q.word}
        ttsSentence={q.sentence}
        ttsLang={'en-US'}
        onPlayAudio={handlePlayed}
      />
    </div>
  )
}