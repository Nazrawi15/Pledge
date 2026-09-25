export type VaultKey = 'pledgeUSD'

export const VAULTS: Record<VaultKey, { address: `0x${string}`; label: string; asset: string; symbol: string; flag: string; description: string }> = {
  pledgeUSD: {
    address: '0xdECcd53BE5453215821184824B519E04C7e00bC7',
    label: 'Gauntlet USDC Prime',
    asset: 'USDC',
    symbol: 'pUSD',
    flag: '💵',
    description: 'USDC deposited into a Morpho vault curated by Gauntlet, live on Arc mainnet.',
  },
}

export const ARC_CHAIN_ID = 5042
export const ARC_USDC = '0x3600000000000000000000000000000000000000' as `0x${string}`