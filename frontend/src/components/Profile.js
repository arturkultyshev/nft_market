import { useEffect, useState } from "react";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import NFTMarketABI from "../abi/NFTMarketplace.json";
import { ethers } from "ethers";
import "../App.css";

export default function Profile({ signer, refreshTrigger }) {
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [giftAddress, setGiftAddress] = useState({}); // Новое: хранение адресов для каждого токена

  useEffect(() => {
    getOwnedNFTs();
  }, [refreshTrigger]);

  const getOwnedNFTs = async () => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
      const user = await signer.getAddress();
      const balance = await contract.balanceOf(user);
      const nftList = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(user, i);
        const uri = await contract.tokenURI(tokenId);
        const metadata = await fetch(uri).then((res) => res.json());
        let image = metadata.image;
        if (image.startsWith("ipfs://")) {
          image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
        }
        nftList.push({ tokenId: tokenId.toString(), uri, image, name: metadata.name, description: metadata.description });
      }

      setOwned(nftList);
    } catch (e) {
      console.error("Error loading NFTs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGiftNFT = async (tokenId) => {
    try {
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketABI.abi, signer);
      const toAddress = giftAddress[tokenId];
      if (!toAddress || toAddress.length !== 42) {
        alert("Please enter a valid address");
        return;
      }
      const tx = await marketContract.giftNFT(tokenId, toAddress);
      await tx.wait();
      alert(`NFT #${tokenId} gifted successfully!`);
      getOwnedNFTs(); // Обновим список после подарка
    } catch (e) {
      console.error("Error gifting NFT", e);
      alert("Failed to gift NFT.");
    }
  };
  const handleApproveNFT = async (tokenId) => {
    try {
      const nftContract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
      const tx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await tx.wait();
      alert(`NFT #${tokenId} approved for gifting!`);
    } catch (e) {
      console.error("Error approving NFT", e);
      alert("Failed to approve NFT.");
    }
  };

  const handleGiftAddressChange = (tokenId, value) => {
    setGiftAddress((prev) => ({ ...prev, [tokenId]: value }));
  };

  return (
    <div className="profile-section">
      <h2>Your NFTs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : owned.length === 0 ? (
        <p>You don't own any NFTs yet.</p>
      ) : (
        <ul className="nft-list">
          {owned.map((nft) => (
            <div key={nft.tokenId} className="marketplace-card">
              <img src={nft.image} alt={nft.name} className="nft-item" />
              <p><strong>{nft.name}</strong></p>
              <p>{nft.description}</p>
              <p><strong>ID:</strong> {nft.tokenId}</p>
              <input
  type="text"
  placeholder="Recipient address"
  value={giftAddress[nft.tokenId] || ""}
  onChange={(e) => handleGiftAddressChange(nft.tokenId, e.target.value)}
  className="gift-input"
/>
<div>
  <button onClick={() => handleApproveNFT(nft.tokenId)} className="approve-button">
    Approve
  </button>
  <button onClick={() => handleGiftNFT(nft.tokenId)} className="gift-button">
    Gift
  </button>
</div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
