import { useAccount, useReadContract } from 'wagmi'
import { ARC_USDC } from '../lib/pledge'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

export function useUSDCBalance() {
  const { address } = useAccount()

  const { data: balance } = useReadContract({
    address: ARC_USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  })

  const formatted = balance
    ? (Number(balance) / 1_000_000).toFixed(2)
    : '0.00'

  return { formatted }
}