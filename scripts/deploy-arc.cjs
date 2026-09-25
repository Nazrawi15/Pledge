const hre = require("hardhat");

async function main() {
  const ARC_USDC = "0x3600000000000000000000000000000000000000";
  const MORPHO_VAULT = "0xdECcd53BE5453215821184824B519E04C7e00bC7";

  console.log("Deploying PledgeVault to Arc mainnet...");

  const PledgeVault = await hre.ethers.getContractFactory("PledgeVault");
  const pledgeVault = await PledgeVault.deploy(ARC_USDC, MORPHO_VAULT);

  await pledgeVault.waitForDeployment();

  const address = await pledgeVault.getAddress();
  console.log("PledgeVault deployed to:", address);
  console.log("View on explorer: https://explorer.arc.io/address/" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});