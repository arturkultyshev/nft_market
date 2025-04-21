import React from "react";
import "../App.css";

export default function Navbar({ walletAddress, connectWallet }) {
  return (
    <nav className="navbar">
      <div className="logo">🛒 NFT Market</div>
      <div>
        {walletAddress ? (
          <span className="address-badge">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        ) : (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
