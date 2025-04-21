import { useState } from "react";
import { NFT_COLLECTION_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import { ethers } from "ethers";
import "../App.css";

export default function MintNFT({ signer, onMinted }) {
  const [file, setFile] = useState(null);
  const [minting, setMinting] = useState(false);

  const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3NDlkOGVmNC0zODc1LTQxMGEtYmJkNC1iYmU4ZjRjOWFlNjciLCJlbWFpbCI6Im5pZ2FuNDUwMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDEwZTVmMWUwNmU1YzY3OTA1NmIiLCJzY29wZWRLZXlTZWNyZXQiOiJmMDg0NzZmNDZkODlhYzAwZTBmYTZkM2FhNWE1YjI5MDMxNmY3MDU3NzY0Yzk3N2E5ZTZhNDBhYTkyNDYwNDMwIiwiZXhwIjoxNzc2Nzc5NDU5fQ.PYC79Q23p9cimEjdvkL3qYJwO0ANOmTosgGi7l64Cew";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });

    formData.append("pinataMetadata", metadata);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  const uploadMetadata = async (imageUrl) => {
    const metadata = {
      name: "NFT from frontend",
      description: "Minted via UI",
      image: imageUrl,
    };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  const mint = async () => {
    if (!file) return alert("Please choose an image!");

    setMinting(true);

    try {
      // 1. Upload image to Pinata
      const imageUrl = await uploadToPinata(file);
      console.log("🖼️ Uploaded image:", imageUrl);

      // 2. Upload metadata.json with image link
      const tokenURI = await uploadMetadata(imageUrl);
      console.log("📝 Uploaded metadata:", tokenURI);

      // 3. Mint NFT
      const contract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
      const recipient = await signer.getAddress();
      const tx = await contract.mintNFT(tokenURI);
      await tx.wait();

      alert("✅ NFT Minted!");
      setFile(null);
      if (onMinted) onMinted();
    } catch (err) {
      console.error("❌ Mint failed:", err);
      alert("Mint failed");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mint-section">
      <h2>Mint NFT</h2>
      <input type="file" onChange={handleFileChange} className="mint-input" />
      <button onClick={mint} disabled={minting || !file} className="mint-button">
        {minting ? "Uploading & Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}
