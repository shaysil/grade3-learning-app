import React, { useState, useEffect } from 'react'
import { getProfiles, createProfile, setCurrentProfileId } from '../lib/storage'
import AvatarSelector from './AvatarSelector'

export default function ProfileSelection({ onSelect }) {
    const [profiles, setProfiles] = useState([])
    const [isCreating, setIsCreating] = useState(false)

    // New Profile State
    const [newName, setNewName] = useState('')
    const [newAge, setNewAge] = useState('')
    const [newAvatar, setNewAvatar] = useState('🙂')

    useEffect(() => {
        setProfiles(getProfiles())
    }, [])

    const handleCreate = (e) => {
        e.preventDefault()
        if (!newName.trim()) return

        const p = createProfile(newName, newAvatar, newAge)
        setProfiles(getProfiles()) // refresh
        setIsCreating(false)
        setNewName('')
        setNewAge('')

        // Auto-select? Or just show in list. Let's auto-select.
        setCurrentProfileId(p.id)
        onSelect(p)
    }

    const handleSelect = (p) => {
        setCurrentProfileId(p.id)
        onSelect(p)
    }

    if (isCreating) {
        return (
            <div className="profile-selection card">
                <h2>צור פרופיל חדש</h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem' }}>בחר דמות:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        {['👦', '👧', '🐯', '🐸', '🦁', '👽', '🤖', '🦄', '🐞', '🦖'].map(av => (
                            <button
                                key={av}
                                type="button"
                                onClick={() => setNewAvatar(av)}
                                style={{
                                    fontSize: '2rem',
                                    padding: 8,
                                    border: newAvatar === av ? '3px solid #6366f1' : '1px solid #ccc',
                                    borderRadius: '50%',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {av}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="שם הילד/ה"
                            style={{ padding: 12, fontSize: '1.2rem', borderRadius: 8, border: '1px solid #ccc', width: '200px', textAlign: 'center' }}
                            autoFocus
                        />
                        <input
                            value={newAge}
                            onChange={(e) => setNewAge(e.target.value)}
                            placeholder="גיל"
                            type="number"
                            min="3" max="18"
                            style={{ padding: 12, fontSize: '1.2rem', borderRadius: 8, border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={() => setIsCreating(false)} style={{ background: '#ccc' }}>ביטול</button>
                        <button type="submit" className="primary-btn">שמור ופתח</button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="profile-selection" style={{ textAlign: 'center', padding: 20 }}>
            <h1>מי משחק עכשיו?</h1>

            <div className="profiles-grid" style={{
                display: 'flex',
                gap: 20,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: 40,
                marginBottom: 40
            }}>
                {profiles.map(p => (
                    <button
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className="profile-card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10,
                            padding: 20,
                            border: 'none',
                            background: 'white',
                            borderRadius: 16,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            minWidth: 120
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>{p.avatar}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{p.name}</div>
                    </button>
                ))}

                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        padding: 20,
                        border: '3px dashed #ccc',
                        background: 'transparent',
                        borderRadius: 16,
                        cursor: 'pointer',
                        minWidth: 120,
                        color: '#666'
                    }}
                >
                    <div style={{ fontSize: '3rem' }}>➕</div>
                    <div style={{ fontSize: '1.2rem' }}>הוסף פרופיל</div>
                </button>
            </div>
        </div>
    )
}
