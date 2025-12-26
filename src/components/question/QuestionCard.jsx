import React, { useRef, useEffect, useState, useMemo } from 'react'

// Props added:
// - ttsText: string (fallback text to speak for the word)
// - ttsSentence: string (fallback sentence to speak)
// - ttsLang: optional language for TTS (default 'en-US')
// - onPlayAudio: callback(type) called when audio/tts is played (type = 'word'|'sentence')
// ttsLang: optional language for TTS (default 'en-US')
// inputType: 'options' | 'text' (default 'options')
export default function QuestionCard({ direction = 'ltr', audioSrc, sentenceAudio, text, options, correctIndex, onAnswer, ttsText, ttsSentence, ttsLang = 'en-US', onPlayAudio, hideAudio = false, inputType = 'options', instruction }) {
  const audio = useRef(null)
  const sentAudio = useRef(null)
  const wordUtter = useRef(null)
  const sentenceUtter = useRef(null)
  const [playedSentence, setPlayedSentence] = useState(false)
  const [playedWord, setPlayedWord] = useState(false)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [playErrorMsg, setPlayErrorMsg] = useState(null)
  const [textInput, setTextInput] = useState('')

  const isMounted = useRef(false)

  const showPlayError = (msg) => {
    setPlayErrorMsg(msg)
    setTimeout(() => setPlayErrorMsg(null), 2500)
  }

  // helper: try alternative paths based on Hebrew folders / audio naming
  const tryAlternativeAudio = async (kind, originalUrl) => {
    if (!isMounted.current) return false

    // If we are in English mode (LTR), we don't assume Hebrew fallbacks usually.
    // But if we want to support alternative English paths, we could.
    // For now, if LTR, we rely on the primary URL or TTS.
    if (direction === 'ltr') return false;

    const candidates = []
    if (originalUrl) candidates.push(originalUrl)

    // Use ttsText (actual word) if available, otherwise text
    // This fixes Dictation mode where text is "???"
    const content = ttsText || text || '';
    const safe = encodeURIComponent(String(content).trim())

    if (kind === 'word') {
      candidates.push(`/audio/hebWords/${safe}.mp3`)
      candidates.push(`/audio/hebWords/${safe}_word.mp3`)
      candidates.push(`/audio/hebWords/${safe}_word1.mp3`)
    } else {
      candidates.push(`/audio/hebSentences/${safe}.mp3`)
      candidates.push(`/audio/hebSentences/${safe}_sentence.mp3`)
      candidates.push(`/audio/hebSentences/${safe}_sentence1.mp3`)
    }

    for (const c of candidates) {
      if (!isMounted.current) return false
      try {
        const a = new Audio(c)
        await a.play()
        if (!isMounted.current) { a.pause(); return false }
        // set the appropriate ref so future controls use it
        if (kind === 'word') { audio.current = a; setPlayedWord(true) }
        else { sentAudio.current = a; setPlayedSentence(true) }
        if (onPlayAudio) onPlayAudio(kind)
        return true
      } catch (e) {
        continue
      }
    }
    return false
  }

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    setSelected(null)
    setLocked(false)
    setTextInput('') // Reset input on new question

    if (hideAudio) {
      return
    }

    // Safe Auto-Play logic for StrictMode
    const timer = setTimeout(() => {
      if (!isMounted.current) return;
      if (hideAudio) return;

      // Prevent double-speak if already speaking this exact text seriously
      if (window.speechSynthesis.speaking && !audioSrc) {
        // This might be risky if previous word is finishing, but for auto-play it's safer
        // console.log('Skipping auto-play, already speaking')
        // return 
      }

      // Prefer explicit audio files if provided
      if (audioSrc) {
        const a = new Audio(audioSrc)
        audio.current = a

        // We rely on catch() to handle errors effectively for 404s.
        // Removing addEventListener('error') avoids double-fallback.

        // Attempt play
        a.play().then(() => {
          if (isMounted.current) {
            if (onPlayAudio) onPlayAudio('word')
            setPlayedWord(true)
          }
        }).catch(async (e) => {
          console.warn('Audio auto-play failed, trying alternatives', e)
          const triedAlternative = await tryAlternativeAudio('word', audioSrc)
          if (!triedAlternative && ttsText && isMounted.current) {
            speakText(ttsText, ttsLang, 'word')
          }
        })
      } else if (ttsText) {
        // Fallback to TTS auto-play
        // We use a small extra delay or check/cancel to be sure
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        setTimeout(() => {
          if (isMounted.current) {
            try {
              speakText(ttsText, ttsLang, 'word')
              setPlayedWord(true)
            } catch (e) { console.warn('TTS auto-play failed', e) }
          }
        }, 50)
      }

      // Setup sentence audio if available
      if (sentenceAudio) {
        const s = new Audio(sentenceAudio)
        sentAudio.current = s
        s.addEventListener('error', async () => {
          const tried = await tryAlternativeAudio('sentence', sentenceAudio)
          if (!tried && ttsSentence && isMounted.current) { /* fallback if needed */ }
        })
      }

    }, 300)

    return () => {
      clearTimeout(timer)
      if (audio.current) {
        try { audio.current.pause(); audio.current = null } catch (e) { }
      }
      if (sentAudio.current) {
        try { sentAudio.current.pause(); sentAudio.current = null } catch (e) { }
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel() } catch (e) { }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc, sentenceAudio, ttsText, ttsSentence, hideAudio, text])

  const speakText = (str, lang, kind) => {
    if (!str) { showPlayError('No text to speak'); return }
    if (!window.speechSynthesis) { showPlayError('TTS not supported in this browser'); return }
    try {
      const u = new SpeechSynthesisUtterance(str)
      u.lang = lang || 'en-US'
      console.log('Speaking (TTS):', str, lang)
      window.speechSynthesis.speak(u)
      if (kind === 'word') {
        wordUtter.current = u
        setPlayedWord(true)
      } else {
        sentenceUtter.current = u
        setPlayedSentence(true)
      }
      if (onPlayAudio) onPlayAudio(kind)
    } catch (e) {
      console.warn('TTS speak failed', e)
      showPlayError('TTS playback failed')
    }
  }

  const playSentence = () => {
    console.log('playSentence pressed', { sentenceAudio, hasTTSSentence: !!ttsSentence })

    // Always create fresh audio if null to be safe? 
    // Actually relying on ref is ok if set correctly.
    // But if auto-play wasn't used/failed, audio.current might be null.
    // Let's make play robust: if null, create it.

    const playLogic = () => {
      if (sentAudio.current) {
        sentAudio.current.play().then(() => {
          setPlayedSentence(true)
          if (onPlayAudio) onPlayAudio('sentence')
        }).catch(async (e) => {
          console.warn('Sentence play failed, fallback', e)
          const tried = await tryAlternativeAudio('sentence', sentenceAudio)
          if (!tried && ttsSentence) speakText(ttsSentence, ttsLang, 'sentence')
        })
      } else if (sentenceAudio) {
        // JIT creation
        const s = new Audio(sentenceAudio)
        sentAudio.current = s
        playLogic()
      } else if (ttsSentence) {
        speakText(ttsSentence, ttsLang, 'sentence')
      } else {
        showPlayError('No sentence audio available')
      }
    }
    playLogic()
  }

  const playWord = () => {
    console.log('playWord pressed', { audioSrc, hasTTSText: !!ttsText })

    const playLogic = () => {
      if (audio.current) {
        audio.current.play().then(() => {
          if (onPlayAudio) onPlayAudio('word')
          setPlayedWord(true)
        }).catch(async (e) => {
          console.warn('Audio play failed, fallback', e)
          const tried = await tryAlternativeAudio('word', audioSrc)
          if (!tried && ttsText) speakText(ttsText, ttsLang, 'word')
        })
      } else if (audioSrc) {
        // JIT creation
        const a = new Audio(audioSrc)
        audio.current = a
        playLogic()
      } else if (ttsText) {
        speakText(ttsText, ttsLang, 'word')
      } else {
        showPlayError('No word audio available')
      }
    }
    playLogic()
  }

  const handlePick = (i) => {
    if (locked) return
    setSelected(i)
    setLocked(true)
    const correct = i === correctIndex
    // play feedback sound
    const s = new Audio(correct ? '/audio/correct.mp3' : '/audio/wrong.mp3')
    s.play().catch(() => { })

    // small delay for animation
    setTimeout(() => {
      onAnswer(i)
      // If wrong, unlock to allow retry
      if (!correct) {
        setSelected(null)
        setLocked(false)
      }
    }, 700)
  }

  return (
    <div className={`question-card ${direction === 'rtl' ? 'rtl' : ''}`}>
      <div className="hero">
        <div className="question-title">{text}</div>

        {!hideAudio && (
          <div className="play-row">
            <div className="play-item">
              <button
                className="play-circle secondary"
                onClick={playSentence}
                disabled={!(sentenceAudio || ttsSentence)}
                aria-label="Play sentence"
              >
                📝
              </button>
              <div className="play-label">{direction === 'rtl' ? 'משפט' : 'Sentence'}</div>
            </div>

            <div className="play-item">
              <button
                className="play-circle primary"
                onClick={playWord}
                aria-label="Play word"
              >
                🔊
              </button>
              <div className="play-label">{direction === 'rtl' ? 'מילה' : 'Word'}</div>
            </div>
          </div>
        )}



        {playErrorMsg ? <div className="play-error">{playErrorMsg}</div> : null}
      </div>

      <div className="question-text" style={{ fontSize: '1.05rem' }}>
        {instruction ? (
          <span dir={direction === 'rtl' ? 'rtl' : 'ltr'}>{instruction}</span>
        ) : (
          direction === 'rtl' ? <span dir="rtl">🔤 בחר את האיות הנכון</span> : <span>Choose the correct spelling</span>
        )}
      </div>

      <div className="options">
        {inputType === 'options' ? (
          options.map((opt, i) => {
            const cls = selected === null ? 'option' : i === correctIndex ? 'option correct' : (selected === i ? 'option wrong' : 'option disabled')
            return (
              <button className={cls} key={i} onClick={() => handlePick(i)} disabled={locked}>{opt}</button>
            )
          })
        ) : (
          <div className="input-mode" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !locked) {
                  onAnswer(textInput)
                }
              }}
              placeholder="הקלד כאן..."
              style={{
                padding: 14,
                fontSize: '1.2rem',
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                width: '100%',
                maxWidth: '400px',
                textAlign: direction === 'rtl' ? 'right' : 'left',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
              disabled={locked}
              autoFocus
            />
            <button
              className="primary-btn"
              onClick={() => onAnswer(textInput)}
              disabled={locked || !textInput}
              style={{
                padding: '12px 40px',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)',
                minWidth: '200px'
              }}
            >
              בדיקה
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
