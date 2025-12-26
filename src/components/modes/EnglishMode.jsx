import React, { useState, useEffect, useMemo } from 'react'
import QuestionCard from '../question/QuestionCard'
import EnglishLevelSelection from './EnglishLevelSelection'
import { loadEnglishWords } from '../../data/wordsLoader'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 'translation' | 'sentence' | 'dictation' | null
  const [subMode, setSubMode] = useState(null)

  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [playedAudio, setPlayedAudio] = useState(false)

  useEffect(() => {
    loadEnglishWords()
      .then(data => {
        if (!data || data.length === 0) {
          throw new Error('No questions found')
        }
        setQuestions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error loading questions:", err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Filter and Shuffle when subMode changes
  useEffect(() => {
    if (!subMode || questions.length === 0) return

    let subset = questions
    if (subMode === 'sentence') {
      // Filter only ones with sentences
      subset = questions.filter(q => q.sentence && q.sentence.trim().length > 0)
    }

    // For dictation or translation we use all, or maybe filter simpler ones? Using all for now.
    setShuffledQuestions(shuffle(subset))
    setQIndex(0) // Reset index
  }, [subMode, questions])

  // Calculate current question always (safe if empty)
  const q = shuffledQuestions.length > 0 ? shuffledQuestions[qIndex % shuffledQuestions.length] : null

  // Prepare Question Props based on Mode - Always run hook!
  const { displayProps, correctValue } = useMemo(() => {
    if (!q || !subMode) return { displayProps: {}, correctValue: null }

    if (subMode === 'translation') {
      // Classic
      const decorated = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correct }))
      const shuffled = shuffle(decorated)
      const correctIdx = shuffled.findIndex(x => x.isCorrect)
      return {
        displayProps: {
          text: q.word,
          options: shuffled.map(x => x.text),
          correctIndex: correctIdx,
          inputType: 'options',
          ttsText: q.word,
          ttsSentence: q.sentence // Optional context
        },
        correctValue: correctIdx // logic expects index
      }
    }

    if (subMode === 'sentence') {
      // Fill blank
      const sentence = q.sentence || "Sentence missing"
      const word = q.word
      // Create blanked sentence (case insensitive replace)
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const blanked = sentence.replace(regex, '______')

      const decorated = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correct }))
      const shuffled = shuffle(decorated)
      const correctIdx = shuffled.findIndex(x => x.isCorrect)

      return {
        displayProps: {
          text: blanked,
          options: shuffled.map(x => x.text),
          correctIndex: correctIdx,
          inputType: 'options',
          ttsText: q.word, // Speak word to help user identify what fits
          ttsSentence: null, // Don't speak sentence (reveals answer too easily?) or maybe we should? User said "hear the appropriate word"
          hideAudio: false // Allow audio for sentence if available? Let's say yes for context.
        },
        correctValue: correctIdx
      }
    }

    if (subMode === 'dictation') {
      // Text input, audio only
      return {
        displayProps: {
          text: "???", // Or "Listen and Type"
          options: [], // Not used
          correctIndex: -1,
          inputType: 'text',
          ttsText: q.word, // Main source
          ttsSentence: null,
          audioSrc: `/audio/enWords/${q.word}.mp3` // Heuristic? Or rely on QuestionCard fallback
        },
        correctValue: q.word.trim().toLowerCase()
      }
    }

    return { displayProps: {}, correctValue: null }

  }, [q, subMode])

  if (loading) return <div>Loading questions...</div>
  if (error) return <div>Error: {error}</div>

  if (!subMode) {
    return <EnglishLevelSelection onSelect={setSubMode} />
  }

  if (shuffledQuestions.length === 0) return <div>No matching questions found for this mode</div>

  const handlePlayed = () => setPlayedAudio(true)

  const handleAnswer = (answerObj) => {
    let isCorrect = false

    if (subMode === 'dictation') {
      const typed = String(answerObj).trim().toLowerCase()
      // Allow fuzzy? For now strict
      isCorrect = typed === correctValue
    } else {
      // Index based
      isCorrect = answerObj === correctValue
    }

    onResult({ correct: isCorrect, meta: { audio: playedAudio, mode: subMode } })
    setPlayedAudio(false)
    setQIndex(qIndex + 1)
  }

  return (
    <div className="english-mode">
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setSubMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔙 תפריט</button>
      </div>
      <QuestionCard
        direction="ltr"
        {...displayProps}
        onAnswer={handleAnswer}
        onPlayAudio={handlePlayed}
      />
    </div>
  )
}
