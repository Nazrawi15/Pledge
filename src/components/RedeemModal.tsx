import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { VAULTS } from '../lib/pledge'

const VAULT_ADDRESS = VAULTS.pledgeUSD.address

const VAULT_ABI = [
  { name: 'redeem', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'shares', type: 'uint256' }, { name: 'receiver', type: 'address' }, { name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'previewRedeem', type: 'function', stateMutability: 'view', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

interface RedeemModalProps {
  onClose: () => void
}

export function RedeemModal({ onClose }: RedeemModalProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('input')

  const { data: sharesBalance } = useReadContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'balanceOf', args: [address!], query: { enabled: !!address } })

  const formattedShares = sharesBalance ? (Number(sharesBalance) / 1_000_000).toFixed(6) : '0.000000'
  const sharesNum = parseFloat(formattedShares)
  const amountNum = parseFloat(amount) || 0
  const isValid = amountNum > 0 && amountNum <= sharesNum
  const percentOfBalance = sharesNum > 0 ? Math.min((amountNum / sharesNum) * 100, 100) : 0

  const sharesInUnits = amountNum > 0 ? BigInt(Math.floor(amountNum * 1_000_000)) : BigInt(0)

  const { data: previewData } = useReadContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'previewRedeem', args: [sharesInUnits], query: { enabled: amountNum > 0 } })

  const usdcOut = previewData ? Number(previewData) / 1_000_000 : amountNum
  const yieldEarned = usdcOut - amountNum

  const { writeContract, data: redeemTxHash } = useWriteContract()
  const { isSuccess: redeemSuccess } = useWaitForTransactionReceipt({ hash: redeemTxHash })

  useEffect(() => {
    if (redeemSuccess && step === 'redeeming') setStep('done')
  }, [redeemSuccess])

  function handleRedeem() {
    if (!isValid) return
    setStep('redeeming')
    writeContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'redeem', args: [sharesInUnits, address!, address!] })
  }

  function handleMax() { setAmount(formattedShares) }

  const shortTx = redeemTxHash ? `${redeemTxHash.slice(0, 10)}...${redeemTxHash.slice(-8)}` : ''

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999, backgroundColor: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: '440px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fefcf9', border: '1px solid #e8e0d8', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #ede8e1' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1c1917', margin: 0 }}>Withdraw Savings</h2>
            <p style={{ fontSize: '13px', color: '#44403c', marginTop: '3px', margin: 0 }}>Redeem vault shares back to USDC</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e8e0d8', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#44403c', fontSize: '14px' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {step === 'input' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#faf6f0', border: '1px solid #ede8e1', borderRadius: '10px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#78716c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Available to Withdraw</p>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#1c1917', margin: 0 }}>
                    {formattedShares}{' '}
                    <span style={{ fontSize: '12px', color: '#44403c', fontWeight: 500 }}>shares</span>
                  </p>
                </div>
                <button onClick={handleMax} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e8e0d8', background: 'rgba(28,25,23,0.05)', fontSize: '12px', fontWeight: 600, color: '#1c1917', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Max
                </button>
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#44403c', marginBottom: '8px' }}>Amount to withdraw</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #f0ebe3', borderRadius: '12px', padding: '0 16px', backgroundColor: '#faf6f0' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.000000"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#1c1917', padding: '14px 0' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#44403c', marginLeft: '8px' }}>shares</span>
              </div>

              {amountNum > 0 && sharesNum > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#44403c' }}>Withdrawing</span>
                    <span style={{ fontSize: '12px', color: '#1c1917', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{percentOfBalance.toFixed(1)}% of balance</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#e8e0d8', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${percentOfBalance}%`, backgroundColor: percentOfBalance > 90 ? '#dc2626' : '#10b981', borderRadius: '2px', transition: 'width 0.2s, background 0.2s' }} />
                  </div>
                </div>
              )}

              {amountNum > 0 && amountNum <= sharesNum && (
                <div style={{ marginTop: '14px', border: '1px solid #e8e0d8', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#faf6f0', borderBottom: '1px solid #ede8e1' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#44403c', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Withdrawal Preview</p>
                  </div>
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#44403c' }}>Shares redeemed</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{amountNum.toFixed(6)} shares</span>
                    </div>
                    {yieldEarned > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#44403c' }}>Yield earned</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+${yieldEarned.toFixed(6)}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', backgroundColor: '#ede8e1' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917' }}>You receive</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        ${usdcOut.toFixed(6)}{' '}
                        <span style={{ fontSize: '12px', color: '#78716c', fontWeight: 500 }}>USDC</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {amountNum > sharesNum && sharesNum > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>Amount exceeds your available balance of {formattedShares} shares</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', padding: '10px 12px', backgroundColor: '#faf6f0', borderRadius: '10px', border: '1px solid #ede8e1' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: '12px', color: '#44403c', lineHeight: 1.55, margin: 0 }}>Shares are redeemed 1:1 plus all yield earned. Funds arrive in your wallet instantly.</p>
              </div>

              <button
                onClick={handleRedeem}
                disabled={!isValid}
                style={{ width: '100%', marginTop: '18px', padding: '13px 0', borderRadius: '12px', border: 'none', background: !isValid ? '#e8e0d8' : '#e8e0d8', color: !isValid ? '#a8a29e' : '#ffffff', fontSize: '15px', fontWeight: 600, cursor: !isValid ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.15s' }}
              >
                {isValid ? `Withdraw $${usdcOut.toFixed(2)} USDC` : 'Withdraw USDC'}
              </button>
            </div>
          )}

          {step === 'redeeming' && (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <Spinner />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', marginTop: '18px', marginBottom: '6px' }}>Processing Withdrawal</p>
              <p style={{ fontSize: '14px', color: '#44403c', margin: 0 }}>Confirm the transaction in your wallet</p>
              <p style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>Vault shares are being redeemed to USDC</p>
            </div>
          )}

          {step === 'done' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#059669', marginBottom: '16px', fontWeight: 700 }}>✓</div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#1c1917', marginBottom: '4px' }}>Withdrawal Confirmed</p>
                <p style={{ fontSize: '14px', color: '#44403c' }}>${usdcOut.toFixed(2)} USDC returned to your wallet</p>
              </div>
              {redeemTxHash && (
                <a href={`https://explorer.arc.io/tx/${redeemTxHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#faf6f0', border: '1px solid #e8e0d8', borderRadius: '10px', textDecoration: 'none', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#78716c', marginBottom: '3px' }}>Transaction</p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', color: '#1c1917', fontWeight: 600, margin: 0 }}>{shortTx}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>View on Arc ↗</span>
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

function Spinner() {
  return <div style={{ width: '40px', height: '40px', border: '3px solid #f0ebe3', borderTopColor: '#44403c', borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto' }} />
}