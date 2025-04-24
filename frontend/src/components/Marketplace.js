import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from "../config";
import NFTCollectionABI from "../abi/NFTCollection.json";
import NFTMarketplaceABI from "../abi/NFTMarketplace.json";
import "../App.css";

const ITEMS_PER_PAGE = 4;

export default function Marketplace({ signer }) {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [listedNFTs, setListedNFTs] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("price-asc");
  const [error, setError] = useState(null);

  const nftContract = new ethers.Contract(NFT_COLLECTION_ADDRESS, NFTCollectionABI.abi, signer);
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI.abi, signer);

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const all = [];
      const listingCount = await marketplace.listingCount();

      for (let i = 1; i <= listingCount; i++) {
        try {
          const listing = await marketplace.listings(i);
          if (listing.active) {
            const uri = await nftContract.tokenURI(i);
            const response = await fetch(uri);
            if (!response.ok) throw new Error(`Failed to fetch metadata for token ${i}`);
            const metadata = await response.json();
            let image = metadata.image;
            if (image?.startsWith("ipfs://")) {
              image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
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
          console.error(`Error loading NFT ${i}:`, err);
        }
      }

      setListedNFTs(all);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setError("Failed to load listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [marketplace, nftContract]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    let filtered = [...listedNFTs];
    if (searchQuery) {
      filtered = filtered.filter((nft) =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.tokenId.toString().includes(searchQuery)
      );
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "price-asc": return parseFloat(a.price) - parseFloat(b.price);
        case "price-desc": return parseFloat(b.price) - parseFloat(a.price);
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "id-asc": return a.tokenId - b.tokenId;
        case "id-desc": return b.tokenId - a.tokenId;
        default: return 0;
      }
    });

    setFilteredNFTs(filtered);
    setCurrentPage(1);
  }, [searchQuery, listedNFTs, sortOption]);

  const approveAndList = async () => {
    if (!tokenId || !price) return;
    try {
      setLoading(true);
      setError(null);

      const isApproved = await nftContract.isApprovedForAll(await signer.getAddress(), MARKETPLACE_ADDRESS);
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(MARKETPLACE_ADDRESS, true);
        await approvalTx.wait();
      }

      const listTx = await marketplace.listNFTForSale(tokenId, ethers.parseEther(price));
      await listTx.wait();

      setTokenId("");
      setPrice("");
      await loadListings();
      alert("NFT successfully listed for sale!");
    } catch (err) {
      console.error("Listing failed:", err);
      setError(`Listing failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async (tokenId, priceWei) => {
    try {
      setLoading(true);
      setError(null);
      const tx = await marketplace.buyNFT(tokenId, { value: priceWei });
      await tx.wait();
      await loadListings();
      alert("NFT successfully purchased!");
    } catch (err) {
      console.error("Purchase failed:", err);
      setError(`Purchase failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE);
  const currentNFTs = filteredNFTs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="marketplace-section">
      <h2>List NFT for Sale</h2>
      <div className="form-group">
        <input
          type="number"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="input-field"
          min="1"
        />
        <input
          type="text"
          placeholder="Price in ETH"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input-field"
        />
        <button
          onClick={approveAndList}
          disabled={!tokenId || !price || loading}
          className="mint-button"
        >
          {loading ? "Processing..." : "List NFT"}
        </button>
      </div>

      <h2 className="section-heading">Marketplace Listings</h2>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name, description or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field search-field"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
          <option value="id-asc">ID: Low to High</option>
          <option value="id-desc">ID: High to Low</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && listedNFTs.length === 0 ? (
        <div className="loading">Loading NFTs...</div>
      ) : currentNFTs.length === 0 ? (
        <div className="no-results">No NFTs found matching your criteria.</div>
      ) : (
        <>
          <div className="nft-grid">
            {currentNFTs.map((nft) => (
              <div key={nft.tokenId} className="marketplace-card">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="nft-thumbnail"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x400?text=NFT+Image";
                  }}
                />
                <div className="nft-details">
                  <h3>{nft.name}</h3>
                  <p className="nft-description">{nft.description}</p>
                  <div className="nft-meta">
                    <span>ID: {nft.tokenId}</span>
                    <span>Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</span>
                    <span className="price">Price: {nft.price} ETH</span>
                  </div>
                  <button
                    onClick={() => buyNFT(nft.tokenId, nft.priceWei)}
                    disabled={loading}
                    className="buy-button"
                  >
                    {loading ? "Processing..." : "Buy NFT"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="page-button">First</button>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="page-button">Previous</button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="page-button">Next</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="page-button">Last</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
