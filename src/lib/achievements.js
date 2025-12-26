import { getScopedData, setScopedData } from './storage'

const KEY = 'achievements' // Suffix for scoped key

function read(profileId) {
  if (!profileId) return {}
  try { return JSON.parse(getScopedData(KEY, profileId) || '{}') } catch (e) { return {} }
}
function write(o, profileId) {
  if (!profileId) return
  setScopedData(KEY, JSON.stringify(o), profileId)
}

export function incrementCounter(profileId, k, by = 1) {
  if (!profileId) return []
  const a = read(profileId)
  a.counters = a.counters || {}
  a.counters[k] = (a.counters[k] || 0) + by
  const before = JSON.stringify(a.unlocked || {})
  write(a, profileId)
  checkAchievements(a, profileId)
  const after = JSON.stringify(read(profileId).unlocked || {})
  const newOnes = diffUnlocked(before, after)
  return newOnes
}

export function setStreak(profileId, s) {
  if (!profileId) return []
  const a = read(profileId)
  a.streak = Math.max(a.streak || 0, s)
  const before = JSON.stringify(a.unlocked || {})
  write(a, profileId)
  checkAchievements(a, profileId)
  const after = JSON.stringify(read(profileId).unlocked || {})
  const newOnes = diffUnlocked(before, after)
  return newOnes
}

function diffUnlocked(beforeStr, afterStr) {
  try {
    const before = JSON.parse(beforeStr)
    const after = JSON.parse(afterStr)
    return Object.keys(after).filter(k => !before[k])
  } catch (e) { return [] }
}

export function unlock(profileId, name) {
  if (!profileId) return
  const a = read(profileId)
  a.unlocked = a.unlocked || {}
  a.unlocked[name] = true
  write(a, profileId)
}

export function listUnlocked(profileId) {
  if (!profileId) return {}
  const a = read(profileId)
  return a.unlocked || {}
}

export function getState(profileId) {
  return read(profileId)
}

function checkAchievements(state, profileId) {
  state.unlocked = state.unlocked || {}
  const c = state.counters || {}
  if (c.audio_questions >= 10) state.unlocked['🎧 Excellent Listener'] = true
  if (c.words_category_finished >= 1) state.unlocked['📘 Vocabulary Master'] = true
  if ((state.streak || 0) >= 5) state.unlocked['🚀 No Mistakes'] = true
  write(state, profileId)
}

export function debugReset(profileId) {
  // Not perfectly scoped debug reset but okay
  // Ideally we remove the key via setScopedData(key, null) or something
}
