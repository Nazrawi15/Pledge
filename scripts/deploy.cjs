const hre = require("hardhat");

async function main() {
  const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const YO_VAULT_BASE_MAINNET = "0x0000000f2eb9f69274678c76222b35eec7588a65";

  console.log("Deploying DisciplineVault to Base mainnet...");
  console.log("USDC:", USDC_BASE_MAINNET);
  console.log("YO Vault:", YO_VAULT_BASE_MAINNET);

  const DisciplineVault = await hre.ethers.getContractFactory("DisciplineVault");
  const vault = await DisciplineVault.deploy(USDC_BASE_MAINNET, YO_VAULT_BASE_MAINNET);

  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("DisciplineVault deployed to:", address);
  console.log("Verify on Basescan: https://basescan.org/address/" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});