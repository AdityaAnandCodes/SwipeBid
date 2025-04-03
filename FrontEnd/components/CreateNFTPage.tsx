"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import {
  Sparkles,
  ImageIcon,
  Loader2,
  Wallet,
  MoveLeft,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseEther } from "viem";
import { ADDRESS, ABI } from "@/lib/constant_contracts";
import Link from "next/link";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

// Define PixelsJS types
declare global {
  interface Window {
    pixelsJS: {
      filterImg: (img: HTMLImageElement, filter: string) => HTMLCanvasElement;
      filterImgData: (imgData: ImageData, filter: string) => ImageData;
      getFilterList: () => string[];
    };
  }
}

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
  selectedFilter: string | null;
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

// working-filters.ts
// List of validated working filters for PixelsJS

// Define filter categories with working filters
const filterCategories = {
  "Offset & Lines": [
    "offset",
    "offset_blue",
    "offset_green",
    "extra_offset_blue",
    "extra_offset_red",
    "extra_offset_green",
    "extreme_offset_red",
    "extreme_offset_blue",
    "extreme_offset_green",
    "horizontal_lines",
    "diagonal_lines",
    "green_diagonal_lines",
    "pane",
  ],
  "Color Tones": [
    "sunset",
    "mellow",
    "warmth",
    "cool_twilight",
    "blues",
    "bluescale",
    "purplescale",
    "crimson",
    "teal_min_noise",
    "coral",
    "lemon",
    "pink_aura",
    "rosetint",
    "pink_min_noise",
    "dark_purple_min_noise",
    "horizon",
    "ocean",
    "serenity",
  ],
  "Vintage & Effects": [
    "vintage",
    "wood",
    "perfume",
    "solange",
    "solange_dark",
    "solange_grey",
    "neue",
    "twenties",
    "matrix",
    "matrix2",
    "lix",
    "ryo",
    "eon",
    "aeon",
    "zapt",
    "phase",
    "retroviolet",
  ],
  "Specks & Noise": [
    "specks",
    "green_specks",
    "specks_redscale",
    "min_noise",
    "green_min_noise",
    "green_med_noise",
    "blue_min_noise",
    "red_min_noise",
    "purple_min_noise",
    "haze",
    "grime",
  ],
  "Casino & Special": [
    "casino",
    "yellow_casino",
    "eclectic",
    "radio",
    "cosmic",
    "frontward",
    "evening",
    "darkify",
    "incbrightness",
    "incbrightness2",
    "invert",
    "sat_adj",
    "pixel_blue",
    "greyscale",
    "redgreyscale",
    "greengreyscale",
    "a", // Not sure what this filter does, but included as per your list
  ],
};

export default function CreateNFTPage({
  address = ADDRESS,
  abi = ABI,
}: CreateNFTTutorialProps) {
  // Client-side only state
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filteredPreview, setFilteredPreview] = useState<string | null>(null);
  const [filterList, setFilterList] = useState<string[]>([]);
  const [pixelsJSLoaded, setPixelsJSLoaded] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    traits: [""],
    basePrice: "",
    image: null,
    selectedFilter: null,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);

  // Reference to the preview image for applying filters
  const imgRef = useRef<HTMLImageElement>(null);

  // Wagmi hooks - only initialize these on the client side
  const { address: userAddress, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    status: writeStatus,
  } = useWriteContract();
  type FilterCategoryKey = keyof typeof filterCategories;

  // Only call this hook if hash exists
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: hash || undefined,
    });

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

  // Determine if any loading state is active
  const loading = isConnectPending || isWritePending || isConfirming;
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );

  // Update your useEffect for file upload to set the original image:
  useEffect(() => {
    if (filePreview) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = filePreview;
      img.onload = () => {
        setOriginalImage(img);
      };
    }
  }, [filePreview]);

  // Initialize dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".avif"],
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFile(file);

        // Clean up any previous blob URLs
        if (filePreview) {
          URL.revokeObjectURL(filePreview);
        }
        if (filteredPreview && filteredPreview !== filePreview) {
          URL.revokeObjectURL(filteredPreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
        setFilteredPreview(previewUrl); // Initially, filtered preview is same as original

        // Reset these other values
        setFormData((prev) => ({
          ...prev,
          image: file,
          selectedFilter: null,
        }));

        // The originalImage will be set by the useEffect that watches filePreview
      }
    },
    disabled: !mounted, // Disable if not mounted
  });

  useEffect(() => {
    return () => {
      // Clean up all URL objects when component unmounts
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      if (filteredPreview && filteredPreview !== filePreview) {
        URL.revokeObjectURL(filteredPreview);
      }
    };
  }, []);

  // Load PixelsJS script
  useEffect(() => {
    if (mounted && !pixelsJSLoaded) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/silvia-odwyer/pixels.js@0.8.1/dist/Pixels.js";
      script.async = true;
      script.onload = () => {
        setPixelsJSLoaded(true);
        if (window.pixelsJS && window.pixelsJS.getFilterList) {
          setFilterList(window.pixelsJS.getFilterList());
        }
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [mounted]);

  // Mount effect to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset success state when hash changes
  useEffect(() => {
    if (hash) {
      setSuccess(false);
    }
  }, [isConfirmed]);

  // Set success when confirmed
  useEffect(() => {
    if (isConfirmed) {
      setSuccess(true);
      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        traits: [""],
        basePrice: "",
        image: null,
        selectedFilter: null,
      });
      setFile(null);
      setFilePreview(null);
      setFilteredPreview(null);
    }
  }, [isConfirmed]);

  // Clean up URL objects when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      if (filteredPreview && filteredPreview !== filePreview) {
        URL.revokeObjectURL(filteredPreview);
      }
    };
  }, [filePreview, filteredPreview]);

  // Apply filter to image
  // Find the applyFilter function around line 238
  const applyFilter = (filterName: string) => {
    if (!pixelsJSLoaded || !originalImage) return;

    try {
      // Create a canvas to work with
      const canvas = document.createElement("canvas");
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext("2d");
      window.pixelsJS.getFilterList();

      if (ctx) {
        // Draw the original image to the canvas
        ctx.drawImage(originalImage, 0, 0);

        try {
          // Try using filterImg first (more reliable)
          const filteredCanvas = window.pixelsJS.filterImg(
            originalImage,
            filterName
          );

          // Clean up previous filtered preview if it exists
          if (filteredPreview && filteredPreview !== filePreview) {
            URL.revokeObjectURL(filteredPreview);
          }

          // Create new blob and URL from the filtered canvas
          filteredCanvas.toBlob((blob) => {
            if (blob) {
              const newFilteredPreview = URL.createObjectURL(blob);
              setFilteredPreview(newFilteredPreview);
              setFormData((prev) => ({
                ...prev,
                selectedFilter: filterName,
              }));
            }
          }, "image/jpeg");
        } catch (err) {
          // Fallback to filterImgData if filterImg fails
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          try {
            const filteredImgData = window.pixelsJS.filterImgData(
              imgData,
              filterName
            );
            ctx.putImageData(filteredImgData, 0, 0);

            // Clean up previous filtered preview if it exists
            if (filteredPreview && filteredPreview !== filePreview) {
              URL.revokeObjectURL(filteredPreview);
            }

            // Create new blob and URL
            canvas.toBlob((blob) => {
              if (blob) {
                const newFilteredPreview = URL.createObjectURL(blob);
                setFilteredPreview(newFilteredPreview);
                setFormData((prev) => ({
                  ...prev,
                  selectedFilter: filterName,
                }));
              }
            }, "image/jpeg");
          } catch (innerErr) {
            console.error(`Filter '${filterName}' is not supported:`, innerErr);
            setError(`Filter '${filterName}' is not supported.`);
          }
        }
      }
    } catch (err) {
      console.error("Error applying filter:", err);
      setError(`Failed to apply filter '${filterName}'. Please try another.`);
    }
  };

  // Simplified reset filter function
  // Simplified reset filter function
  // Reset filter by creating a new blob from the original image
  const resetFilter = () => {
    if (!originalImage) return;

    // Create a canvas to work with
    const canvas = document.createElement("canvas");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw the original image to the canvas
      ctx.drawImage(originalImage, 0, 0);

      // Clean up previous filtered preview if it exists and is different
      if (filteredPreview && filteredPreview !== filePreview) {
        URL.revokeObjectURL(filteredPreview);
      }

      // Create a new blob URL from the canvas
      canvas.toBlob((blob) => {
        if (blob) {
          const newPreview = URL.createObjectURL(blob);
          setFilteredPreview(newPreview);
          setFormData((prev) => ({
            ...prev,
            selectedFilter: null,
          }));
        }
      }, "image/jpeg");
    }
  };

  // Convert filtered image to File object for upload
  const filteredImageToFile = async (): Promise<File | null> => {
    if (!filteredPreview || !file) return null;

    try {
      // Fetch the data URL
      const response = await fetch(filteredPreview);
      const blob = await response.blob();

      // Create a new file with the filtered image
      return new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
    } catch (err) {
      console.error("Error converting filtered image to file:", err);
      return null;
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

  const connectWallet = async () => {
    try {
      // Find the first available connector (likely MetaMask)
      const connector = connectors?.[0];
      if (connector) {
        connect({ connector });
      } else {
        throw new Error("No wallet connectors available");
      }
    } catch (err: unknown) {
      console.error("Failed to connect wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      if (!isConnected || !userAddress) {
        throw new Error("Please connect your wallet first");
      }

      if (!formData.image) {
        throw new Error("Please select an image file");
      }

      // 1. Get the filtered image file if a filter was applied
      let imageToUpload: File | null = formData.image;
      if (formData.selectedFilter) {
        const filteredFile = await filteredImageToFile();
        if (filteredFile) {
          imageToUpload = filteredFile;
        } else {
          throw new Error("Failed to process filtered image");
        }
      }

      // 2. Upload image to IPFS
      console.log("Uploading image to Pinata...");
      const imageUrls = await uploadToPinata(imageToUpload);
      console.log("Image uploaded:", imageUrls);

      // 3. Create metadata
      const metadata: NFTMetadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrls.ipfsUrl, // Use IPFS URL in metadata
        attributes: [
          // Add filter as a trait if one was selected
          ...(formData.selectedFilter
            ? [{ trait_type: "Filter", value: formData.selectedFilter }]
            : []),
          // Add other traits
          ...(formData.traits || [])
            .filter((trait) => trait.trim() !== "")
            .map((trait) => {
              const [key, value] = trait.split(":").map((part) => part.trim());
              return {
                trait_type: key || "Trait",
                value: value || "Value",
              };
            }),
        ],
      };

      // 4. Upload metadata to IPFS
      console.log("Uploading metadata to Pinata...");
      const metadataUrls = await uploadMetadataToPinata(metadata);
      console.log("Metadata uploaded:", metadataUrls);

      // 5. Create NFT on blockchain using wagmi
      // Safely handle empty price strings
      const priceString = formData.basePrice.trim() || "0";
      const priceInWei = parseEther(priceString);

      // Check if address is valid and in the expected format
      const nftAddress = address as `0x${string}`;

      writeContract({
        address: nftAddress,
        abi,
        functionName: "createNFT",
        args: [
          formData.name,
          formData.description,
          metadataUrls.ipfsUrl,
          (formData.traits || []).filter((t) => t.trim() !== ""),
          priceInWei,
        ],
      });
    } catch (err: unknown) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
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
              isConnected ? "bg-green-500/10" : "bg-yellow-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet
                  className={`w-5 h-5 ${
                    isConnected ? "text-green-400" : "text-yellow-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    isConnected ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
                </span>
              </div>
              {!isConnected && (
                <button
                  onClick={connectWallet}
                  disabled={isConnectPending}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {isConnectPending ? (
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
                    <input {...getInputProps()} />
                    {filePreview ? (
                      <div className="space-y-4">
                        <div className="aspect-square w-48 mx-auto rounded-lg overflow-hidden bg-white/5">
                          {/* Keep a reference to the original image but hidden */}
                          <img
                            ref={imgRef}
                            src={filePreview}
                            alt="Original Preview"
                            className="w-full h-full object-cover hidden"
                          />
                          {/* Make sure we're checking both filtered and original */}
                          <img
                            src={filteredPreview || filePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          {/* <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setFilePreview(null);
                              setFilteredPreview(null);
                              setFormData((prev) => ({
                                ...prev,
                                image: null,
                                selectedFilter: null,
                              }));
                            }}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Remove file
                          </button> */}
                          {pixelsJSLoaded && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowFilterPanel(!showFilterPanel);
                              }}
                              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <Wand2 className="w-3 h-3" />
                              {showFilterPanel
                                ? "Hide Filters"
                                : "Apply Filters"}
                            </button>
                          )}
                          {formData.selectedFilter && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetFilter();
                              }}
                              className="text-sm text-amber-400 hover:text-amber-300"
                            >
                              Reset Filter
                            </button>
                          )}
                        </div>
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
                {showFilterPanel && filePreview && pixelsJSLoaded && (
                  <div className="bg-black/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Apply Filters
                    </h3>

                    <div className="space-y-4">
                      {(() => {
                        const categoryKeys = Object.keys(
                          filterCategories
                        ) as FilterCategoryKey[];

                        return (
                          <>
                            {/* Category selector */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                              {categoryKeys.map((category, index) => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => {
                                    setCurrentCategoryIndex(index);
                                    setCurrentFilterIndex(0);
                                  }}
                                  className={cn(
                                    "px-3 py-2 text-xs rounded-lg text-center",
                                    currentCategoryIndex === index
                                      ? "bg-blue-600 text-white"
                                      : "bg-white/10 text-white hover:bg-white/20"
                                  )}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>

                            {/* Filter grid replacing the carousel */}
                            <div className="mt-4">
                              <h4 className="text-xs text-gray-300 mb-2">
                                Select a filter:
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {filterCategories[
                                  categoryKeys[currentCategoryIndex]
                                ].map((filter) => (
                                  <button
                                    key={filter}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyFilter(filter);
                                    }}
                                    className={cn(
                                      "px-3 py-2 text-xs rounded-lg",
                                      formData.selectedFilter === filter
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                  >
                                    {filter}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Title Field */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Title
                  </label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                      onChange={(e) =>
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
                  disabled={isWritePending || isConfirming || !isConnected}
                  className={cn(
                    "w-full bg-emerald-500 text-white p-3 rounded-lg",
                    "hover:bg-emerald-500/90 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isWritePending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isWritePending ? "Creating..." : "Confirming..."}
                    </>
                  ) : !isConnected ? (
                    "Connect Wallet to Create NFT"
                  ) : (
                    "Create NFT"
                  )}
                </button>

                {/* Transaction Status */}
                {hash && (
                  <div className="text-green-400 p-4 bg-green-400/10 rounded-lg">
                    {isConfirming && <div>Waiting for confirmation...</div>}
                    {isConfirmed && <div>NFT created successfully!</div>}
                  </div>
                )}

                {/* Error Messages */}
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
                      src={filteredPreview || filePreview}
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
                          if (!trait.trim()) return null;
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
                        {userAddress
                          ? `${userAddress.slice(0, 6)}...${userAddress.slice(
                              -4
                            )}`
                          : "Connect wallet to see address"}
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
