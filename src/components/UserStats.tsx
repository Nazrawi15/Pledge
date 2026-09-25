import { useUserData } from '../hooks/useUserData'

interface UserStatsProps {
  address?: string
}

const sLabel = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.6px',
  textTransform: 'uppercase' as const,
  color: '#9ca3af',
  marginBottom: '6px',
}

export function UserStats({ address }: UserStatsProps) {
  const { performance, history, loading } = useUserData(address)

  if (!address) return null

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ paddingBottom: '18px', borderBottom: '1px solid #f3f4f6', marginBottom: '20px' }}>
        <p style={sLabel}>YO Protocol SDK</p>
        <h3 style={{ fontSize: '18px', color: '#111827', fontWeight: 500, margin: 0, letterSpacing: '-0.3px' }}>Your Performance</h3>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #e5e7eb', borderTop: '2px solid #111827', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Loading SDK data...</p>
        </div>
      )}

      {/* Performance cards */}
      {performance && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            {
              label: 'Yield Earned (Realized)',
              value: `$${parseFloat(performance.realized.formatted || '0').toFixed(4)}`,
              color: '#15803d',
              bg: '#f9fafb',
              border: '#f3f4f6',
            },
            {
              label: 'Accruing (Unrealized)',
              value: `$${parseFloat(performance.unrealized.formatted || '0').toFixed(4)}`,
              color: '#1d4ed8',
              bg: '#f9fafb',
              border: '#f3f4f6',
            },
          ].map(card => (
            <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '10px', padding: '16px' }}>
              <p style={sLabel}>{card.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 600, color: card.color, margin: 0, fontFamily: 'DM Mono, monospace' }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction history */}
      {history.length > 0 && (
        <div>
          <p style={{ ...sLabel, marginBottom: '12px' }}>Recent transactions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            {history.map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '14px 16px', borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: tx.type === 'deposit' ? '#f0fdf4' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: tx.type === 'deposit' ? '#15803d' : '#1d4ed8', fontWeight: 700, flexShrink: 0 }}>
                    {tx.type === 'deposit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 1px 0', textTransform: 'capitalize' }}>{tx.type}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      {new Date(tx.blockTimestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tx.type === 'deposit' ? '#15803d' : '#1d4ed8', margin: '0 0 2px 0', fontFamily: 'DM Mono, monospace' }}>
                    {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.assets.formatted).toFixed(2)}
                  </p>
                  <a href={`https://basescan.org/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
                    Basescan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !performance && history.length === 0 && (
        <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '10px', padding: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
            Make your first deposit to see your YO Protocol performance here.
          </p>
        </div>
      )}
    </div>
  )
}