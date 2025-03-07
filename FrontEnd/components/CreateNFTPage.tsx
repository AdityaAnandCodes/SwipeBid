"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Sparkles, ImageIcon, Loader2, Wallet, MoveLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { ADDRESS, ABI } from "@/lib/constant_contracts";
import Link from "next/link";

const createNFTSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  traits: z.string().optional(),
  price: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
});

type FormValues = z.infer<typeof createNFTSchema>;

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
  address?: string;
  abi?: any[];
}

export default function CreateNFTPage({
  address = ADDRESS,
  abi = ABI,
}: CreateNFTTutorialProps) {
  // Client-side only state
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(createNFTSchema),
    defaultValues: {
      title: "",
      description: "",
      traits: "",
      price: "",
    },
  });

  // Initialize dropzone only after mounting
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (!mounted) return; // Skip if not mounted yet
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFile(file);
        setFilePreview(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, image: file }));
      }
    },
  });

  // Mount effect to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only get wallet address after component is mounted
  useEffect(() => {
    if (!mounted) return; // Skip if not mounted yet

    const getAddress = async (): Promise<void> => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Don't auto-connect - wait for user action instead
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Only try to get signer if user has already connected
          if (localStorage.getItem("walletConnected") === "true") {
            try {
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              setUserAddress(address);
            } catch (err) {
              // Silent error - user probably needs to connect manually
              console.log("Wallet not connected yet");
            }
          }
        } catch (err: unknown) {
          console.error("Error getting address:", err);
        }
      }
    };

    getAddress();
  }, [mounted]);

  // Function to connect wallet manually
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        localStorage.setItem("walletConnected", "true");
        setLoading(false);
      } catch (err: unknown) {
        console.error("Failed to connect wallet:", err);
        setError(
          err instanceof Error ? err.message : "Failed to connect wallet"
        );
        setLoading(false);
      }
    } else {
      setError("MetaMask is not installed");
    }
  };

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
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      if (!userAddress) {
        // Try to connect wallet first
        await connectWallet();
        if (!userAddress) {
          throw new Error("Please connect your wallet first");
        }
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
      setFile(null);
      setFilePreview(null);
    } catch (err: unknown) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Return a placeholder during SSR or before hydration
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Loading...</h1>
          </div>
        </div>
      </main>
    );
  }

  const watchedTitle = watch("title") || "";
  const watchedDescription = watch("description") || "";
  const watchedTraits = watch("traits") || "";
  const watchedPrice = watch("price") || "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <Link
        href="/"
        className="absolute top-5 left-5 w-14 hover:scale-110 duration-300 transition-all"
      >
        <MoveLeft />
      </Link>
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300/80" />
            <span className="text-sm text-white/80">Create Your NFT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Turn Your Art Into NFTs
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Create and showcase your digital creations. Set your price and let
            the world discover your art.
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-8">
          <div
            className={`p-4 rounded-lg ${
              userAddress ? "bg-green-500/10" : "bg-yellow-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet
                  className={`w-5 h-5 ${
                    userAddress ? "text-green-400" : "text-yellow-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    userAddress ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {userAddress ? "Wallet Connected" : "Wallet Not Connected"}
                </span>
              </div>
              {!userAddress && (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </button>
              )}
              {userAddress && (
                <div className="text-gray-400 text-sm">
                  <span className="font-normal">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-8">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* File Upload Section */}
                <div>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-colors",
                      "hover:border-white/30 cursor-pointer",
                      isDragActive && "border-emerald-500/50 bg-emerald-500/5"
                    )}
                  >
                    <input
                      {...getInputProps()}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const selectedFile = e.target.files[0];
                          setFile(selectedFile);
                          setFilePreview(URL.createObjectURL(selectedFile));
                          setFormData((prev) => ({
                            ...prev,
                            image: selectedFile,
                          }));
                        }
                      }}
                    />
                    {filePreview ? (
                      <div className="space-y-4">
                        <div className="aspect-square w-48 mx-auto rounded-lg overflow-hidden bg-white/5">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setFilePreview(null);
                            setFormData((prev) => ({ ...prev, image: null }));
                          }}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-6 h-6 text-white/80" />
                        </div>
                        <p className="text-gray-400 text-sm">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Maximum file size: 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title Field */}
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
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    )}
                    placeholder="Give your NFT a name"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description Field */}
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
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20",
                      "resize-none h-24"
                    )}
                    placeholder="Tell the story behind your creation"
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Traits Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Traits (format: key:value, separated by commas)
                  </label>
                  <input
                    id="traits"
                    value={formData.traits.join(", ")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        traits: e.target.value
                          .split(",")
                          .map((trait) => trait.trim()),
                      })
                    }
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                      "text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    )}
                    placeholder="e.g. background:red, rarity:legendary, type:weapon"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: background:red, rarity:legendary, type:weapon
                  </p>
                </div>

                {/* Price Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Price (ETH)
                  </label>
                  <div className="relative">
                    <input
                      id="basePrice"
                      type="number"
                      min="0"
                      step="0.00001"
                      value={formData.basePrice}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-lg p-3",
                        "text-white placeholder-gray-500 focus:outline-none focus:border-white/20",
                        "pr-12"
                      )}
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      ETH
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loading || !userAddress}
                  className={cn(
                    "w-full bg-emerald-500 text-white p-3 rounded-lg",
                    "hover:bg-emerald-500/90 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : !userAddress ? (
                    "Connect Wallet to Create NFT"
                  ) : (
                    "Create NFT"
                  )}
                </button>

                {/* Success/Error Messages */}
                {success && (
                  <div className="text-green-400 p-4 bg-green-400/10 rounded-lg">
                    NFT created successfully!
                  </div>
                )}

                {error && (
                  <div className="text-red-400 p-4 bg-red-400/10 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Info Cards */}
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <p>Payments will be sent to your connected wallet</p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="md:col-span-4">
            <div className="sticky top-4">
              <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-white mb-4">
                  Live Preview
                </h3>
                {filePreview ? (
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5 mb-4">
                    <img
                      src={filePreview}
                      alt="NFT Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-white text-lg font-medium">
                      {formData.name || "NFT Title"}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      {formData.description ||
                        "NFT description will appear here"}
                    </p>
                  </div>
                  {formData.traits[0] && (
                    <div>
                      <h5 className="text-sm text-gray-400 mb-2">Traits</h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.traits.map((trait, index) => {
                          const [key, value] = trait.split(":");
                          return key && value ? (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 rounded-full text-xs text-white"
                            >
                              {key}: {value}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white font-medium">
                        {formData.basePrice
                          ? `${formData.basePrice} ETH`
                          : "0.00 ETH"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Owner</span>
                      <span className="text-white font-medium truncate max-w-[150px]">
                        {userAddress || "Connect wallet to see address"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
