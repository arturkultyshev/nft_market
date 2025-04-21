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
        nftList.push({ tokenId: tokenId.toString(), uri });
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
            <li key={nft.tokenId} className="nft-item">
              <strong>ID:</strong> {nft.tokenId} <br />
              <a href={nft.uri} target="_blank" rel="noreferrer">
                View Metadata
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
