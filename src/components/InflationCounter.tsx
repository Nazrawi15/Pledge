import { useEffect, useState } from 'react'

interface InflationCounterProps {
  usdcBalance: number
  inflationRate: number
  currencyCode: string
  currencyRate: number
}

export function InflationCounter({
  usdcBalance,
  inflationRate,
  currencyCode,
  currencyRate,
}: InflationCounterProps) {
  const [lostAmount, setLostAmount] = useState(0)

  useEffect(() => {
    setLostAmount(0)
    const annualLossRate = inflationRate / 100
    const perSecondLoss = annualLossRate / (365 * 24 * 60 * 60)
    // Use at least $1000 equivalent for dramatic effect — show the real cost of inflation
    // even when the user's balance is small. This represents what 1000 USDC would lose.
    const referenceBalance = Math.max(usdcBalance, 1000)
    const balanceInLocal = referenceBalance * currencyRate

    const interval = setInterval(() => {
      setLostAmount(prev => prev + balanceInLocal * perSecondLoss)
    }, 100)

    return () => clearInterval(interval)
  }, [usdcBalance, inflationRate, currencyRate])

  // Annual loss in local currency for $1000
  const referenceBalance = Math.max(usdcBalance, 1000)
  const annualLossLocal = referenceBalance * currencyRate * (inflationRate / 100)
  const annualLossFormatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(annualLossLocal)

  // Ticking counter formatted
  const tickFormatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(lostAmount)

  return (
    <div style={{ height: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            backgroundColor: '#fca5a5', animation: 'hf-pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{ position: 'absolute', inset: 1, borderRadius: '50%', backgroundColor: '#dc2626' }} />
        </div>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 700, color: '#dc2626',
          textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
        }}>
          Inflation stealing right now
        </p>
      </div>

      {/* Live ticking number */}
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#dc2626',
        letterSpacing: '-0.5px',
        margin: '0 0 2px 0',
        lineHeight: 1.1,
      }}>
        −{currencyCode} {tickFormatted}
      </p>
      <p style={{ color: '#a8a29e', fontSize: '0.7rem', margin: '0 0 14px 0' }}>
        lost since page load · updating live
      </p>

      {/* Annual projection — the scary number */}
      <div style={{
        background: 'rgba(220,38,38,0.06)',
        border: '1px solid rgba(220,38,38,0.15)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px 0' }}>
          Annual loss on $1,000 savings
        </p>
        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 2px 0' }}>
          −{currencyCode} {annualLossFormatted}
        </p>
        <p style={{ fontSize: '0.6875rem', color: '#9ca3af', margin: 0 }}>
          at {inflationRate}% annual inflation
        </p>
      </div>

      {/* Protection badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(16,185,129,0.08)',
        border: '1px solid #6ee7b7',
        borderRadius: 10,
        padding: '9px 12px',
      }}>
        <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>🔒</span>
        <p style={{ color: '#065f46', fontSize: '14px', fontWeight: 600, fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
          Pledge is protecting your savings from this
        </p>
      </div>

      <style>{`
        @keyframes hf-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
