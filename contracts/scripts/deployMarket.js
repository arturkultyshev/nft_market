require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const raw = process.env.NFT_COLLECTION_ADDRESS;
  if (!raw) throw new Error("❌ set NFT_COLLECTION_ADDRESS in .env");
  const collectionAddress = raw.trim();

  if (!hre.ethers.utils.isAddress(collectionAddress)) {
    throw new Error(`❌ Invalid address: ${collectionAddress}`);
  }
  console.log("🎯 Using NFTCollection at:", collectionAddress);

  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy(collectionAddress);

  console.log("⏳ Deployment tx hash:", marketplace.deployTransaction.hash);
  await marketplace.deployTransaction.wait(1);

  console.log("✅ NFTMarketplace deployed to:", marketplace.address);
}

main().catch(err => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
