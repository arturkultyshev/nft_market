const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("📦 Deploying with address:", deployer.address);

  const NFT = await hre.ethers.getContractFactory("NFTCollection");
  const nft = await NFT.deploy();

  await nft.waitForDeployment();

  console.log("✅ NFTCollection deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
