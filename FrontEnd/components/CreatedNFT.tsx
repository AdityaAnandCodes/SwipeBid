import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Sparkles, Upload, Tag, Wallet, Plus, Info } from "lucide-react";
import { ethers } from "ethers";
import { ADDRESS, ABI } from "@/lib/constant_contracts";

// Define types
interface FormDataType {
  name: string;
  description: string;
  traits: string[];
  basePrice: string;
  image: File | null;
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface UploadResult {
  ipfsUrl: string;
  gatewayUrl: string;
}

interface CreateNFTTutorialProps {
  address?: string; // Make optional
  abi?: any[]; // Make optional
}

const CreateNFTTutorial: React.FC<CreateNFTTutorialProps> = ({
  address = ADDRESS,
  abi = ABI,
}) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    traits: [""],
    basePrice: "",
    image: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    const getAddress = async (): Promise<void> => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (err: unknown) {
          console.error("Error getting address:", err);
        }
      }
    };

    getAddress();
  }, []);

  const uploadToPinata = async (file: File): Promise<UploadResult> => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: formData.name || "NFT Image",
      });
      formDataObj.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formDataObj.append("pinataOptions", pinataOptions);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: formDataObj,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error?.details || "Failed to upload to Pinata"
        );
      }

      const data = (await res.json()) as PinataResponse;
      return {
        ipfsUrl: `ipfs://${data.IpfsHash}`,
        gatewayUrl: `https://aqua-rare-worm-454.mypinata.cloud/ipfs/${data.IpfsHash}`,
      };
    } catch (err: unknown) {
      console.error("Pinata upload error:", err);
      throw new Error(
        `Failed to upload image to Pinata: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  }

  const uploadMetadataToPinata = async (
    metadata: NFTMetadata
  ): Promise<UploadResult> => {
    try {
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error?.details || "Failed to upload metadata to Pinata"
        );
      }

      const data = (await res.json()) as PinataResponse;
      return {
        ipfsUrl: `ipfs://${data.IpfsHash}`,
        gatewayUrl: `https://aqua-rare-worm-454.mypinata.cloud/ipfs/${data.IpfsHash}`,
      };
    } catch (err: unknown) {
      console.error("Pinata metadata upload error:", err);
      throw new Error(
        `Failed to upload metadata to Pinata: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      if (!formData.image) {
        throw new Error("Please select an image file");
      }

      // 1. Upload image to IPFS
      console.log("Uploading image to Pinata...");
      const imageUrls = await uploadToPinata(formData.image);
      console.log("Image uploaded:", imageUrls);

      // 2. Create metadata
      const metadata: NFTMetadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrls.ipfsUrl, // Use IPFS URL in metadata
        attributes: [
          {
            trait_type: "Category",
            value: formData.traits[0],
          },
        ],
      };

      // 3. Upload metadata to IPFS
      console.log("Uploading metadata to Pinata...");
      const metadataUrls = await uploadMetadataToPinata(metadata);
      console.log("Metadata uploaded:", metadataUrls);

      // 4. Create contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address, abi, signer);

      // 5. Create NFT on blockchain - Use metadataUrl instead of imageUrl
      const priceInWei = ethers.parseEther(formData.basePrice);
      const tx = await contract.createNFT(
        formData.name,
        formData.description,
        metadataUrls.ipfsUrl, // Changed: Use metadata URI instead of image URI
        formData.traits,
        priceInWei
      );

      await tx.wait();
      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        description: "",
        traits: [""],
        basePrice: "",
        image: null,
      });
    } catch (err: unknown) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  return (
    <section className="w-full p-8 min-h-screen grid grid-cols-2 gap-12 place-items-center">
      <div className="max-w-xl space-y-8 py-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-300/80" />
            <span className="text-sm">Create & Sell NFTs</span>
          </div>
          <h2 className="text-4xl text-white">
            Create Once,
            <span className="block opacity-80">Sell Forever</span>
          </h2>
          <p className="text-gray-400">
            Transform your digital creations into tradeable NFTs. Set up
            auctions or fixed prices and let the market discover your art.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="p-3 bg-white/5 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Upload Your Creation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Support for all major file formats. Add metadata to make your
                NFT discoverable in our marketplace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="p-3 bg-white/5 rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Set Price & Terms</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Choose your sale type: fixed price or timed auction. Set
                royalties to earn from future resales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
          <Wallet className="w-4 h-4" />
          <p>Payments are automatically sent to your connected wallet</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
          <Info className="w-4 h-4" />
          <p>This Model is Just For Demonstration Purpose</p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="w-full max-w-lg bg-white/5 rounded-xl p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div
              className="border border-dashed border-white/20 rounded-xl p-8 text-center
            hover:border-white/30 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center
              mx-auto mb-4"
              >
                <Plus className="w-6 h-6 text-white/80" />
              </div>
              <p className="text-gray-400 text-sm">
                Drag and drop your file here, or click to browse
              </p>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full mt-4"
              />
              <p className="text-gray-500 text-xs mt-2">
                Maximum file size: 50MB
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Title
                </label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  type="text"
                  placeholder="Give your NFT a name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Tell the story behind your creation"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20
                  resize-none h-24"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Traits
                </label>
                <input
                  value={formData.traits[0]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      traits: [e.target.value],
                    })
                  }
                  required
                  type="text"
                  placeholder="Enter Traits For The NFT"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Price
                  </label>
                  <div className="relative">
                    <input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      required
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                      text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      ETH
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Royalty
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="2.5"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                      text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-emerald-500 hover:bg-emerald-500/90 text-white p-3 
              rounded-lg transition-colors"
                onClick={handleSubmit}
              >
                {loading ? "Creating..." : "Create NFT"}
              </button>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              {success && (
                <div className="text-green-500 text-sm mt-2">
                  NFT created successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateNFTTutorial;
