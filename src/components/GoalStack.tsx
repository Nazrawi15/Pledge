import { useState } from 'react'

interface GoalStackProps {
  currentBalance: number
  apy: string
}

const sLabel = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.6px',
  textTransform: 'uppercase' as const,
  color: '#9ca3af',
  marginBottom: '6px',
}

const sInput = {
  width: '100%',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  color: '#111827',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'Inter, sans-serif',
}

export function GoalStack({ currentBalance, apy }: GoalStackProps) {
  const [goalAmount, setGoalAmount] = useState(250)
  const [goalName, setGoalName] = useState('School fees')
  const [goalDate, setGoalDate] = useState('2026-07-31')
  const [isEditing, setIsEditing] = useState(false)

  const progress = Math.min((currentBalance / goalAmount) * 100, 100)
  const today = new Date()
  const deadline = new Date(goalDate)
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const apyNumber = parseFloat(apy) / 100
  const dailyRate = apyNumber / 365
  const projectedBalance = currentBalance * Math.pow(1 + dailyRate, daysLeft)
  const willReachGoal = projectedBalance >= goalAmount
  const remaining = Math.max(goalAmount - currentBalance, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <h2 style={{ fontSize: '26px', color: '#111827', fontWeight: 400, margin: '0 0 4px 0', letterSpacing: '-0.5px', fontFamily: 'Instrument Serif, Georgia, serif' }}>GoalStack</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Track your savings toward a target.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151', fontSize: '13px', fontWeight: 500, padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.12s' }}
        >
          {isEditing ? 'Save' : 'Edit goal'}
        </button>
      </div>

      {/* Edit mode */}
      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', padding: '18px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
          <div>
            <p style={sLabel}>Goal name</p>
            <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} style={sInput} />
          </div>
          <div>
            <p style={sLabel}>Target amount (USD)</p>
            <input type="number" value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))} style={sInput} />
          </div>
          <div>
            <p style={sLabel}>Target date</p>
            <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} style={sInput} />
          </div>
        </div>
      )}

      {/* Goal name display */}
      {!isEditing && (
        <div style={{ marginBottom: '24px' }}>
          <p style={sLabel}>Saving for</p>
          <p style={{ color: '#111827', fontSize: '22px', fontWeight: 600, margin: 0, letterSpacing: '-0.3px' }}>{goalName}</p>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Progress</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'DM Mono, monospace' }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '100px', height: '8px' }}>
          <div style={{ height: '8px', borderRadius: '100px', backgroundColor: progress >= 100 ? '#15803d' : '#111827', width: `${progress}%`, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>${currentBalance.toFixed(2)}</span>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontFamily: 'DM Mono, monospace' }}>Goal: ${goalAmount}</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Days left', value: daysLeft.toString() },
          { label: 'Projected', value: `$${projectedBalance.toFixed(2)}` },
          { label: 'Remaining', value: `$${remaining.toFixed(2)}` },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6', textAlign: 'center' }}>
            <p style={sLabel}>{stat.label}</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'DM Mono, monospace' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status */}
      {willReachGoal ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', background: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', flexShrink: 0 }}>✓</div>
          <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            On track to reach your goal by {new Date(goalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', background: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', flexShrink: 0 }}>!</div>
          <p style={{ color: '#92400e', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            Deposit more to reach ${goalAmount} by your deadline
          </p>
        </div>
      )}
    </div>
  )
}