import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import MintNFT from "./components/MintNFT";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [refreshProfile, setRefreshProfile] = useState(false);
  
  const triggerProfileRefresh = () => {
    setRefreshProfile((prev) => !prev);
  };

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

  return (
    <div>
      <Navbar walletAddress={walletAddress} connectWallet={connectWallet} />
      <div className="container">
        {signer ? (
          <>
            <MintNFT signer={signer} onMinted={triggerProfileRefresh}/>
            <Marketplace signer={signer} />
            <Profile signer={signer} onMinted={triggerProfileRefresh}/>
          </>
        ) : (
          <p style={{ marginTop: "2rem" }}>Connect your wallet to begin using the NFT Marketplace.</p>
        )}
      </div>
    </div>
  );
}

export default App;
