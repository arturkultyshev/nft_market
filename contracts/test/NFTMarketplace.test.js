const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let nftCollection, nftMarketplace, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy();
    await nftCollection.waitForDeployment();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy(await nftCollection.getAddress());
    await nftMarketplace.waitForDeployment();
  });

  it("should mint an NFT", async function () {
    const mintTx = await nftCollection.connect(user1).mintNFT("ipfs://token1");
    const receipt = await mintTx.wait();

    const tokenId = receipt.logs[0].args.tokenId || 1;
    expect(await nftCollection.ownerOf(tokenId)).to.equal(user1.address);
    expect(await nftCollection.tokenURI(tokenId)).to.equal("ipfs://token1");
  });

  it("should list NFT for sale", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");

    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);

    await expect(nftMarketplace.connect(user1).listNFTForSale(1, ethers.parseEther("1")))
      .to.emit(nftMarketplace, "NFTListed")
      .withArgs(1, user1.address, ethers.parseEther("1"));

    const listing = await nftMarketplace.listings(1);
    expect(listing.active).to.equal(true);
    expect(listing.price).to.equal(ethers.parseEther("1"));
  });

  it("should allow a user to buy a listed NFT", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");
    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);
    await nftMarketplace.connect(user1).listNFTForSale(1, ethers.parseEther("1"));

    await expect(
      nftMarketplace.connect(user2).buyNFT(1, { value: ethers.parseEther("1") })
    ).to.emit(nftMarketplace, "NFTSold")
      .withArgs(1, user2.address, ethers.parseEther("1"));

    expect(await nftCollection.ownerOf(1)).to.equal(user2.address);

    const listing = await nftMarketplace.listings(1);
    expect(listing.active).to.equal(false);
  });

  it("should fail if incorrect ETH is sent", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");
    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);
    await nftMarketplace.connect(user1).listNFTForSale(1, ethers.parseEther("1"));

    await expect(
      nftMarketplace.connect(user2).buyNFT(1, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Incorrect ETH sent");
  });

  it("should gift an NFT", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");

    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);

    await nftMarketplace.connect(user1).giftNFT(1, user2.address);

    expect(await nftCollection.ownerOf(1)).to.equal(user2.address);
  });

  it("should fail gifting to self or zero address", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");

    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);

    await expect(
      nftMarketplace.connect(user1).giftNFT(1, ethers.ZeroAddress)
    ).to.be.revertedWith("Cannot gift to zero address");

    await expect(
      nftMarketplace.connect(user1).giftNFT(1, user1.address)
    ).to.be.revertedWith("Cannot gift to yourself");
  });

  it("should unlist an NFT", async function () {
    await nftCollection.connect(user1).mintNFT("ipfs://token1");

    await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);
    await nftMarketplace.connect(user1).listNFTForSale(1, ethers.parseEther("1"));

    await expect(nftMarketplace.connect(user1).unlistNFT(1))
      .to.emit(nftMarketplace, "NFTUnlisted")
      .withArgs(1);


      const listing = await nftMarketplace.listings(1);
      expect(listing.active).to.equal(false);
    });
  
    it("should fail unlisting if not seller", async function () {
      await nftCollection.connect(user1).mintNFT("ipfs://token1");
  
      await nftCollection.connect(user1).setApprovalForAll(nftMarketplace.target, true);
      await nftMarketplace.connect(user1).listNFTForSale(1, ethers.parseEther("1"));
  
      await expect(
        nftMarketplace.connect(user2).unlistNFT(1)
      ).to.be.revertedWith("Not seller");
    });
  });
  