import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import NFTMarketplaceABI from "../abi/NFTMarketplace.json";
import "../App.css";

export default function Marketplace({ signer }) {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [listedNFTs, setListedNFTs] = useState([]);

  const nftContract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI.abi, signer);

  useEffect(() => {
    loadListings();
  }, []);

  const approveAndList = async () => {
    try {
      const isApproved = await nftContract.isApprovedForAll(await signer.getAddress(), MARKETPLACE_ADDRESS);
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(MARKETPLACE_ADDRESS, true);
        await approvalTx.wait();
        console.log("Approved marketplace");
      }

      const listTx = await marketplace.listNFTForSale(tokenId, ethers.parseEther(price));
      await listTx.wait();
      alert("NFT listed for sale!");
      setTokenId("");
      setPrice("");
      loadListings();
    } catch (err) {
      console.error("Listing failed", err);
      alert("Listing failed");
    }
  };

  const buyNFT = async (tokenId, priceWei) => {
    try {
      const tx = await marketplace.buyNFT(tokenId, { value: priceWei });
      await tx.wait();
      alert("NFT purchased!");
      loadListings();
    } catch (err) {
      console.error("Purchase failed", err);
      alert("Purchase failed");
    }
  };

  const loadListings = async () => {
    try {
      const all = [];
      for (let i = 1; i <= 10; i++) {
        try {
          const listing = await marketplace.listings(i);
          if (listing.active) {
            const uri = await nftContract.tokenURI(i);
            const metadata = await fetch(uri).then((res) => res.json());

            let image = metadata.image;
            if (image.startsWith("ipfs://")) {
              image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            }

            all.push({
              tokenId: i,
              price: ethers.formatEther(listing.price),
              seller: listing.seller,
              uri,
              priceWei: listing.price,
              image,
              name: metadata.name || `NFT #${i}`,
              description: metadata.description || ""
            });
          }
        } catch (err) {
          // Likely token doesn't exist
        }
      }
      setListedNFTs(all);
    } catch (err) {
      console.error("Failed to load listings", err);
    }
  };

  return (
    <div className="marketplace-section">
      <h2>List NFT for Sale</h2>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Price in ETH"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="input-field"
      />
      <button onClick={approveAndList} disabled={!tokenId || !price} className="mint-button">
        List NFT
      </button>

      <h2 className="section-heading">Marketplace Listings</h2>
      {listedNFTs.length === 0 ? (
        <p>No NFTs listed yet.</p>
      ) : (
        listedNFTs.map((nft) => (
          <div key={nft.tokenId} className="marketplace-card">
            <img src={nft.image} alt={nft.name} className="nft-item" />
            <p><strong>{nft.name}</strong></p>
            <p>{nft.description}</p>
            <p><strong>ID:</strong> {nft.tokenId}</p>
            <p><strong>Seller:</strong> {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</p>
            <p><strong>Price:</strong> {nft.price} ETH</p>
            <button onClick={() => buyNFT(nft.tokenId, nft.priceWei)} className="buy-button">
              Buy NFT
            </button>
          </div>
        ))
      )}
    </div>
  );
}
