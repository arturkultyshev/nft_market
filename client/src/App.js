import React, { useState } from "react";
import './App.css';
import { mintNFT } from "./mint";
import { uploadToIPFS } from "./ipfs";
import { getUserNFTs } from "./getUserNFTs";

function App() {
  const [file, setFile] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [nfts, setNfts] = useState([]);

  const handleMint = async () => {
    if (!file) return alert("Загрузи изображение");

    try {
      const tokenURI = await uploadToIPFS(file);
      const hash = await mintNFT(tokenURI);
      setTxHash(hash);
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
  };

  const loadNFTs = async () => {
    try {
      const userNFTs = await getUserNFTs();
      setNfts(userNFTs);
    } catch (e) {
      alert("Ошибка загрузки NFT: " + e.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🖼 NFT Минтер</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleMint}>Mint NFT</button>

      {txHash && (
        <div>
          ✅ NFT заминчен! <br />
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            Посмотреть в Etherscan
          </a>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />

      <h2>🗂 Мои NFT</h2>
      <button onClick={loadNFTs}>Показать мои NFT</button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 }}>
        {nfts.map((nft, i) => (
         // <div key={i} style={{ border: "1px solid #ccc", padding: 10, width: 250 }}>
            <div key={i} className="nft-card">
            <img src={nft.image} alt={nft.name} style={{ width: "100%" }} />
            <h3>{nft.name}</h3>
            <p>{nft.description}</p>
            <code>Token ID: {nft.tokenId}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
