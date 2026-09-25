import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { VAULTS } from '../lib/pledge'
import type { VaultKey } from '../lib/pledge'

const VAULT_ABI = [
  {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface VaultData {
  apy: string
  tvl: string
  loading: boolean
}

export function useVaultStats(vaultKey: VaultKey = 'pledgeUSD'): VaultData {
  const vault = VAULTS[vaultKey]

  const { data: totalAssets, isLoading: tvlLoading } = useReadContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
  })

  const tvl = totalAssets
    ? (Number(totalAssets) / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : '0'

  return { apy: '—', tvl, loading: tvlLoading }
}

export function useAllVaults() {
  const usd = useVaultStats('pledgeUSD')
  return { pledgeUSD: usd }
}