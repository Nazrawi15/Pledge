import { useReadContract, useReadContracts } from 'wagmi'
import { useState } from 'react'

const PLEDGE_VAULT = '0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75' as const

const VAULT_ABI = [
  { name: 'getDepositorCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'depositors', type: 'function', stateMutability: 'view', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ type: 'address' }] },
  {
    name: 'users', type: 'function', stateMutability: 'view', inputs: [{ name: 'addr', type: 'address' }],
    outputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'depositTime', type: 'uint256' },
      { name: 'lockPeriod', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' },
      { name: 'earnedFromPenalties', type: 'uint256' },
    ],
  },
  { name: 'getPendingReward', type: 'function', stateMutability: 'view', inputs: [{ name: 'userAddr', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'totalPenaltyCollected', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalShares', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'isLocked', type: 'function', stateMutability: 'view', inputs: [{ name: 'userAddr', type: 'address' }], outputs: [{ type: 'bool' }] },
] as const

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatShares(raw: bigint) {
  return (Number(raw) / 1e6).toFixed(4)
}

function lockColor(lockPeriod: bigint) {
  const days = Number(lockPeriod) / 86400
  if (days >= 90) {
    return { bg: '#d1fae5', color: '#059669', label: '90d' }
  }
  if (days >= 60) {
    return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', label: '60d' }
  }
  return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '30d' }
}

type Tab = 'patient' | 'earners'

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('patient')

  const depositorCountQuery = useReadContract({ address: PLEDGE_VAULT, abi: VAULT_ABI, functionName: 'getDepositorCount' })
  const depositorCount = depositorCountQuery.data

  const totalPenaltyQuery = useReadContract({ address: PLEDGE_VAULT, abi: VAULT_ABI, functionName: 'totalPenaltyCollected' })
  const totalPenalty = totalPenaltyQuery.data

  const totalSharesQuery = useReadContract({ address: PLEDGE_VAULT, abi: VAULT_ABI, functionName: 'totalShares' })
  const totalShares = totalSharesQuery.data

  const count = depositorCount ? Number(depositorCount) : 0

  const depositorCalls = Array.from({ length: count }, function (_unused, i) {
    return {
      address: PLEDGE_VAULT as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'depositors' as const,
      args: [BigInt(i)] as const,
    }
  })

  const depositorAddressesQuery = useReadContracts({ contracts: depositorCalls, query: { enabled: count > 0 } })
  const depositorAddresses = depositorAddressesQuery.data

  const addressList: `0x${string}`[] = []
  if (depositorAddresses) {
    for (let i = 0; i < depositorAddresses.length; i++) {
      const r = depositorAddresses[i].result as `0x${string}` | undefined
      if (r) {
        addressList.push(r)
      }
    }
  }
  const addresses = addressList

  const userInfoCalls: any[] = []
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i]
    userInfoCalls.push({ address: PLEDGE_VAULT as `0x${string}`, abi: VAULT_ABI, functionName: 'users' as const, args: [addr] as const })
    userInfoCalls.push({ address: PLEDGE_VAULT as `0x${string}`, abi: VAULT_ABI, functionName: 'getPendingReward' as const, args: [addr] as const })
    userInfoCalls.push({ address: PLEDGE_VAULT as `0x${string}`, abi: VAULT_ABI, functionName: 'isLocked' as const, args: [addr] as const })
  }

  const userInfoResultsQuery = useReadContracts({ contracts: userInfoCalls, query: { enabled: addresses.length > 0 } })
  const userInfoResults = userInfoResultsQuery.data

  type Entry = {
    address: string
    shares: bigint
    lockPeriod: bigint
    earnedFromPenalties: bigint
    pendingReward: bigint
    totalEarned: bigint
    isLocked: boolean
  }

  const entries: Entry[] = []
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i]
    const userRaw = userInfoResults && userInfoResults[i * 3] ? (userInfoResults[i * 3].result as [bigint, bigint, bigint, bigint, bigint] | undefined) : undefined
    const pending = userInfoResults && userInfoResults[i * 3 + 1] ? (userInfoResults[i * 3 + 1].result as bigint | undefined) : undefined
    const locked = userInfoResults && userInfoResults[i * 3 + 2] ? (userInfoResults[i * 3 + 2].result as boolean | undefined) : undefined

    if (!userRaw) continue

    const shares = userRaw[0]
    const lockPeriod = userRaw[2]
    const earnedFromPenalties = userRaw[4]
    const pendingReward = pending ? pending : BigInt(0)

    entries.push({
      address: addr,
      shares: shares,
      lockPeriod: lockPeriod,
      earnedFromPenalties: earnedFromPenalties,
      pendingReward: pendingReward,
      totalEarned: earnedFromPenalties + pendingReward,
      isLocked: locked ? locked : false,
    })
  }

  const patientLeaders = entries
    .filter(function (e) { return e.shares > BigInt(0) })
    .slice()
    .sort(function (a, b) {
      const lockDiff = Number(b.lockPeriod) - Number(a.lockPeriod)
      if (lockDiff !== 0) return lockDiff
      return Number(b.shares - a.shares)
    })
    .slice(0, 10)

  const earnerLeaders = entries
    .filter(function (e) { return e.totalEarned > BigInt(0) })
    .slice()
    .sort(function (a, b) { return Number(b.totalEarned - a.totalEarned) })
    .slice(0, 10)

  const loading = count > 0 && addresses.length === 0
  const empty = !loading && entries.length === 0

  const totalPenaltyFormatted = totalPenalty ? (Number(totalPenalty) / 1e6).toFixed(4) : '0'
  const totalSharesFormatted = totalShares ? (Number(totalShares) / 1e6).toFixed(2) : '0'

  const medals = ['1st', '2nd', '3rd']
  const activeList = activeTab === 'patient' ? patientLeaders : earnerLeaders

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e8e0d8' }}>
        <div>
          <h2 className="serif" style={{ fontSize: '30px', color: '#1c1917', fontWeight: 400, marginBottom: '6px', letterSpacing: '-0.5px' }}>Leaderboard</h2>
          <p style={{ fontSize: '15px', color: '#44403c', fontWeight: 500 }}>On-chain rankings from PledgeVault, Arc Mainnet</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{count}</div>
          <div className="section-label" style={{ marginTop: '3px' }}>SAVERS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '18px', backgroundColor: '#faf6f0', borderRadius: '12px', border: '1px solid #e8e0d8' }}>
          <p className="section-label" style={{ marginBottom: '8px' }}>Total Savers</p>
          <p style={{ fontSize: '19px', color: '#1c1917', fontWeight: 800, marginBottom: '4px', fontFamily: "'DM Mono', monospace" }}>{count}</p>
          <p style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>on Arc mainnet</p>
        </div>
        <div style={{ padding: '18px', backgroundColor: '#faf6f0', borderRadius: '12px', border: '1px solid #e8e0d8' }}>
          <p className="section-label" style={{ marginBottom: '8px' }}>Total Penalties Paid</p>
          <p style={{ fontSize: '19px', color: '#1c1917', fontWeight: 800, marginBottom: '4px', fontFamily: "'DM Mono', monospace" }}>{totalPenaltyFormatted} shares</p>
          <p style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>redistributed to savers</p>
        </div>
        <div style={{ padding: '18px', backgroundColor: '#faf6f0', borderRadius: '12px', border: '1px solid #e8e0d8' }}>
          <p className="section-label" style={{ marginBottom: '8px' }}>Total Locked</p>
          <p style={{ fontSize: '19px', color: '#1c1917', fontWeight: 800, marginBottom: '4px', fontFamily: "'DM Mono', monospace" }}>{totalSharesFormatted} shares</p>
          <p style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>earning vault yield</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', backgroundColor: '#f0ebe3', borderRadius: '10px', padding: '4px', border: '1px solid #e8e0d8' }}>
        <button onClick={function () { setActiveTab('patient') }} style={{ flex: 1, padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === 'patient' ? 700 : 500, fontFamily: "'Plus Jakarta Sans', sans-serif", background: activeTab === 'patient' ? '#1c1917' : 'transparent', color: activeTab === 'patient' ? '#fdf8f3' : '#44403c' }}>
          Most Patient Savers
        </button>
        <button onClick={function () { setActiveTab('earners') }} style={{ flex: 1, padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === 'earners' ? 700 : 500, fontFamily: "'Plus Jakarta Sans', sans-serif", background: activeTab === 'earners' ? '#1c1917' : 'transparent', color: activeTab === 'earners' ? '#fdf8f3' : '#44403c' }}>
          Top Penalty Earners
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #f0ebe3', borderTopColor: '#10b981', borderRadius: '50%', animation: 'hf-spin 0.75s linear infinite', margin: '0 auto 12px' }} />
          <style>{'@keyframes hf-spin { to { transform: rotate(360deg); } }'}</style>
          <p style={{ fontSize: '15px', color: '#78716c', fontWeight: 500 }}>Reading on-chain data</p>
        </div>
      ) : null}

      {empty && !loading ? (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'rgba(28,25,23,0.03)', borderRadius: '10px', border: '1px solid #e8e0d8' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>No savers yet</p>
          <p style={{ fontSize: '14px', color: '#78716c', fontWeight: 500 }}>Be the first to lock in PledgeVault and claim the top spot.</p>
        </div>
      ) : null}

      {!loading && !empty ? (
        <div style={{ border: '1px solid #e8e0d8', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 120px', padding: '12px 18px', backgroundColor: '#faf6f0', borderBottom: '1px solid #e8e0d8' }}>
            <p className="section-label" style={{ margin: 0 }}>Rank</p>
            <p className="section-label" style={{ margin: 0 }}>Address</p>
            <p className="section-label" style={{ margin: 0 }}>{activeTab === 'patient' ? 'Locked' : 'Total Earned'}</p>
            <p className="section-label" style={{ margin: 0 }}>Lock</p>
            <p className="section-label" style={{ margin: 0 }}>Status</p>
          </div>

          {activeList.map(function (entry, i) {
            const lock = lockColor(entry.lockPeriod)
            const rankLabel = i < 3 ? medals[i] : String(i + 1)
            const shareLabel = activeTab === 'patient' ? formatShares(entry.shares) + ' shares' : formatShares(entry.totalEarned) + ' shares'
            const explorerLink = 'https://explorer.arc.io/address/' + entry.address
            const rowBorder = i < activeList.length - 1 ? '1px solid #f0ebe3' : 'none'
            const rowBg = i === 0 ? 'rgba(251,191,36,0.06)' : 'transparent'

            return (
              <div key={entry.address} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 120px', padding: '16px 18px', borderBottom: rowBorder, backgroundColor: rowBg, alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{rankLabel}</span>
                <a href={explorerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#1c1917', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, textDecoration: 'none' }}>
                  {shortAddr(entry.address)}
                </a>
                <span style={{ fontSize: '14px', color: '#1c1917', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                  {shareLabel}
                </span>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: lock.bg, color: lock.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {lock.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: entry.isLocked ? '#059669' : '#78716c', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entry.isLocked ? '#10b981' : '#c8bdb0', display: 'inline-block' }} />
                  {entry.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            )
          })}
        </div>
      ) : null}

      <p style={{ fontSize: '13px', color: '#78716c', fontWeight: 500, marginTop: '12px', textAlign: 'center' }}>
        All data read directly from PledgeVault on Arc. Updates on every block.
      </p>
    </div>
  )
}