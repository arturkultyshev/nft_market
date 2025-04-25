import axios from "axios";

const PINATA_API_KEY = "134d00bc12f27d9c3ffa";
const PINATA_SECRET = "be008d598c41b5ff3208a59a5e83a82054f04f862c3ee87a3478cbe3a041b111";

export async function uploadToIPFS(file) {
  // Шаг 1 — заливаем изображение
  const formDataImage = new FormData();
  formDataImage.append("file", file);

  const imageUpload = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formDataImage,
    {
      maxBodyLength: "Infinity",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const imageCID = imageUpload.data.IpfsHash;
  const imageURL = `ipfs://${imageCID}`;

  // Шаг 2 — создаём metadata.json
  const metadata = {
    name: file.name,
    description: "NFT minted via Pinata & IPFS",
    image: imageURL,
  };

  // Шаг 3 — заливаем metadata.json
  const metadataUpload = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
        "Content-Type": "application/json",
      },
    }
  );

  const metadataCID = metadataUpload.data.IpfsHash;
  const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

  return metadataURL; // ✅ правильный tokenURI
}
