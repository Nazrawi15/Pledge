import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { PLEDGE_VAULT_ABI, PLEDGE_VAULT_ADDRESS, USDC_ARC } from '../lib/pledgeVault'

const ERC20_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

const s = {
  label: { fontSize: '12px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const, color: '#44403c', marginBottom: '8px' },
  card: { background: '#faf6f0', border: '1px solid #e8e0d8', borderRadius: '12px', padding: '18px' },
  divider: { height: '1px', background: '#ede8e1', margin: '20px 0' },
}

function ProjectedEarnings({ amount, lockDays, apy }: { amount: string; lockDays: number; apy: number }) {
  const deposit = parseFloat(amount) || 0
  if (deposit <= 0) return null
  const years = lockDays / 365
  const baseYield = deposit * (apy / 100) * years
  const penaltyLow = deposit * 0.01 * years
  const penaltyMed = deposit * 0.04 * years
  const penaltyHigh = deposit * 0.08 * years
  const apyLow = (apy + 1).toFixed(1)
  const apyMed = (apy + 4).toFixed(1)
  const apyHigh = (apy + 8).toFixed(1)

  return (
    <div style={{ border: '1px solid #e8e0d8', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '12px 16px', background: '#faf6f0', borderBottom: '1px solid #ede8e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1c1917' }}>Projected earnings · {lockDays} days</span>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669', fontFamily: "'DM Mono', monospace" }}>{apyLow}% – {apyHigh}% APY</span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#44403c', fontWeight: 500 }}>Deposit</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', fontFamily: "'DM Mono', monospace" }}>${deposit.toFixed(2)} USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#44403c', fontWeight: 500 }}>Base vault yield ({apy}% APY)</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669', fontFamily: "'DM Mono', monospace" }}>+${baseYield.toFixed(4)}</span>
        </div>
        <div style={s.divider} />
        <p style={{ ...s.label, margin: 0 }}>Penalty rewards from early withdrawers</p>
        {[
          { label: 'Low activity', value: penaltyLow, apy: apyLow },
          { label: 'Medium activity', value: penaltyMed, apy: apyMed },
          { label: 'High activity', value: penaltyHigh, apy: apyHigh },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.label === 'Low activity' ? '#fbbf24' : row.label === 'Medium activity' ? '#f97316' : '#ef4444' }} />
              <span style={{ fontSize: '14px', color: '#44403c', fontWeight: 500 }}>{row.label}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669', fontFamily: "'DM Mono', monospace" }}>+${row.value.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PledgeVaultPanel() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState<30 | 60 | 90>(30)
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'done' | 'withdrawing' | 'withdrawn' | 'claiming' | 'claimed'>('idle')

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()
  const { writeContract: writeWithdraw, data: withdrawTxHash } = useWriteContract()
  const { writeContract: writeClaim, data: claimTxHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash })
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash })

  const { data: userShares, refetch: refetchShares } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getUserShares', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: pendingReward, refetch: refetchReward } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getPendingReward', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: totalEarned } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getTotalEarnedFromPenalties', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: userLockPeriod } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getUserLockPeriod', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: isLocked } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'isLocked', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: timeRemaining } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getTimeRemaining', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: depositorCount } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'getDepositorCount' })
  const { data: totalPenaltyCollected } = useReadContract({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'totalPenaltyCollected' })

  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      setStep('depositing')
      const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
      writeDeposit({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'deposit', args: [amountInUnits, BigInt(lockDays)] })
    }
  }, [approveSuccess])

  useEffect(() => { if (depositSuccess && step === 'depositing') { setStep('done'); refetchShares(); refetchReward() } }, [depositSuccess])
  useEffect(() => { if (withdrawSuccess && step === 'withdrawing') setStep('withdrawn') }, [withdrawSuccess])
  useEffect(() => { if (claimSuccess && step === 'claiming') { setStep('claimed'); refetchReward() } }, [claimSuccess])

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({ address: USDC_ARC, abi: ERC20_ABI, functionName: 'approve', args: [PLEDGE_VAULT_ADDRESS, amountInUnits] })
  }
  function handleWithdraw() {
    if (!userShares || userShares === BigInt(0)) return
    setStep('withdrawing')
    writeWithdraw({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'withdraw', args: [userShares] })
  }
  function handleClaim() {
    setStep('claiming')
    writeClaim({ address: PLEDGE_VAULT_ADDRESS, abi: PLEDGE_VAULT_ABI, functionName: 'claimRewards', args: [] })
  }

  const sharesFormatted = userShares ? (Number(userShares) / 1e6).toFixed(4) : '0'
  const pendingFormatted = pendingReward ? (Number(pendingReward) / 1e6).toFixed(6) : '0.000000'
  const totalEarnedFormatted = totalEarned ? (Number(totalEarned) / 1e6).toFixed(4) : '0'
  const totalPenaltyFormatted = totalPenaltyCollected ? (Number(totalPenaltyCollected) / 1e6).toFixed(4) : '0'
  const daysRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 86400) : 0
  const hasPendingReward = !!(pendingReward && pendingReward > BigInt(0))
  const hasShares = !!(userShares && userShares > BigInt(0))

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid #ede8e1' }}>
        <div>
          <h2 style={{ fontSize: '30px', color: '#1c1917', fontWeight: 400, marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: 'Instrument Serif, Georgia, serif' }}>PledgeVault</h2>
          <p style={{ fontSize: '15px', color: '#44403c', fontWeight: 500, margin: 0 }}>Lock savings. Earn from early withdrawals. Fully onchain, on Arc.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{depositorCount?.toString() ?? '0'}</div>
          <div style={{ fontSize: '12px', color: '#44403c', fontWeight: 700, letterSpacing: '0.5px', marginTop: '3px' }}>ACTIVE SAVERS</div>
        </div>
      </div>

      {/* How it works banner */}
      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: '#d97706', fontWeight: 800, marginBottom: '6px' }}>How it works</p>
        <p style={{ fontSize: '14px', color: '#78350f', fontWeight: 500, margin: 0, lineHeight: 1.7 }}>
          Lock USDC for 30, 60, or 90 days. If anyone withdraws early, they pay a <strong>4.5% penalty</strong> — automatically distributed to everyone who stayed committed. <strong>Every early withdrawal makes your position more valuable.</strong> Patience pays.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Your Shares', value: sharesFormatted, color: '#1c1917' },
          { label: 'Pending Rewards', value: pendingFormatted, color: '#10b981' },
          { label: 'Total Earned', value: totalEarnedFormatted, color: '#1c1917' },
          { label: 'Days Left', value: hasShares ? (isLocked ? `${daysRemaining}d` : '✅ Free') : '—', color: isLocked ? '#4f46e5' : '#1c1917' },
        ].map(stat => (
          <div key={stat.label} style={s.card}>
            <p style={s.label}>{stat.label}</p>
            <p style={{ fontSize: '19px', fontWeight: 800, color: stat.color, margin: 0, fontFamily: "'DM Mono', monospace" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 🎰 Discipline Jackpot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.07) 100%)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#d97706', margin: '0 0 8px 0' }}>🎰 Discipline Jackpot</p>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#1c1917', margin: '0 0 4px 0', fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
            {totalPenaltyFormatted} <span style={{ fontSize: '14px', color: '#78716c', fontWeight: 500 }}>vault shares</span>
          </p>
          <p style={{ fontSize: '14px', color: '#92400e', fontWeight: 600, margin: 0 }}>Paid by weak hands. Waiting for diamond hands.</p>
        </div>
        <div style={{ fontSize: '32px' }}>💎</div>
      </div>

      {/* Lock period info */}
      {hasShares && userLockPeriod && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>Your lock period: {userLockPeriod.toString()} days</span>
          {isLocked && <span style={{ fontSize: '14px', color: '#44403c', fontWeight: 500 }}>{daysRemaining} days remaining</span>}
        </div>
      )}

      {/* Claim rewards */}
      {hasPendingReward && step === 'idle' && (
        <button
          onClick={handleClaim}
          style={{ width: '100%', marginBottom: '16px', background: '#10b981', color: '#fdf8f3', fontWeight: 700, fontSize: '14px', padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Claim {pendingFormatted} from penalty pool →
        </button>
      )}

      {/* Main idle form */}
      {step === 'idle' && (
        <div>
          <div style={s.divider} />
          <p style={s.label}>Lock period</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {([
              { days: 30 as const, label: '30 days', sub: 'Standard' },
              { days: 60 as const, label: '60 days', sub: 'More rewards' },
              { days: 90 as const, label: '90 days', sub: 'Max rewards' },
            ]).map(opt => (
              <button
                key={opt.days}
                onClick={() => setLockDays(opt.days)}
                style={{
                  padding: '14px 12px', borderRadius: '10px', cursor: 'pointer',
                  border: lockDays === opt.days ? '2px solid #10b981' : '1.5px solid #d6cdc3',
                  background: lockDays === opt.days ? 'rgba(16,185,129,0.08)' : '#faf6f0',
                  transition: 'all 0.12s ease', textAlign: 'center' as const, fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: lockDays === opt.days ? '#059669' : '#1c1917' }}>{opt.label}</div>
                <div style={{ fontSize: '12px', color: '#78716c', fontWeight: 500, marginTop: '3px' }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <p style={s.label}>Deposit amount (USDC)</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ flex: 1, background: '#ffffff', border: '1.5px solid #d6cdc3', color: '#1c1917', borderRadius: '10px', padding: '13px 16px', fontSize: '16px', outline: 'none', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}
            />
            <button
              onClick={handleDeposit}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 700, fontSize: '15px', padding: '13px 24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Lock & Deposit
            </button>
          </div>

          <ProjectedEarnings amount={amount} lockDays={lockDays} apy={4.92} />

          {hasShares && (
            <button
              onClick={handleWithdraw}
              style={{
                width: '100%',
                background: isLocked ? 'rgba(220,38,38,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${isLocked ? 'rgba(220,38,38,0.3)' : 'rgba(16,185,129,0.3)'}`,
                color: isLocked ? '#dc2626' : '#10b981',
                fontWeight: 700, fontSize: '15px', padding: '14px',
                borderRadius: '10px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {isLocked ? '⚠️ Withdraw early (4.5% penalty → community)' : '✅ Withdraw (no penalty)'}
            </button>
          )}
        </div>
      )}

      {/* Transaction steps */}
      {(step === 'approving' || step === 'depositing' || step === 'withdrawing' || step === 'claiming') && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: '#faf6f0', borderRadius: '10px', border: '1px solid #e8e0d8' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid #e8e0d8', borderTop: '2px solid #10b981', borderRadius: '50%', margin: '0 auto 16px', animation: 'hf-spin 0.8s linear infinite' }} />
          <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#1c1917', fontWeight: 700, fontSize: '16px', margin: '0 0 4px 0' }}>
            {step === 'approving' ? 'Step 1 of 2 — Approving USDC' : step === 'depositing' ? 'Step 2 of 2 — Locking in vault' : step === 'withdrawing' ? 'Withdrawing funds' : 'Claiming rewards'}
          </p>
          <p style={{ color: '#44403c', fontSize: '14px', fontWeight: 500, margin: 0 }}>Confirm in your wallet</p>
        </div>
      )}

      {/* Success: deposited */}
      {step === 'done' && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#fdf8f3', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#065f46', fontWeight: 800, fontSize: '18px', margin: '0 0 6px 0' }}>Locked for {lockDays} days</p>
          <p style={{ color: '#44403c', fontSize: '14px', fontWeight: 500, margin: '0 0 16px 0' }}>You'll earn yield + a share of every early withdrawal penalty.</p>
          {depositTxHash && <a href={`https://explorer.arc.io/tx/${depositTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Arc Explorer ↗</a>}
          <button onClick={() => { setStep('idle'); setAmount('') }} style={{ background: '#e8e0d8', border: '1px solid #e8e0d8', color: '#1c1917', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Done</button>
        </div>
      )}

      {/* Success: withdrawn */}
      {step === 'withdrawn' && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#fdf8f3', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#065f46', fontWeight: 800, fontSize: '18px', margin: '0 0 16px 0' }}>Withdrawn successfully</p>
          {withdrawTxHash && <a href={`https://explorer.arc.io/tx/${withdrawTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Arc Explorer ↗</a>}
          <button onClick={() => setStep('idle')} style={{ background: '#e8e0d8', border: '1px solid #e8e0d8', color: '#1c1917', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Done</button>
        </div>
      )}

      {/* Success: claimed */}
      {step === 'claimed' && (
        <div style={{ background: 'rgba(28,25,23,0.03)', border: '1px solid #f0ebe3', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px', color: '#fdf8f3', fontWeight: 700 }}>✓</div>
          <p style={{ color: '#1c1917', fontWeight: 600, fontSize: '17px', margin: '0 0 16px 0' }}>Rewards claimed</p>
          {claimTxHash && <a href={`https://explorer.arc.io/tx/${claimTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>View on Arc Explorer ↗</a>}
          <button onClick={() => setStep('idle')} style={{ background: '#e8e0d8', border: '1px solid #e8e0d8', color: '#1c1917', fontWeight: 600, fontSize: '14px', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Done</button>
        </div>
      )}

      {/* Trust & Transparency */}
      <div style={{ marginTop: '24px', borderTop: '1px solid #ede8e1', paddingTop: '20px' }}>
        <p style={s.label}>Where do your funds go?</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            { label: 'Your Wallet', bg: 'rgba(99,102,241,0.12)', color: '#4f46e5' },
            { label: '→', bg: 'transparent', color: '#44403c' },
            { label: 'PledgeVault', bg: 'rgba(28,25,23,0.05)', color: '#1c1917' },
            { label: '→', bg: 'transparent', color: '#44403c' },
            { label: 'Morpho Vault', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
            { label: '→', bg: 'transparent', color: '#44403c' },
            { label: 'Vault Yield', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
          ].map((item, i) => (
            <span key={i} style={{ background: item.bg, color: item.color, fontSize: '13px', fontWeight: 700, padding: item.label === '→' ? '0' : '5px 12px', borderRadius: '8px', border: item.label === '→' ? 'none' : '1px solid rgba(28,25,23,0.05)' }}>
              {item.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {[
            { label: 'PledgeVault contract', href: 'https://explorer.arc.io/address/0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75' },
            { label: 'Morpho vault (Gauntlet USDC Prime)', href: 'https://explorer.arc.io/address/0xdECcd53BE5453215821184824B519E04C7e00bC7' },
            { label: 'Proof of real deposit transaction', href: 'https://explorer.arc.io/tx/0x5d1b3cda3217480047fe9c34e175117f904584fa83a5c3fcfe94867923fc587c' },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>{link.label} ↗</a>
          ))}
        </div>
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ color: '#78350f', fontSize: '13px', fontWeight: 500, margin: 0, lineHeight: 1.7 }}>
            <strong>Risk disclosure:</strong> Pledge is non-custodial. Funds are held by smart contracts, not by us. PledgeVault is unaudited — only deposit what you can afford to lose. Early withdrawal incurs a 4.5% penalty redistributed to other savers.
          </p>
        </div>
      </div>
    </div>
  )
}