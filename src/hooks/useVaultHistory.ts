import type { VaultKey } from '../lib/pledge'

export interface APYDataPoint {
  date: string
  apy: number
}

export function useVaultHistory(_vaultKey: VaultKey = 'pledgeUSD') {
  return { data: [] as APYDataPoint[], loading: false }
}