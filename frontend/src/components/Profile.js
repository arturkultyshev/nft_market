import { useEffect, useState } from "react";
import { NFT_COLLECTION_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import { ethers } from "ethers";
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
        const metadata = await fetch(uri).then((res) => res.json());
        let image = metadata.image;
            if (image.startsWith("ipfs://")) {
              image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            }
        nftList.push({ tokenId: tokenId.toString(), uri, image });
      }

      setOwned(nftList);
    } catch (e) {
      console.error("Error loading NFTs", e);
    } finally {
      setLoading(false);
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
        <ul className="nft-list">
          {owned.map((nft) => (
            <div key={nft.tokenId} className="marketplace-card">
            <img src={nft.image} alt={nft.name} className="nft-item" />
            <p><strong>{nft.name}</strong></p>
            <p>{nft.description}</p>
            <p><strong>ID:</strong> {nft.tokenId}</p>
          </div>
          ))}
        </ul>
      )}
    </div>
  );
}
