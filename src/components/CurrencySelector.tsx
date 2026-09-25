import { useState } from 'react'
import { CURRENCIES } from '../hooks/useCurrencyRate'

// Extra global currencies to show at top — not in useCurrencyRate but useful for display
const GLOBAL_OPTIONS = [
  { code: 'USD', flag: '💵', name: 'USD · Dollar', inflation: 0, isGlobal: true },
  { code: 'EUR', flag: '💶', name: 'EUR · Euro', inflation: 0, isGlobal: true },
]

interface CurrencySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export function CurrencySelector({ selected, onChange }: CurrencySelectorProps) {
  const [focused, setFocused] = useState(false)

  // Find selected from either global options or CURRENCIES
  const selectedGlobal = GLOBAL_OPTIONS.find(c => c.code === selected)
  const selectedLocal = CURRENCIES.find(c => c.code === selected)

  const displayFlag = selectedGlobal?.flag ?? selectedLocal?.flag ?? ''
  const displayName = selectedGlobal?.name ?? selectedLocal?.name ?? ''
  const displaySub = selectedGlobal
    ? 'Save in stable currency · works globally'
    : selectedLocal
    ? `${selectedLocal.inflation}% annual inflation`
    : ''

  return (
    <div style={{ position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Selected preview */}
      {(selectedGlobal || selectedLocal) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: '#faf6f0', borderRadius: 10, border: '1px solid #f0ebe3' }}>
          <span style={{ fontSize: '1.4rem' }}>{displayFlag}</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', margin: 0, lineHeight: 1.2 }}>{displayName}</p>
            <p style={{ fontSize: '12px', color: selectedGlobal ? '#059669' : '#d97706', margin: 0, fontWeight: 600, marginTop: '2px' }}>{displaySub}</p>
          </div>
        </div>
      )}

      {/* Dropdown */}
      <div style={{ position: 'relative' }}>
        <select
          value={selected}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            backgroundColor: '#faf6f0',
            border: `1.5px solid ${focused ? '#10b981' : '#d6cdc3'}`,
            color: '#1c1917',
            borderRadius: 10,
            padding: '11px 36px 11px 14px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'border-color 0.15s',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%2378716c' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none',
          }}
        >
          {/* Global stable currencies at top */}
          <optgroup label="🌍 Global — Stable Currency">
            {GLOBAL_OPTIONS.map(c => (
              <option key={c.code} value={c.code} style={{ backgroundColor: '#fefcf9', color: '#1c1917' }}>
                {c.flag} {c.name}
              </option>
            ))}
          </optgroup>

          {/* High-inflation local currencies */}
          <optgroup label="📍 High-Inflation Currencies">
            {CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code} style={{ backgroundColor: '#fefcf9', color: '#1c1917' }}>
                {currency.flag} {currency.name} ({currency.code}) — {currency.inflation}%
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <p style={{ fontSize: '12px', color: '#78716c', fontWeight: 500, marginTop: '10px', lineHeight: 1.5 }}>
        Don't see your country? Select any high-inflation currency — the math works the same way.
      </p>
    </div>
  )
}
