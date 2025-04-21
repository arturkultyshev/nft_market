# 🛒 NFT Marketplace (Sepolia Testnet)

A full-stack decentralized NFT marketplace built with:

- 🧱 Solidity (ERC-721)
- ⚙️ Hardhat (v6)
- ⚛️ React (with ethers v6)
- 🌐 IPFS via Pinata
- 🔗 Deployed to Sepolia testnet

Users can:
- ✅ Mint NFTs with custom metadata
- ✅ View owned NFTs
- ✅ List NFTs for sale
- ✅ Buy NFTs from others

## 🧱 Backend Setup (Hardhat)

### 📁 Navigate to backend folder

```bash
cd nft_market
cd contracts
run npm install

This installs:

hardhat

ethers

@openzeppelin/contracts

dotenv

@nomicfoundation/hardhat-toolbox
-------------------------------------------------
compile contracts
npx hardhat compile


⚛️ Frontend Setup (React)
📁 Navigate to frontend folder

cd frontend

npm install

This installs:

react, react-dom

ethers (v6)

react-scripts
------------------------------------
to start
npm start