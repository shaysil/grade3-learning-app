import React, { useRef, useEffect, useState,useMemo } from 'react'

// Props added:
// - ttsText: string (fallback text to speak for the word)
// - ttsSentence: string (fallback sentence to speak)
// - ttsLang: optional language for TTS (default 'en-US')
// - onPlayAudio: callback(type) called when audio/tts is played (type = 'word'|'sentence')
export default function QuestionCard({ direction='ltr', audioSrc, sentenceAudio, text, options, correctIndex, onAnswer, ttsText, ttsSentence, ttsLang='en-US', onPlayAudio ,hideAudio = false,}) {
  const audio = useRef(null)
  const sentAudio = useRef(null)
  const wordUtter = useRef(null)
  const sentenceUtter = useRef(null)
  const [playedSentence, setPlayedSentence] = useState(false)
  const [playedWord, setPlayedWord] = useState(false)
  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [playErrorMsg, setPlayErrorMsg] = useState(null)

  const showPlayError = (msg) => {
    setPlayErrorMsg(msg)
    setTimeout(() => setPlayErrorMsg(null), 2500)
  }

  useEffect(() => {
    setSelected(null)
    setLocked(false)
     if (hideAudio) {
    // אם מסתירים אודיו (למשל Math) – לא טוענים/מנגנים בכלל
    return
  }
    // helper: try alternative paths based on Hebrew folders / audio naming
    async function tryAlternativeAudio(kind, originalUrl){
      const candidates = []
      if (originalUrl) candidates.push(originalUrl)
      const safe = encodeURIComponent(String(text || '').trim())
      if (kind === 'word'){
        candidates.push(`/audio/hebWords/${safe}.mp3`)
        candidates.push(`/audio/hebWords/${safe}_word.mp3`)
        candidates.push(`/audio/hebWords/${safe}_word1.mp3`)
      } else {
        candidates.push(`/audio/hebSentences/${safe}.mp3`)
        candidates.push(`/audio/hebSentences/${safe}_sentence.mp3`)
        candidates.push(`/audio/hebSentences/${safe}_sentence1.mp3`)
      }

      for (const c of candidates){
        try{
          const a = new Audio(c)
          await a.play()
          // set the appropriate ref so future controls use it
          if (kind === 'word') { audio.current = a; setPlayedWord(true) }
          else { sentAudio.current = a; setPlayedSentence(true) }
          if (onPlayAudio) onPlayAudio(kind)
          return true
        }catch(e){
          console.warn('candidate audio failed', c, e)
          continue
        }
      }
      return false
    }

    // Prefer explicit audio files if provided
    if (audioSrc) {
      audio.current = new Audio(audioSrc)
      sentAudio.current = sentenceAudio ? new Audio(sentenceAudio) : null

      // if audio file errors (404 or decode), attempt to find a matching file then fallback to TTS
      audio.current.addEventListener('error', async () => {
        console.warn('Audio source failed to load:', audioSrc)
        const tried = await tryAlternativeAudio('word', audioSrc)
        if (!tried && ttsText) speakText(ttsText, ttsLang, 'word')
      })
      if (sentAudio.current) {
        sentAudio.current.addEventListener('error', async () => {
          console.warn('Sentence audio failed to load:', sentenceAudio)
          const tried = await tryAlternativeAudio('sentence', sentenceAudio)
          if (!tried && ttsSentence) speakText(ttsSentence, ttsLang, 'sentence')
        })
      }

      // try to auto-play the word; if it fails, attempt alternative audio and finally fallback to TTS
      audio.current.play().then(()=>{
        if (onPlayAudio) onPlayAudio('word')
        setPlayedWord(true)
      }).catch(async (e)=>{
        console.warn('Audio auto-play failed, trying alternatives then TTS', e)
        const triedAlternative = await tryAlternativeAudio('word', audioSrc)
        if (!triedAlternative) {
          if (ttsText) speakText(ttsText, ttsLang, 'word')
        }
      })
    } else if (ttsText) {
      // Fallback to TTS auto-play once (may be blocked by some browsers until user interaction)
      try{
        speakText(ttsText, ttsLang, 'word')
        setPlayedWord(true)
      }catch(e){
        console.warn('TTS auto-play blocked or failed', e)
      }
    }

    return () => {
      if (audio.current) {
        try{ audio.current.pause() }catch(e){}
      }
      if (sentAudio.current) {
        try{ sentAudio.current.pause() }catch(e){}
      }
      // cancel any ongoing speech synthesis
      if (window.speechSynthesis) {
        try{ window.speechSynthesis.cancel() }catch(e){}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc, sentenceAudio, ttsText, ttsSentence, hideAudio])

  const speakText = (str, lang, kind) => {
    if (!str) { showPlayError('No text to speak'); return }
    if (!window.speechSynthesis) { showPlayError('TTS not supported in this browser'); return }
    try {
      const u = new SpeechSynthesisUtterance(str)
      u.lang = lang || 'en-US'
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
    if (sentAudio.current) {
      sentAudio.current.play().then(()=>{
        setPlayedSentence(true)
        if (onPlayAudio) onPlayAudio('sentence')
      }).catch(async (e)=>{
        console.warn('Sentence audio play failed, trying alternatives then falling back to TTS', e)
        const tried = await tryAlternativeAudio('sentence', sentenceAudio)
        if (!tried) {
          if (ttsSentence) speakText(ttsSentence, ttsLang, 'sentence')
          else showPlayError('No sentence audio available')
        }
      })
    } else if (ttsSentence) {
      speakText(ttsSentence, ttsLang, 'sentence')
    } else {
      console.warn('No sentence audio or TTS available')
      showPlayError('No sentence audio available')
    }
  }

  const playWord = () => {
    console.log('playWord pressed', { audioSrc, hasTTSText: !!ttsText })
    if (audio.current) {
      audio.current.play().then(()=>{
        if (onPlayAudio) onPlayAudio('word')
        setPlayedWord(true)
      }).catch(async (e)=>{
        console.warn('Audio play failed, trying alternatives then falling back to TTS', e)
        const tried = await tryAlternativeAudio('word', audioSrc)
        if (!tried) {
          if (ttsText) speakText(ttsText, ttsLang, 'word')
          else showPlayError('No word audio available')
        }
      })
    } else if (ttsText) {
      speakText(ttsText, ttsLang, 'word')
    } else {
      console.warn('No audio or TTS available for word')
      showPlayError('No word audio available')
    }
  }

  const handlePick = (i)=>{
    if (locked) return
    setSelected(i)
    setLocked(true)
    const correct = i === correctIndex
    // play feedback sound
    const s = new Audio(correct?'/audio/correct.mp3':'/audio/wrong.mp3')
    s.play().catch(()=>{})
    // small delay for animation, then notify parent
    setTimeout(()=>{
      onAnswer(i)
    },700)
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

      <div className="question-text" style={{fontSize: '1.05rem'}}>{direction === 'rtl' ? <span dir="rtl">🔤 בחר את האיות הנכון</span> : <span>Choose the correct spelling</span>}</div>

      <div className="options">
        {options.map((opt, i) => {
          const cls = selected === null ? 'option' : i === correctIndex ? 'option correct' : (selected===i? 'option wrong' : 'option disabled')
          return (
            <button className={cls} key={i} onClick={()=>handlePick(i)} disabled={locked}>{opt}</button>
          )
        })}
      </div>
    </div>
  )
}
