const { ethers } = require("hardhat");

async function main() {
  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy();

  await nftCollection.waitForDeployment();
  console.log("NFTCollection deployed to:", await nftCollection.getAddress());


  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(await nftCollection.getAddress());
  await nftMarketplace.waitForDeployment();
  console.log("NFTMarketplace deployed to:", await nftMarketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
