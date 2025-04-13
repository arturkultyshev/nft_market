import { ethers } from "ethers";
import contractABI from "./abi.json";

const CONTRACT_ADDRESS = "0x0e446f6e483e8f63cBeDDD39607ee3673589BE07"; // вставь сюда

export async function mintNFT(tokenURI) {
  if (!window.ethereum) throw new Error("MetaMask не найден");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  const tx = await contract.mintNFT(signer.address, tokenURI);
  await tx.wait();

  return tx.hash;
}
