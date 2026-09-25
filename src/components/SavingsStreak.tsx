import { useEffect, useState } from 'react'

const sLabel = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.6px',
  textTransform: 'uppercase' as const,
  color: '#9ca3af',
  marginBottom: '6px',
}

export default function SavingsStreak() {
  const [streak, setStreak] = useState(0)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    const storedStreak = parseInt(localStorage.getItem('hf_streak') || '0')
    const storedDate = localStorage.getItem('hf_last_saved')
    setStreak(storedStreak)
    setLastSaved(storedDate)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const isActive = lastSaved === today || lastSaved === yesterday

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <p style={sLabel}>Saving streak</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '28px', lineHeight: 1 }}>🔥</div>
        <div>
          <div style={{ fontSize: '36px', fontWeight: 600, color: '#111827', lineHeight: 1, fontFamily: 'DM Mono, monospace' }}>{streak}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>days in a row</div>
        </div>
      </div>

      <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '14px' }} />

      {streak === 0 && (
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
          Make your first deposit to start your streak.
        </p>
      )}
      {streak > 0 && isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#15803d', fontWeight: 500, margin: 0 }}>Streak alive — keep it going!</p>
        </div>
      )}
      {streak > 0 && !isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#92400e', fontWeight: 500, margin: 0 }}>Save today to keep your streak!</p>
        </div>
      )}
    </div>
  )
}

export function recordSavingToday() {
  const today = new Date().toISOString().split('T')[0]
  const lastSaved = localStorage.getItem('hf_last_saved')
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let streak = parseInt(localStorage.getItem('hf_streak') || '0')

  if (lastSaved === today) return
  if (lastSaved === yesterday) streak += 1
  else streak = 1

  localStorage.setItem('hf_streak', String(streak))
  localStorage.setItem('hf_last_saved', today)
}