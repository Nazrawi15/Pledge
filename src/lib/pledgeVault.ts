export const PLEDGE_VAULT_ADDRESS = '0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75' as `0x${string}`

export const USDC_ARC = '0x3600000000000000000000000000000000000000' as `0x${string}`

export const PLEDGE_VAULT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "usdcAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "lockDays", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shareAmount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "getUserShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "getPendingReward",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "getTotalEarnedFromPenalties",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "getUserLockPeriod",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "isLocked",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "userAddr", "type": "address" }],
    "name": "getTimeRemaining",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDepositorCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPenaltyCollected",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "usdcAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lockDays", "type": "uint256" }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "usdcAmount", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "early", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "penaltyShares", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "penaltyShares", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "remainingStakers", "type": "uint256" }
    ],
    "name": "PenaltyDistributed",
    "type": "event"
  }
] as const