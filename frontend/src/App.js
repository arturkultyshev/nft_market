import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MintNFT from "./components/MintNFT";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [refreshProfile, setRefreshProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("marketplace");

  const triggerProfileRefresh = () => setRefreshProfile((prev) => !prev);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const renderTab = () => {
    if (!signer) {
      return <p style={{ marginTop: "2rem" }}>Connect your wallet to begin using the NFT Marketplace.</p>;
    }

    switch (activeTab) {
      case "mint":
        return <MintNFT signer={signer} onMinted={triggerProfileRefresh} />;
      case "profile":
        return <Profile signer={signer} refreshTrigger={refreshProfile} />;
      default:
        return <Marketplace signer={signer} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="title">
          🛒 NFT Market
        </div>
        <div className="wallet-address">
          {walletAddress ? (
            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          ) : (
            <button onClick={connectWallet} className="connect-btn">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <button className="tab-btn" onClick={() => setActiveTab("marketplace")}>Marketplace Listing</button>
          <button className="tab-btn" onClick={() => setActiveTab("mint")}>Mint NFT</button>
          <button className="tab-btn" onClick={() => setActiveTab("profile")}>Your NFTs</button>
        </aside>
        <section className="content">
          {renderTab()}
        </section>
      </div>
    </div>
  );
}

export default App;