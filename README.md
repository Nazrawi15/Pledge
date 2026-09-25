🤝 Pledge

Save in USDC. Stay committed. Earn from early withdrawals.

Pledge is a DeFi savings app built on Arc Mainnet.

The idea is simple:

You deposit USDC.
You choose a 30, 60, or 90 day lock.
Your funds are routed through a Morpho vault.
If someone withdraws early, they pay a 4.5% penalty.
That penalty is shared between users who are still locked.

So instead of early withdrawals only hurting the saver, they also create a reward for people who stay.

Live app: https://pledgearc.vercel.app

Smart contract:
https://explorer.arc.io/address/0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75

Network: Arc Mainnet

Built for: Circle Arc Microgrants — DoraHacks

Why I built this

Saving money is already difficult.

In countries with high inflation, saving in the local currency can make that problem even worse. USDC gives people a dollar-denominated way to hold savings, but there is another problem:

people still withdraw too early.

Maybe there is an emergency. Maybe they see something they want to buy. Maybe they simply change their mind.

I wanted to test a different idea:

What if staying locked became more valuable when other people broke their commitment?

That's what Pledge does.

How it works
User
  ↓
Deposits USDC
  ↓
PledgeVault
  ↓
Morpho Gauntlet USDC Prime
  ↓
Vault returns depend on Morpho

There are two ways a user can leave:

Early withdrawal

Withdraw before the lock ends:

4.5% penalty

The penalty is added to a reward pool and allocated to users who are still participating.

On-time withdrawal

Wait until the lock ends:

principal + vault returns + earned penalty rewards

The whole process happens onchain through the PledgeVault contract.

The main contract
PledgeVault

Address

0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75

Arc Explorer

https://explorer.arc.io/address/0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75

The contract supports:

30 day locks
60 day locks
90 day locks
4.5% early withdrawal penalty
penalty rewards for active savers
reward claiming
onchain depositor tracking

The contract is deployed and verified on Arc Mainnet.

How the penalty rewards work

Pledge uses a reward-per-share accumulator.

When someone withdraws early, the contract calculates the penalty and increases the reward available per remaining share.

For example:

uint256 penalty = (shareAmount * 45) / 1000;

accRewardPerShare +=
    (penalty * 1e18) /
    (totalShares - shareAmount);

A user can then check their pending reward:

pending =
    (userShares * accRewardPerShare / 1e18)
    - rewardDebt[user];

This means the contract does not have to loop through every depositor when a penalty happens.

Distribution stays O(1).

That's important because the number of users can grow without making every withdrawal increasingly expensive.

What is actually onchain

The important parts of Pledge do not depend on a backend.

The contract handles:

deposits
lock periods
withdrawals
penalties
reward accounting
reward claims

The leaderboard also reads data directly from the contract.

Wallet addresses link back to the Arc explorer.

Morpho integration

Pledge currently routes its locked USDC through:

Gauntlet USDC Prime

Morpho vault:

0xdECcd53BE5453215821184824B519E04C7e00bC7

https://app.morpho.org/arc/vault/0xdECcd53BE5453215821184824B519E04C7e00bC7

Pledge does not control the Morpho vault.

The return on this part of the system depends on the underlying Morpho vault and can change over time.

That means Pledge does not promise a fixed APY.

Why Arc?

I chose Arc because the product is built around USDC.

Arc uses USDC as its native gas asset, so users don't need to keep a separate volatile token just to pay transaction fees.

Arc also provides sub-second finality, which is useful for a savings app where users expect transactions to settle quickly.

Main features
💰 PledgeVault

The main savings product.

Choose a lock period, deposit USDC, and earn from:

Morpho vault returns
penalties from users who withdraw early
🏦 NestSave

A more flexible USDC savings option for users who don't want to lock funds.

The app also shows an estimated local-currency value so users can understand what their USDC balance is worth in their own currency.

🤖 AI onboarding

Pledge also has a small onboarding flow powered by Groq.

It asks a few questions about:

where the user is from
inflation experience
savings goal
how long they can commit

The idea is to make the first interaction less confusing for someone who has never used DeFi before.

🏆 Leaderboard

The leaderboard shows onchain activity from PledgeVault.

Current views include:

Most Patient Savers
Top Penalty Earners

No separate database is required for the leaderboard data.

Real Arc Mainnet transactions

This isn't just a UI demo.

The main contract is live on Arc Mainnet, and the deposit/withdrawal flow has been tested with real funds.

Contract

https://explorer.arc.io/address/0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75

Deposit

https://explorer.arc.io/tx/0x5d1b3cda3217480047fe9c34e175117f904584fa83a5c3fcfe94867923fc587c

Early withdrawal

https://explorer.arc.io/tx/0xefb6aa15274f85985f4ea4b8ff522bf2855a83998bf99a6010064f13d805a057

The early withdrawal transaction demonstrates the penalty logic on mainnet.

Security model

Pledge is designed to be non-custodial.

The app does not hold user funds in a normal backend wallet.

Contract design
No admin control for changing user balances
No upgradeable proxy
No manual penalty distribution
No cron job required
Penalties are calculated by the contract
Rewards are tracked onchain
Important risks

This is still an experimental DeFi application.

The contract is not audited.

Users can lose funds because of:

smart contract bugs
Morpho vault risk
liquidity issues
oracle or market risks
mistakes in the application
Arc network or infrastructure issues

Early withdrawal also results in a 4.5% penalty.

Do not deposit money you cannot afford to lose.

Edge case

If there is only one active depositor and that user withdraws, there may be nobody else to receive the penalty.

Pledge is designed around multiple users participating at the same time, so the penalty-sharing mechanism becomes useful once there is more than one active saver.

Smart contract interface

Some of the main functions:

function deposit(
    uint256 usdcAmount,
    uint256 lockDays
) external;

function withdraw(
    uint256 shareAmount
) external;

function claimRewards() external;

Useful view functions:

function getPendingReward(address user)
    external
    view
    returns (uint256);

function isLocked(address user)
    external
    view
    returns (bool);

function getDepositorCount()
    external
    view
    returns (uint256);

function totalPenaltyCollected()
    external
    view
    returns (uint256);

function totalShares()
    external
    view
    returns (uint256);
Tech stack
Part	Tech
Frontend	React + Vite + TypeScript
Styling	Tailwind CSS
Wallet	RainbowKit + wagmi + viem
Blockchain	Arc Mainnet
Smart Contract	Solidity 0.8.28
Contract tooling	Hardhat
Yield	Morpho
AI	Groq
Exchange rates	open.er-api.com
Hosting	Vercel
Contract addresses
PledgeVault
0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75
Morpho — Gauntlet USDC Prime
0xdECcd53BE5453215821184824B519E04C7e00bC7
USDC on Arc
0x3600000000000000000000000000000000000000
Supported currencies

The app can display USDC balances using local currency estimates for several markets.

Current examples include:

Country	Currency
🇹🇷 Turkey	TRY
🇦🇷 Argentina	ARS
🇳🇬 Nigeria	NGN
🇵🇰 Pakistan	PKR
🇪🇬 Egypt	EGP
🇬🇭 Ghana	GHS
🇪🇹 Ethiopia	ETB
🇺🇦 Ukraine	UAH
🇮🇩 Indonesia	IDR
🇷🇴 Romania	RON
🇬🇪 Georgia	GEL
🇦🇴 Angola	AOA

More currencies can be added later.

Roadmap

Things I'd like to add next:

NFT-based lock positions
More yield vault options
Support for EURC and other assets
Better mobile UX
Savings reminders
More flexible lock strategies
Security review / audit
Run locally
git clone https://github.com/Nazrawi15/Pledge.git

cd Pledge

npm install

cp .env.example .env

Add your environment variables:

VITE_WALLETCONNECT_PROJECT_ID=
VITE_GROQ_API_KEY=
VITE_PLEDGE_VAULT_ARC=0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75

Then:

npm run dev
Repo

https://github.com/Nazrawi15/Pledge

Built by Nazrawi15 for the Circle Arc Microgrants hackathon.

The goal was pretty simple:

make saving harder to break, and make patience worth something.