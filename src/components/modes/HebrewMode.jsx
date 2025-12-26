import React, { useEffect, useState } from 'react'
import QuestionCard from '../question/QuestionCard'
import { pickRandomQuestions, generateDistractors } from '../../lib/hebrewHelpers'

export default function HebrewMode({ words, onResult }) {
  const [pool, setPool] = useState([])
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [playedAudio, setPlayedAudio] = useState(false)

  useEffect(() => {
    // filter only Hebrew words and shuffle
    const he = words || []
    setPool(he)
    setQueue(pickRandomQuestions(he, 50))
  }, [words])

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0])
      setQueue((q) => q.slice(1))
    }
  }, [queue, current])

  const handlePlayed = (type) => {
    // mark that audio (word or sentence) was played for this question
    setPlayedAudio(true)
  }

  // Ensure we define 'options' and 'correctIndex' consistently
  // We prefer generating distractors/shuffling on one stable "current" question
  // Note: we can't do this inside the render without memo or state, otherwise it re-shuffles on every render (like audio play)
  // But since we rely on 'current' to change only when question changes, useMemo is good.

  // Utility for inline shuffle to avoid dependency
  const shuffleArray = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const { finalOptions, finalCorrectIndex } = React.useMemo(() => {
    if (!current) return { finalOptions: [], finalCorrectIndex: 0 }

    let rawOptions = []
    // If word has explicit options, use them. Otherwise generate.
    if (current.options && current.options.length === 4) {
      rawOptions = [...current.options]
    } else {
      rawOptions = generateDistractors(current, pool)
    }

    // Now shuffle them to ensure random order every time
    // Even generateDistractors shuffles, but if we used explicit options we need to shuffle too.
    // Double shuffling generateDistractors output doesn't hurt.
    const shuffled = shuffleArray(rawOptions)

    // Find where the correct answer landed
    // Logic: the correct answer text is 'current.text' (the word itself)
    // Actually generateDistractors puts current.text in the list.
    // If explicit options are there, they should contain current.text.
    // BUT explicit options might technically be slightly different? 
    // Let's assume correct option is valid text.

    // If explicit correct_option is set, we know which one WAS correct.
    let correctText = current.text
    if (current.options && typeof current.correct_option === 'number') {
      correctText = current.options[current.correct_option]
    }

    // Safety: if for some reason correctText isn't in shuffled (e.g. typos in data), fallback
    let idx = shuffled.indexOf(correctText)
    if (idx === -1) {
      // worst case: just force it into a random slot or log error
      // Assuming valid data for now, or finding closest
      idx = 0
    }

    return { finalOptions: shuffled, finalCorrectIndex: idx }
  }, [current, pool]) // recalculate when current question changes

  const handleAnswer = (selectedIndex) => {
    const correct = selectedIndex === finalCorrectIndex
    onResult({ correct, meta: { audio: playedAudio, category: current.category } })
    setPlayedAudio(false)
    setCurrent(null)
  }

  if (!current) return <div className="instructions">Loading next word...</div>

  return (
    <div className="hebrew-mode">
      <QuestionCard
        direction="rtl"
        audioSrc={current.audio_url}
        sentenceAudio={current.sentence_audio_url}
        text={current.text}
        options={finalOptions}
        correctIndex={finalCorrectIndex}
        onAnswer={handleAnswer}
        ttsText={current.text}
        ttsSentence={current.text}
        ttsLang={'he-IL'}
        onPlayAudio={handlePlayed}
      />
    </div>
  )
}
