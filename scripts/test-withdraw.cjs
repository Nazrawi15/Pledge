const hre = require("hardhat");

async function main() {
  const PLEDGE_VAULT = "0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75";

  const [signer] = await hre.ethers.getSigners();
  console.log("Using wallet:", signer.address);

  const vault = await hre.ethers.getContractAt("PledgeVault", PLEDGE_VAULT);

  const myShares = await vault.getUserShares(signer.address);
  console.log("Current shares:", myShares.toString());

  const locked = await vault.isLocked(signer.address);
  console.log("Currently locked:", locked);

  const timeRemaining = await vault.getTimeRemaining(signer.address);
  console.log("Time remaining (seconds):", timeRemaining.toString());

  console.log("Withdrawing all shares (this should trigger the early penalty)...");
  const withdrawTx = await vault.withdraw(myShares);
  const receipt = await withdrawTx.wait();
  console.log("Withdrawn! Tx:", withdrawTx.hash);
  console.log("View on explorer: https://explorer.arc.io/tx/" + withdrawTx.hash);

  const penaltyCollected = await vault.totalPenaltyCollected();
  console.log("Total penalty collected (contract-wide):", penaltyCollected.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});