export async function loadWords() {
  const cached = localStorage.getItem('words_he_cache')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      return parsed
    } catch (e) {
      console.warn('Failed to read cache, fetch anew')
    }
  }

  try {
    const resp = await fetch('/words_he.json')
    const data = await resp.json()
    // Cache a copy
    localStorage.setItem('words_he_cache', JSON.stringify(data))
    return data
  } catch (e) {
    console.error('Failed to load words.json, returning empty list', e)
    return []
  }
}
