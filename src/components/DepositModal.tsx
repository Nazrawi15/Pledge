import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { recordSavingToday } from './SavingsStreak'
import { VAULTS, ARC_USDC } from '../lib/pledge'
import type { VaultKey } from '../lib/pledge'

const ERC20_ABI = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
] as const

const VAULT_ABI = [
  { name: 'deposit', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

interface DepositModalProps {
  onClose: () => void
  apy?: number
  vaultKey?: VaultKey
}

export function DepositModal({ onClose, apy = 0, vaultKey = 'pledgeUSD' }: DepositModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('input')

  const vault = VAULTS[vaultKey]
  const assetAddress = ARC_USDC
  const assetSymbol = vault.asset
  const vaultAddress = vault.address
  const accentColor = '#10b981'
  const accentBg = 'rgba(16,185,129,0.08)'
  const accentBorder = 'rgba(16,185,129,0.25)'

  const { writeContract, data: approveTxHash } = useWriteContract()
  const { writeContract: writeDeposit, data: depositTxHash } = useWriteContract()
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash })

  const amountNum = parseFloat(amount) || 0
  const yearlyYield = amountNum * (apy / 100)
  const monthlyYield = yearlyYield / 12

  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      setStep('depositing')
      const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
      writeDeposit({ address: vaultAddress, abi: VAULT_ABI, functionName: 'deposit', args: [amountInUnits, address!] })
    }
  }, [approveSuccess])

  useEffect(() => {
    if (depositSuccess && step === 'depositing') { setStep('done'); recordSavingToday() }
  }, [depositSuccess])

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) return
    setStep('approving')
    const amountInUnits = BigInt(Math.floor(Number(amount) * 1_000_000))
    writeContract({ address: assetAddress, abi: ERC20_ABI, functionName: 'approve', args: [vaultAddress, amountInUnits] })
  }

  const shortTx = depositTxHash ? `${depositTxHash.slice(0, 10)}...${depositTxHash.slice(-8)}` : ''

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999, backgroundColor: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: '440px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fefcf9', border: '1px solid #e8e0d8', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #ede8e1' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '18px' }}>{vault.flag}</span>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1c1917', margin: 0 }}>Deposit {assetSymbol}</h2>
            </div>
            <p style={{ fontSize: '13px', color: '#44403c', margin: 0 }}>Earn via Morpho · {vault.label} · Arc</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e8e0d8', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#44403c', fontSize: '14px' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {step === 'input' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '8px' }}>Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid #f0ebe3`, borderRadius: '12px', padding: '0 16px', backgroundColor: '#faf6f0' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#1c1917', padding: '14px 0' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#44403c', marginLeft: '8px' }}>{assetSymbol}</span>
              </div>

              {amountNum > 0 && apy > 0 && (
                <div style={{ marginTop: '14px', padding: '14px 16px', backgroundColor: accentBg, border: `1px solid ${accentBorder}`, borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Projected Earnings</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#44403c', marginBottom: '3px' }}>Monthly</p>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: accentColor, margin: 0 }}>+${monthlyYield.toFixed(4)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#44403c', marginBottom: '3px' }}>Yearly</p>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: accentColor, margin: 0 }}>+${yearlyYield.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', padding: '10px 12px', backgroundColor: '#faf6f0', borderRadius: '10px', border: '1px solid #ede8e1' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: '12px', color: '#44403c', lineHeight: 1.55, margin: 0 }}>
                  Non-custodial. Your {assetSymbol} goes directly to the Morpho {vault.label} vault on Arc. Withdraw anytime.
                </p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={!amount || amountNum <= 0}
                style={{ width: '100%', marginTop: '18px', padding: '13px 0', borderRadius: '12px', border: 'none', background: !amount || amountNum <= 0 ? '#e8e0d8' : accentColor, color: !amount || amountNum <= 0 ? '#a8a29e' : '#fdf8f3', fontSize: '15px', fontWeight: 700, cursor: !amount || amountNum <= 0 ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.15s' }}
              >
                Deposit {assetSymbol}
              </button>
            </div>
          )}

          {step === 'approving' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <StepIndicator current={1} total={2} color={accentColor} />
              <Spinner color={accentColor} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginTop: '18px', marginBottom: '6px' }}>Approving {assetSymbol}</p>
              <p style={{ fontSize: '14px', color: '#44403c', margin: 0 }}>Confirm the approval in your wallet</p>
              <p style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>This lets the vault access your {assetSymbol}</p>
            </div>
          )}

          {step === 'depositing' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <StepIndicator current={2} total={2} color={accentColor} />
              <Spinner color={accentColor} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginTop: '18px', marginBottom: '6px' }}>Depositing into {vault.label}</p>
              <p style={{ fontSize: '14px', color: '#44403c', margin: 0 }}>Confirm the deposit in your wallet</p>
              <p style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>Your {assetSymbol} is being forwarded to the vault</p>
            </div>
          )}

          {step === 'done' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: accentBg, border: `2px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: accentColor, marginBottom: '16px', fontWeight: 700 }}>✓</div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#1c1917', marginBottom: '4px' }}>Deposit Confirmed</p>
                <p style={{ fontSize: '14px', color: '#44403c' }}>{vault.flag} Your {assetSymbol} is now earning yield</p>
              </div>
              {depositTxHash && (
                <a href={`https://explorer.arc.io/tx/${depositTxHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#faf6f0', border: '1px solid #e8e0d8', borderRadius: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#78716c', marginBottom: '3px' }}>Transaction</p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', color: '#1c1917', fontWeight: 600, margin: 0 }}>{shortTx}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: accentColor, fontWeight: 600 }}>View on Arc ↗</span>
                </a>
              )}
              <button onClick={onClose} style={{ width: '100%', padding: '13px 0', borderRadius: '12px', border: '1px solid #e8e0d8', background: 'transparent', color: '#1c1917', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Spinner({ color = '#10b981' }: { color?: string }) {
  return <div style={{ width: '40px', height: '40px', border: '3px solid #f0ebe3', borderTopColor: color, borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto' }} />
}

function StepIndicator({ current, total, color = '#10b981' }: { current: number; total: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, backgroundColor: i < current ? color : '#e8e0d8', color: i < current ? '#fdf8f3' : '#a8a29e', transition: 'background 0.2s' }}>
            {i < current - 1 ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div style={{ width: '28px', height: '2px', backgroundColor: i < current - 1 ? color : '#f0ebe3', borderRadius: '2px' }} />}
        </div>
      ))}
    </div>
  )
}