import { useState } from 'react'

interface LockBoxProps {
  currentBalance: number
}

export function LockBox({ currentBalance }: LockBoxProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [lockDays, setLockDays] = useState(30)
  const [lockDate, setLockDate] = useState<Date | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  function handleLock() {
    const unlock = new Date()
    unlock.setDate(unlock.getDate() + lockDays)
    setLockDate(unlock)
    setIsLocked(true)
    setShowWarning(false)
  }

  function handleUnlock() {
    setShowWarning(true)
  }

  function confirmUnlock() {
    setIsLocked(false)
    setLockDate(null)
    setShowWarning(false)
  }

  const daysRemaining = lockDate
    ? Math.ceil((lockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const progressPercent = lockDate
    ? Math.max(0, ((lockDays - daysRemaining) / lockDays) * 100)
    : 0

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '20px', margin: 0 }}>LockBox</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>Commitment builds wealth.</p>
        </div>
        <span style={{ fontSize: '24px' }}>{isLocked ? '🔒' : '🔓'}</span>
      </div>

      {/* Not Locked */}
      {!isLocked && (
        <div>
          <p style={{ color: '#374151', fontSize: '14px', marginBottom: '20px' }}>
            Lock your savings for a set period and let yield do the work.
          </p>

          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '10px' }}>
            CHOOSE LOCK DURATION
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setLockDays(days)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: lockDays === days ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  backgroundColor: lockDays === days ? '#f0fdf4' : '#f9fafb',
                  color: lockDays === days ? '#15803d' : '#6b7280',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {days} Days
              </button>
            ))}
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #f3f4f6',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>LOCKING</p>
              <p style={{ color: '#111827', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                ${currentBalance.toFixed(2)} USDC
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>UNLOCK DATE</p>
              <p style={{ color: '#111827', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                {new Date(
                  new Date().setDate(new Date().getDate() + lockDays)
                ).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleLock}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
            }}
          >
            Lock My Savings
          </button>
        </div>
      )}

      {/* Locked State */}
      {isLocked && !showWarning && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '56px', margin: '0 0 8px 0' }}>🔒</p>
            <p style={{ color: '#111827', fontSize: '40px', fontWeight: 800, margin: '0 0 4px 0' }}>{daysRemaining}</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>days until unlock</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Lock progress</span>
              <span style={{ color: '#111827', fontSize: '13px', fontWeight: 700 }}>
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '100px',
              height: '8px',
            }}>
              <div style={{
                height: '8px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                width: `${progressPercent}%`,
              }} />
            </div>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #f3f4f6',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>LOCKED AMOUNT</p>
              <p style={{ color: '#111827', fontWeight: 700, margin: 0 }}>${currentBalance.toFixed(2)} USDC</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>UNLOCK DATE</p>
              <p style={{ color: '#111827', fontWeight: 700, margin: 0 }}>
                {lockDate?.toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 600, margin: 0 }}>
              ✅ Your savings are locked and earning yield every day
            </p>
          </div>

          <button
            onClick={handleUnlock}
            style={{
              width: '100%',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#9ca3af',
              fontWeight: 600,
              fontSize: '14px',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            Unlock Early
          </button>
        </div>
      )}

      {/* Warning State */}
      {showWarning && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>⚠️</p>
            <p style={{ color: '#111827', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Unlock early?
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
              You still have {daysRemaining} days remaining on your commitment.
              Breaking the lock early reduces your savings discipline.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
              }}
            >
              Keep Locked
            </button>
            <button
              onClick={confirmUnlock}
              style={{
                flex: 1,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Unlock Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  )
}