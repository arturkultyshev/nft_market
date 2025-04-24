// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721, ERC721Enumerable, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("NFTCollection", "NFTC") Ownable() {}

    function mintNFT(address recipient, string memory uri) public onlyOwner returns (uint256) {
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;

        _mint(recipient, newItemId);
        _tokenURIs[newItemId] = uri;

        return newItemId;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        // 🔁 заменили _exists на ownerOf
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
