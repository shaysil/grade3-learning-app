const KEY = 'achievements_v1'

function read(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '{}') }catch(e){return {}}
}
function write(o){ localStorage.setItem(KEY, JSON.stringify(o)) }

export function incrementCounter(k, by=1){
  const a = read()
  a.counters = a.counters || {}
  a.counters[k] = (a.counters[k] || 0) + by
  const before = JSON.stringify(a.unlocked || {})
  write(a)
  checkAchievements(a)
  const after = JSON.stringify(read().unlocked || {})
  const newOnes = diffUnlocked(before, after)
  return newOnes
}

export function setStreak(s){
  const a = read()
  a.streak = Math.max(a.streak || 0, s)
  const before = JSON.stringify(a.unlocked || {})
  write(a)
  checkAchievements(a)
  const after = JSON.stringify(read().unlocked || {})
  const newOnes = diffUnlocked(before, after)
  return newOnes
}

function diffUnlocked(beforeStr, afterStr){
  try{
    const before = JSON.parse(beforeStr)
    const after = JSON.parse(afterStr)
    return Object.keys(after).filter(k=>!before[k])
  }catch(e){return []}
}

export function unlock(name){
  const a = read()
  a.unlocked = a.unlocked || {}
  a.unlocked[name] = true
  write(a)
}

export function listUnlocked(){
  const a = read()
  return a.unlocked || {}
}

export function getState(){
  return read()
}

function checkAchievements(state){
  state.unlocked = state.unlocked || {}
  const c = state.counters || {}
  if (c.audio_questions >= 10) state.unlocked['🎧 Excellent Listener'] = true
  if (c.words_category_finished >= 1) state.unlocked['📘 Vocabulary Master'] = true
  if ((state.streak || 0) >= 5) state.unlocked['🚀 No Mistakes'] = true
  write(state)
}

export function debugReset(){ localStorage.removeItem(KEY) }
