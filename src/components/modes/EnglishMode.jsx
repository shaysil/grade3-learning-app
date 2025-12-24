import React, { useState } from 'react'
import QuestionCard from '../question/QuestionCard'

export default function EnglishMode({ onResult }) {
  const [qIndex, setQIndex] = useState(0)
  const [playedAudio, setPlayedAudio] = useState(false)
  const questions = [
    { word: 'apple', options: ['apple','aple','appel','appl'], correct: 0, sentence: 'I ate a red apple.' },
    { word: 'happy', options: ['happy','hapy','hapsy','happi'], correct: 0, sentence: 'She was very happy today.' }
  ]

  const q = questions[qIndex % questions.length]

  const handlePlayed = (type) => {
    // note that either word or sentence played should mark this question as audio-enabled
    setPlayedAudio(true)
  }

  const answer = (i) => {
    const correct = i === q.correct
    onResult({ correct, meta: { audio: playedAudio } })
    setPlayedAudio(false)
    setQIndex(qIndex+1)
  }

  return (
    <div className="english-mode">
      <QuestionCard
        direction="ltr"
        text={q.word}
        options={q.options}
        correctIndex={q.correct}
        onAnswer={answer}
        // provide TTS fallbacks (no pre-recorded audio files for English questions)
        ttsText={q.word}
        ttsSentence={q.sentence}
        ttsLang={'en-US'}
        onPlayAudio={handlePlayed}
      />
    </div>
  )
}
