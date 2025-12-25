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
    const resp = await fetch(`${import.meta.env.BASE_URL}words_he.json`)
    const data = await resp.json()
    // Cache a copy
    localStorage.setItem('words_he_cache', JSON.stringify(data))
    return data
  } catch (e) {
    console.error('Failed to load words.json, returning empty list', e)
    return []
  }
}

export async function loadEnglishWords() {
  const cached = localStorage.getItem('words_en_cache')
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (e) {
      console.warn('Failed to read en cache', e)
    }
  }

  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}words_en.json`)
    const data = await resp.json()
    localStorage.setItem('words_en_cache', JSON.stringify(data))
    return data
  } catch (e) {
    console.error('Failed to load words_en.json', e)
    return []
  }
}
