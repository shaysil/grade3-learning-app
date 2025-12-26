import React from 'react'

export default function EnglishLevelSelection({ onSelect }) {
    const modes = [
        { id: 'translation', label: 'תרגום מילים', icon: '📖', desc: 'בחרו את התרגום הנכון' },
        { id: 'sentence', label: 'השלמת משפטים', icon: '✍️', desc: 'השלימו את המילה החסרה' },
        { id: 'dictation', label: 'הכתבה', icon: '🎧', desc: 'כתבו את המילה ששמעתם' },
    ]

    return (
        <div className="level-selection">
            <h2 style={{ marginBottom: 20 }}>בחרו משחק באנגלית</h2>
            <div className="levels-grid" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {modes.map(m => (
                    <button
                        key={m.id}
                        className="level-card"
                        onClick={() => onSelect(m.id)}
                        style={{
                            padding: 20,
                            borderRadius: 16,
                            border: 'none',
                            background: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            minWidth: 140,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'transform 0.2s'
                        }}
                    >
                        <span style={{ fontSize: 32 }}>{m.icon}</span>
                        <span style={{ fontSize: 18, fontWeight: 'bold' }}>{m.label}</span>
                        <span style={{ fontSize: 14, color: '#666' }}>{m.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
