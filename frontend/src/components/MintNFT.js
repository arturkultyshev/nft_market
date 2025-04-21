import { useState } from "react";
import { NFT_COLLECTION_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import { ethers } from "ethers";
import "../App.css";

export default function MintNFT({ signer, onMinted }) {
  const [tokenURI, setTokenURI] = useState("");
  const [minting, setMinting] = useState(false);

  const mint = async () => {
    try {
      setMinting(true);
      const contract = new ethers.Contract(
        NFT_COLLECTION_ADDRESS,
        NFTCollectionABI.abi,
        signer
      );

      const recipient = await signer.getAddress();
      const tx = await contract.mintNFT(recipient, tokenURI);
      await tx.wait();

      alert("Minted successfully!");
      setTokenURI("");
      
      if (onMinted) {
        onMinted();
      }
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Mint failed");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mint-section">
      <h2>Mint NFT</h2>
      <input
        type="text"
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
        placeholder="Enter tokenURI (IPFS URL)"
        className="mint-input"
      />
      <button onClick={mint} disabled={minting || !tokenURI} className="mint-button">
        {minting ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}
