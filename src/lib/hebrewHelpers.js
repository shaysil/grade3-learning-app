// Heuristics-based distractor generator for Hebrew words

// Basic utility: edit distance
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      )
    }
  }
  return dp[a.length][b.length]
}

export function pickRandomQuestions(pool, limit=20) {
  const arr = [...pool]
  for (let i = arr.length -1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, limit)
}

function sameLength(a,b){return a.length === b.length}

function sharedLetters(a,b){
  const set = new Set(a.split(''))
  let shared = 0
  for (const c of new Set(b.split(''))) if (set.has(c)) shared++
  return shared
}

// generate 4 options including the correct one; if the word has explicit options, prefer those
export function generateDistractors(word, pool) {
  const correct = word.text
  const candidates = pool
    .filter(w => w.text !== correct)
    .filter(w => sameLength(w.text, correct))
    .map(w => ({text: w.text, score: sharedLetters(correct, w.text) - levenshtein(correct, w.text)}))
    .sort((a,b)=>b.score-a.score)

  const options = [correct]
  for (const c of candidates) {
    if (options.length>=4) break
    options.push(c.text)
  }

  // Fallback: if not enough, create mild corruptions (common mistakes)
  if (options.length < 4) {
    const transforms = [
      s => s.replace(/ה$/,'א'),
      s => s.replace(/ו$/,'ו'),
      s => s.replace(/י$/,'י'),
      s => s.slice(0,-1) + (s.slice(-1) === 'ת' ? 'ט' : 'ת')
    ]
    let i=0
    while (options.length<4 && i<transforms.length) {
      const t = transforms[i](correct)
      if (!options.includes(t)) options.push(t)
      i++
    }
  }

  // shuffle options
  for (let i = options.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1))
    ;[options[i], options[j]]=[options[j], options[i]]
  }
  return options
}
