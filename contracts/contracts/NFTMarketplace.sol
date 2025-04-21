// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is Ownable {
    IERC721 public nftCollection;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId);

    constructor(address _nftCollection) Ownable(msg.sender) {
        nftCollection = IERC721(_nftCollection);
    }

    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(nftCollection.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        require(price > 0, "Price must be > 0");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];

        require(listing.active, "Not listed");
        require(msg.value == listing.price, "Incorrect ETH sent");

        listings[tokenId].active = false;

        (bool sent, ) = payable(listing.seller).call{value: msg.value}("");
        require(sent, "Payment failed");

        nftCollection.safeTransferFrom(listing.seller, msg.sender, tokenId);
        emit NFTSold(tokenId, msg.sender, listing.price);
    }

    function unlistNFT(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not listed");

        listings[tokenId].active = false;
        emit NFTUnlisted(tokenId);
    }
}
