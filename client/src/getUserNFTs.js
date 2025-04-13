import { ethers } from "ethers";
import contractABI from "./abi.json";

const CONTRACT_ADDRESS = "0x0e446f6e483e8f63cBeDDD39607ee3673589BE07";

export async function getUserNFTs() {
  if (!window.ethereum) throw new Error("MetaMask не найден");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  const balance = await contract.balanceOf(userAddress);
  const nfts = [];

  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
    const tokenURI = await contract.tokenURI(tokenId);

    const metadataURL = tokenURI.startsWith("ipfs://")
      ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : tokenURI;

    try {
      const res = await fetch(metadataURL);
      const metadata = await res.json();

      // 🔧 Преобразуем image
      const imageURL = metadata.image?.startsWith("ipfs://")
        ? metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
        : metadata.image;

      nfts.push({
        tokenId: tokenId.toString(),
        name: metadata.name,
        description: metadata.description,
        image: imageURL,
      });
    } catch (err) {
      console.error("Ошибка загрузки метаданных:", err);
    }
  }

  return nfts;
}
