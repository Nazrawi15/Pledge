import { useEffect, useState } from 'react'
import {
  getUserPerformance,
  getUserTransactionHistory,
  getUserBalances,
  type UserPerformance,
  type UserHistoryItem,
  type UserBalances,
} from '@yo-protocol/core'
import { apiClient, VAULT_ADDRESS, NETWORK } from '../lib/yo'

export function useUserData(address?: string) {
  const [performance, setPerformance] = useState<UserPerformance | null>(null)
  const [history, setHistory] = useState<UserHistoryItem[]>([])
  const [balances, setBalances] = useState<UserBalances | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    const addr = address as `0x${string}`

    Promise.allSettled([
      getUserPerformance(apiClient, NETWORK, VAULT_ADDRESS, addr).then(setPerformance),
      getUserTransactionHistory(apiClient, NETWORK, VAULT_ADDRESS, addr, 5).then(setHistory),
      getUserBalances(apiClient, addr).then(setBalances),
    ]).finally(() => setLoading(false))
  }, [address])

  return { performance, history, balances, loading }
}