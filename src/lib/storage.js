
const PROFILES_KEY = 'app_profiles' // List of { id, name, avatar }
const CURRENT_PROFILE_KEY = 'current_profile_id'

// Helper to generate IDs
const generateId = () => '_' + Math.random().toString(36).substr(2, 9)

// --- Profile Management ---

export function getProfiles() {
    try {
        return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]')
    } catch (e) {
        return []
    }
}

export function createProfile(name, avatar, age) {
    const profiles = getProfiles()
    const newProfile = {
        id: generateId(),
        name,
        avatar: avatar || '🙂',
        age: age || '',
        createdAt: Date.now()
    }
    profiles.push(newProfile)
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    return newProfile
}

export function getCurrentProfileId() {
    return localStorage.getItem(CURRENT_PROFILE_KEY)
}

export function setCurrentProfileId(id) {
    if (!id) {
        localStorage.removeItem(CURRENT_PROFILE_KEY)
    } else {
        localStorage.setItem(CURRENT_PROFILE_KEY, id)
    }
}

export function getProfile(id) {
    const profiles = getProfiles()
    return profiles.find(p => p.id === id) || null
}

export function deleteProfile(id) {
    const profiles = getProfiles().filter(p => p.id !== id)
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    if (getCurrentProfileId() === id) {
        setCurrentProfileId(null)
    }
}

// --- Scoped Data Access ---

export function getScopedData(key, profileId) {
    if (!profileId) return null
    const scopedKey = `profile_${profileId}_${key}`
    return localStorage.getItem(scopedKey)
}

export function setScopedData(key, value, profileId) {
    if (!profileId) return
    const scopedKey = `profile_${profileId}_${key}`
    localStorage.setItem(scopedKey, value)
}

// --- Legacy Migration ---

export function migrateLegacyDataIfNeeded() {
    // Check if we have legacy data (child_name in root) but no profiles
    const legacyName = localStorage.getItem('child_name')
    const profiles = getProfiles()

    if (legacyName && profiles.length === 0) {
        console.log('Migrating legacy user:', legacyName)
        // Create profile for legacy user
        const avatar = localStorage.getItem('selected_avatar') || '🙂'
        const newProfile = createProfile(legacyName, avatar)

        // Move legacy points/streak
        const points = localStorage.getItem('points')
        const streak = localStorage.getItem('streak')
        const achievements = localStorage.getItem('achievements_v1')

        if (points) setScopedData('points', points, newProfile.id)
        if (streak) setScopedData('streak', streak, newProfile.id)
        if (achievements) setScopedData('achievements', achievements, newProfile.id)

        // Set as current
        setCurrentProfileId(newProfile.id)

        // Clean up legacy keys? Maybe keep for safety or just rename.
        // For now we leave them, but the app will now prefer profile data.
        return newProfile
    }
    return null
}
