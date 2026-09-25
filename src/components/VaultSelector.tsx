import { VAULTS } from '../lib/pledge'
import type { VaultKey } from '../lib/pledge'
import { useVaultStats } from '../hooks/useVaultStats'

interface Props {
  selected: VaultKey
  onChange: (key: VaultKey) => void
}

function VaultCard({ vaultKey, selected, onClick }: { vaultKey: VaultKey; selected: boolean; onClick: () => void }) {
  const vault = VAULTS[vaultKey]
  const { apy, tvl, loading } = useVaultStats(vaultKey)
  const accentColor = '#10b981'

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '16px', borderRadius: '10px',
        border: selected ? `1.5px solid ${accentColor}` : '1px solid #e8e0d8',
        background: selected ? 'rgba(16,185,129,0.06)' : '#faf6f0',
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
        fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative',
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fdf8f3', fontWeight: 700 }}>✓</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>{vault.flag}</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>{vault.symbol}</div>
          <div style={{ fontSize: '11px', color: '#78716c', fontWeight: 500 }}>{vault.label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', color: '#a8a29e', textTransform: 'uppercase', marginBottom: '2px' }}>APY</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: accentColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{loading ? '—' : `${apy}%`}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', color: '#a8a29e', textTransform: 'uppercase', marginBottom: '2px' }}>TVL</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{loading ? '—' : `$${tvl}`}</div>
        </div>
      </div>
      <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, color: accentColor, background: 'rgba(74,222,128,0.12)', borderRadius: '4px', padding: '2px 8px', marginBottom: '8px' }}>{vault.asset}</div>
      <p style={{ fontSize: '12px', color: '#78716c', margin: 0, lineHeight: 1.5 }}>{vault.description}</p>
    </button>
  )
}

export function VaultSelector({ selected, onChange }: Props) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '10px' }}>
        Savings vault
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <VaultCard vaultKey="pledgeUSD" selected={selected === 'pledgeUSD'} onClick={() => onChange('pledgeUSD')} />
      </div>
    </div>
  )
}