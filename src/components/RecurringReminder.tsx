import { useEffect, useState } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const sLabel = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.6px',
  textTransform: 'uppercase' as const,
  color: '#9ca3af',
  marginBottom: '6px',
}

export default function RecurringReminder() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [showNudge, setShowNudge] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hf_reminder_day')
    const lastSaved = localStorage.getItem('hf_last_saved')
    if (stored !== null) {
      setSelectedDay(parseInt(stored))
      setSaved(true)
      const today = new Date().getDay()
      const todayDate = new Date().toISOString().split('T')[0]
      if (parseInt(stored) === today && lastSaved !== todayDate) {
        setShowNudge(true)
      }
    }
  }, [])

  const handleSave = () => {
    if (selectedDay === null) return
    localStorage.setItem('hf_reminder_day', String(selectedDay))
    setSaved(true)
    setShowNudge(false)
  }

  const handleReset = () => {
    localStorage.removeItem('hf_reminder_day')
    setSelectedDay(null)
    setSaved(false)
    setShowNudge(false)
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <p style={sLabel}>Weekly reminder</p>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>
        Pick a day each week to save. Build the habit.
      </p>

      {showNudge && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
          <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 500, margin: 0 }}>
            Today is your saving day — deposit now.
          </p>
        </div>
      )}

      {!saved ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: selectedDay === i ? '2px solid #111827' : '1px solid #e5e7eb',
                  backgroundColor: selectedDay === i ? '#111827' : '#ffffff',
                  color: selectedDay === i ? '#ffffff' : '#6b7280',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.12s ease',
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={selectedDay === null}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              background: selectedDay === null ? '#f3f4f6' : '#111827',
              color: selectedDay === null ? '#9ca3af' : '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: selectedDay === null ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.12s ease',
            }}
          >
            Set reminder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d' }} />
            <p style={{ fontSize: '13px', color: '#374151', fontWeight: 500, margin: 0 }}>
              Every <strong>{DAYS[selectedDay!]}</strong>
            </p>
          </div>
          <button
            onClick={handleReset}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  )
}