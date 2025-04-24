import { useState, useEffect } from "react";
import { ethers, parseEther } from "ethers";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import NFTMarketplaceABI from "../abi/NFTMarketplace.json";
import "../App.css";

export default function Profile({ signer, refreshTrigger }) {
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const response = await fetch(uri);
        const metadata = await response.json();

        nftList.push({
          tokenId: tokenId.toString(),
          image: metadata.image,
          name: metadata.name,
          description: metadata.description,
        });
      }

      setOwned(nftList.reverse());
    } catch (e) {
      console.error("Error loading NFTs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGift = async (tokenId) => {
    const recipient = prompt("Enter the recipient's wallet address:");
    if (!recipient) return;

    try {
      const contract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
      const sender = await signer.getAddress();
      const tx = await contract.transferFrom(sender, recipient, tokenId);
      await tx.wait();
      alert(`NFT #${tokenId} gifted successfully!`);
      getOwnedNFTs(); // обновление после отправки
    } catch (err) {
      console.error("Error gifting NFT:", err);
      alert("Failed to gift NFT.");
    }
  };

  const handleSell = async (tokenId) => {
    const priceInEth = prompt("Enter the sale price in ETH:");
    if (!priceInEth) return;

    try {
      const nftContract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI.abi, signer);

      // Одобрение NFT на маркетплейс
      const approvalTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approvalTx.wait();

      const priceInWei = parseEther(priceInEth);
      const tx = await marketplace.listItem(NFT_COLLECTION_ADDRESS, tokenId, priceInWei);
      await tx.wait();

      alert(`NFT #${tokenId} listed for sale at ${priceInEth} ETH!`);
    } catch (err) {
      console.error("Error listing NFT:", err);
      alert("Failed to list NFT.");
    }
  };

  return (
    <div className="profile-section">
      <h2>Your NFTs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : owned.length === 0 ? (
        <p>You don't own any NFTs yet.</p>
      ) : (
        <div className="nft-grid">
          {owned.map((nft) => (
            <div key={nft.tokenId} className="nft-card">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              <h3>{nft.name || `NFT #${nft.tokenId}`}</h3>
              <p>{nft.description}</p>
              <p className="token-id">ID: {nft.tokenId}</p>
              <div className="button-group">
                <button className="gift-btn" onClick={() => handleGift(nft.tokenId)}>Gift</button>
                <button className="sell-btn" onClick={() => handleSell(nft.tokenId)}>Sell</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
