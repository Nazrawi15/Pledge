const hre = require("hardhat");

async function main() {
  const ARC_USDC = "0x3600000000000000000000000000000000000000";
  const PLEDGE_VAULT = "0xB27ceafB0b9d16a7B43b9f7ECf8C0F161C69ea75";

  const [signer] = await hre.ethers.getSigners();
  console.log("Using wallet:", signer.address);

  const usdc = await hre.ethers.getContractAt("IERC20", ARC_USDC);
  const vault = await hre.ethers.getContractAt("PledgeVault", PLEDGE_VAULT);

  const depositAmount = hre.ethers.parseUnits("0.2", 6); // 0.2 USDC (6 decimals)

  console.log("Approving PledgeVault to spend 0.2 USDC...");
  const approveTx = await usdc.approve(PLEDGE_VAULT, depositAmount);
  await approveTx.wait();
  console.log("Approved. Tx:", approveTx.hash);

  console.log("Depositing 0.2 USDC with a 30-day lock...");
  const depositTx = await vault.deposit(depositAmount, 30);
  await depositTx.wait();
  console.log("Deposited! Tx:", depositTx.hash);
  console.log("View on explorer: https://explorer.arc.io/tx/" + depositTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});