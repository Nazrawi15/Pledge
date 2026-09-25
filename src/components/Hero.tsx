interface HeroProps {
  apy: string
  tvl: string
  onGetStarted: () => void
  isConnected: boolean
}

export function Hero({ apy, tvl, onGetStarted, isConnected }: HeroProps) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 24px 0px 24px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>

      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '100px',
        padding: '6px 16px',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#22c55e',
        }} />
        <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
          Live on Base — {apy}% APY
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        color: 'white',
        fontSize: '48px',
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-1px',
        marginBottom: '20px',
      }}>
        Save in dollars.
        <br />
        <span style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Beat inflation.
        </span>
      </h1>

      {/* Subtitle */}
      <p style={{
        color: '#9ca3af',
        fontSize: '18px',
        lineHeight: 1.6,
        marginBottom: '32px',
        maxWidth: '480px',
        margin: '0 auto 32px auto',
      }}>
        Inflation is stealing your savings every day.
        HoldFirm protects your money in USDC and
        earns you yield — automatically.
      </p>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        marginBottom: '40px',
      }}>
        <div>
          <p style={{ color: '#22c55e', fontSize: '28px', fontWeight: 800 }}>{apy}%</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Current APY</p>
        </div>
        <div style={{
          width: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
        <div>
          <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${tvl}</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Total Locked</p>
        </div>
        <div style={{
          width: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
        <div>
          <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>1.4B</p>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>People at Risk</p>
        </div>
      </div>

      {/* CTA Button */}
      {!isConnected && (
        <button
          onClick={onGetStarted}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            fontWeight: 700,
            fontSize: '18px',
            padding: '16px 48px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Start Saving Now
        </button>
      )}

    </div>
  )
}