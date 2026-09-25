import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

export const arc = defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' },
  },
})

export const config = getDefaultConfig({
  appName: 'Pledge',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [arc],
  ssr: false,
})