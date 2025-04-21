const { ethers } = require("hardhat");

async function main() {
  const nftCollectionAddress = "0xDccad50404571F4a950657F97c009e7Dff714fCe";

  const NFTCollection = await ethers.getContractAt("NFTCollection", nftCollectionAddress);

  const recipient = "0x7528b03E11Ec57e03f6F24A04903Bf67BF9E35Bd";
  const tokenURI = "https://purple-adverse-toucan-820.mypinata.cloud/ipfs/bafkreifviyj5dqtjekbzlmozktxgvpfflx3lytpuwutmcmwozezndcy5da";

  const tx = await NFTCollection.mintNFT(recipient, tokenURI);
  console.log("⏳ Minting... tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ NFT minted in block:", receipt.blockNumber);
  console.log("🧾 Transaction hash:", tx.hash);
}

main().catch((err) => {
  console.error("❌ Error minting NFT:", err);
  process.exit(1);
});
