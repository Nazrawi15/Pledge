# 🔒 HoldFirm — Save in Dollars. Earn from the Impatient.

> *"A behavioral finance protocol where impatient users subsidize patient savers."*

**Live App:** https://holdfirm.vercel.app  
**Contract:** https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a  
**Chain:** Base Mainnet  
**Built for:** YO Protocol "Hack with YO" Hackathon  

---

## The Problem

1.4 billion people live in countries where inflation runs above 10% per year.

In Turkey, inflation hit 65%. In Argentina, 211%. In Nigeria, 29%. In Egypt, 35%.

These people work hard. They save money. And then they watch it disappear — not because of bad decisions, but because of the currency they were born into.

They don't need another bank. They need a way to **opt out of inflation entirely.**

But there's a second problem nobody talks about: **savings discipline.**

Even when people find a good savings product, they withdraw early. An emergency happens. A temptation arrives. Discipline breaks. The savings plan fails.

**HoldFirm solves both problems at once.**

---

## The Solution

HoldFirm is a DeFi savings app for high-inflation economies, built on Base and powered by YO Protocol.

It does two things no other savings app does together:

1. **Save in USDC or EURC** — dollar or euro denominated, inflation-proof, earning real yield via YO Protocol
2. **Earn from impatient users** — our onchain DisciplineVault redistributes early withdrawal penalties to committed savers

**DisciplineVault is a behavioral finance primitive where impatient users subsidize patient savers while all funds earn YO yield.**

When you lock for 30, 60, or 90 days, you don't just earn APY. You earn a share of every penalty paid by people who broke their commitment. **Patience is financially rewarded.**

---

## How It Works

### The Flow
```
User deposits USDC
       ↓
DisciplineVault (our smart contract)
       ↓
YO Protocol yoUSD Vault (earning ~4.92% APY)
       ↓
yoUSD shares held by contract — earning yield every block
       ↓
Early withdrawal? → 4.5% penalty → distributed to locked savers
On-time withdrawal? → full principal + YO yield + penalty rewards
```

Every locked dollar earns **two streams simultaneously**: YO Protocol APY + a share of penalties from everyone who gave up early.

### The Behavioral Economics
- Lock for 30/60/90 days → commit publicly onchain
- Early withdrawal = 4.5% penalty → redistributed proportionally to everyone who stayed
- The longer you lock, the more you benefit from others' impatience
- Every early withdrawal makes the vault **more valuable** for those who stayed
- This creates a self-reinforcing commitment mechanism with no admin, no cron job, no manual step

---

## Features

### 🤖 AI Onboarding Wizard
4 questions. Personalized savings strategy powered by Groq (Llama 3.3 70B).
- Where are you from? (12 high-inflation countries)
- Have you lost money to inflation?
- What's your savings goal?
- How long can you commit?

The AI generates a warm, personal, actionable recommendation — telling you exactly which HoldFirm mode fits your situation and why.

### 💰 NestSave
Flexible USDC or EURC savings earning live APY via YO Protocol. Switch between Dollar Savings (yoUSD) and Euro Savings (yoEUR) with a live vault selector. View your balance in your local currency in real time. 30-day APY history chart updates automatically as you switch vaults.

### 🏦 DisciplineVault ⭐ Core Innovation
Our custom smart contract deployed on Base mainnet. The only savings vault that pays you for other people's impatience.

- Lock USDC for 30, 60, or 90 days
- Funds forwarded internally to YO Protocol yoUSD vault, earning yield
- Early withdrawal: 4.5% penalty automatically redistributed to all committed savers
- On-time withdrawal: full principal + YO yield + share of all penalties collected
- Penalty pool visible in real time
- Claim rewards anytime with one click

### 🏆 Leaderboard
On-chain rankings read directly from DisciplineVault on Base. Two views:
- **Most Patient Savers** — ranked by lock period and shares
- **Top Penalty Earners** — ranked by total penalties accumulated

Every address links to Basescan. Updates every block. No backend.

---

## YO Protocol SDK Integration

HoldFirm uses **11 YO Protocol SDK methods** — the deepest integration in this hackathon.

| Method | Source | Where Used | Purpose |
|--------|--------|-----------|---------|
| `YieldProvider` | `@yo-protocol/react` | `main.tsx` | Wraps entire app, provides context |
| `useVaults` | `@yo-protocol/react` | `useYoVault.ts` | Live APY + TVL for both vaults |
| `useVaultState` | `@yo-protocol/react` | `useYoVault.ts` | User balance and shares |
| `useVaultHistory` | `@yo-protocol/react` | `useVaultHistory.ts` | 30-day APY history for chart |
| `usePreviewDeposit` | `@yo-protocol/react` | `DepositModal.tsx` | Preview shares before depositing |
| `usePreviewRedeem` | `@yo-protocol/react` | `RedeemModal.tsx` | Preview exact USDC before withdrawing |
| `useDeposit` | `@yo-protocol/react` | `DepositModal.tsx` | Execute deposit transaction |
| `useRedeem` | `@yo-protocol/react` | `RedeemModal.tsx` | Execute withdraw transaction |
| `useApprove` | `@yo-protocol/react` | `DepositModal.tsx` | Approve USDC/EURC spending |
| `createApiClient` | `@yo-protocol/core` | `lib/yo.ts` | Initialize API connection |
| `API_BASE_URL` | `@yo-protocol/core` | `lib/yo.ts` | Base URL constant |

**Vaults:**
- yoUSD: `0x0000000f2eb9f69274678c76222b35eec7588a65` (Dollar Savings)
- yoEUR: `0x50c749ae210d3977adc824ae11f3c7fd10c871e9` (Euro Savings)

Both vaults are live with real deposits flowing through YO Protocol on Base Mainnet.

---

## Smart Contract: DisciplineVault

**Address:** `0x85E535Af5663426D38461B2e74d34FafA8a7472a`  
**Network:** Base Mainnet  
**Verified:** https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a

### Key Functions
```solidity
// Deposit USDC with chosen lock period (30, 60, or 90 days)
function deposit(uint256 usdcAmount, uint256 lockDays) external

// Withdraw — 4.5% penalty applied if before lock period ends
function withdraw(uint256 shareAmount) external

// Claim accumulated penalty rewards from early withdrawers
function claimRewards() external

// View functions
function getPendingReward(address user) external view returns (uint256)
function isLocked(address user) external view returns (bool)
function getDepositorCount() external view returns (uint256)
function totalPenaltyCollected() external view returns (uint256)
function totalShares() external view returns (uint256)
```

### Penalty Distribution: How `accRewardPerShare` Works

The contract uses a **reward-per-share accumulator** — the same battle-tested algorithm used by Synthetix and SushiSwap.

**Step 1 — Early withdrawer triggers `withdraw()`:**
```solidity
uint256 penalty = (shareAmount * 45) / 1000; // 4.5% of their shares
accRewardPerShare += (penalty * 1e18) / (totalShares - shareAmount);
```

**Step 2 — Patient saver checks reward via `getPendingReward()`:**
```solidity
pending = (userShares * accRewardPerShare / 1e18) - rewardDebt[user];
```

**Step 3 — Patient saver calls `claimRewards()`:**
```solidity
rewardDebt[msg.sender] = (userShares * accRewardPerShare) / 1e18;
// yoUSD shares transferred to user
```

**Why this design is powerful:**
- O(1) gas — distribution costs the same for 5 or 5,000 savers
- Fully automatic — no admin, no cron job, no manual step
- Triggered instantly inside the same transaction as the early withdrawal
- Every early withdrawal makes the vault more valuable for everyone who stayed

---

## Real Transactions (Mainnet Proof)

| Type | TX Hash | Status |
|------|---------|--------|
| Contract Deploy | [View on Basescan](https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a) | ✅ Live |
| Real Deposit | [0xba6c88...](https://basescan.org/tx/0xba6c889a70eed58fe7c6440e77804f2ad2824503868745f19576261d36e52b9f) | ✅ Confirmed |
| Early Withdrawal (penalty fired) | [0xda489d...](https://basescan.org/tx/0xda489d902b14efc98ac202487cbcd85c0ed220a6e0295dc656284f652c3bcafb) | ✅ Confirmed |

### What the early withdrawal TX proves:
- `0.044599 yoUSD` shares burned from the vault
- `0.047753 USDC` returned to the user
- The difference (`0.0021 yoUSD`) remained in the penalty pool as rewards for committed savers
- `accRewardPerShare` updated automatically in the same transaction
- No admin involvement. Pure smart contract logic.

The full deposit → withdrawal → penalty redistribution cycle has been **proven on Base mainnet with real funds.**

---

## Trust & Transparency

**Where do funds go?**
```
Your Wallet → DisciplineVault → YO Protocol yoUSD Vault → yoUSD Yield
```

**Security model:**
- Non-custodial — funds held by smart contract, not by HoldFirm
- No admin keys — contract has no owner functions
- No upgradeability — immutable, what you see is what runs forever
- Penalty enforcement is pure Solidity — cannot be bypassed or modified
- Leaderboard reads directly from contract — no backend, no database

**Risk Disclosure:**
DisciplineVault is unaudited — only deposit what you can afford to lose. YO Protocol vault risk applies. Early withdrawal incurs a 4.5% penalty redistributed to committed savers.

**Contracts:**
- DisciplineVault: `0x85E535Af5663426D38461B2e74d34FafA8a7472a`
- YO yoUSD Vault: `0x0000000f2eb9f69274678c76222b35eec7588a65`
- YO yoEUR Vault: `0x50c749ae210d3977adc824ae11f3c7fd10c871e9`
- USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- EURC on Base: `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v3 + Inline styles |
| Wallet | RainbowKit + wagmi + viem |
| Blockchain | Base Mainnet |
| Savings Protocol | YO Protocol (@yo-protocol/core + @yo-protocol/react) |
| Smart Contract | Solidity 0.8.28 + Hardhat |
| AI Wizard | Groq API (Llama 3.3 70B) |
| Exchange Rates | open.er-api.com |
| Deployment | Vercel |

---

## Supported Currencies

| Country | Currency | Inflation |
|---------|----------|-----------|
| 🇹🇷 Turkey | TRY | 65% |
| 🇦🇷 Argentina | ARS | 211% |
| 🇳🇬 Nigeria | NGN | 28.9% |
| 🇵🇰 Pakistan | PKR | 29% |
| 🇪🇬 Egypt | EGP | 35% |
| 🇬🇭 Ghana | GHS | 23% |
| 🇪🇹 Ethiopia | ETB | 30.2% |
| 🇺🇦 Ukraine | UAH | 26.6% |
| 🇮🇩 Indonesia | IDR | 2.8% |
| 🇷🇴 Romania | RON | 10.4% |
| 🇬🇪 Georgia | GEL | 9.5% |
| 🇦🇴 Angola | AOA | 20% |

> Don't see your country? Select any high-inflation currency — the math works the same way.

---

## Why HoldFirm Wins

**UX Simplicity (30%):** Connect wallet → AI wizard → personalized strategy → one-click deposit. No KYC. No sign-up. Works in 60 seconds. Fully localized — see your balance in TRY, ARS, NGN, and 9 other currencies in real time.

**Creativity & Growth Potential (30%):** First DeFi savings app that pays committed savers from impatient users' penalties. Behavioral finance meets DeFi. 1.4 billion addressable users. Onchain leaderboard creates social competition and retention. yoUSD + yoEUR dual-vault gives access to both dollar and euro savings in one app.

**Integration Quality (20%):** 11 YO SDK methods used across the full deposit/withdraw/preview/history lifecycle. Real funds flowing through both yoUSD and yoEUR vaults onchain. Live APY, TVL, and 30-day APY history chart powered entirely by the YO SDK.

**Risk & Trust (20%):** Full fund flow transparency. Two real TX proofs on mainnet — deposit AND early withdrawal with penalty redistribution confirmed. Contract verified on Basescan. Non-custodial. No admin keys. No backend — leaderboard reads directly from the contract.

---

## Roadmap (v2)

- **NFT Lock Positions** — each DisciplineVault deposit mints an NFT representing your locked position. Tradeable on secondary markets. Adds liquidity to locked capital without breaking commitment.
- **Multi-asset vaults** — lock ETH, cbBTC alongside USDC
- **Cross-chain** — deploy on Optimism, Arbitrum
- **Mobile app** — React Native with biometric savings reminders

---

## Local Development
```bash
git clone https://github.com/Nazrawi15/holdfirm
cd holdfirm
npm install --legacy-peer-deps
cp .env.example .env  # add your keys
npm run dev
```

**Required env variables:**
```
VITE_WALLETCONNECT_PROJECT_ID=
VITE_GROQ_API_KEY=
VITE_DISCIPLINE_VAULT_MAINNET=0x85E535Af5663426D38461B2e74d34FafA8a7472a
```

---

*Built with 🔒 by Nazrawi15 for the YO Protocol Hackathon 2026*
