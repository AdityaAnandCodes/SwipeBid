"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import BiddingPopUp from "@/components/BiddingPopUp";

// Contract ABI and address
import { ABI, ADDRESS } from "@/lib/constant_contracts";

interface NFTListing {
  tokenId: bigint;
  seller: string;
  name: string;
  description: string;
  imageURI: string;
  traits: string[];
  basePrice: bigint;
  active: boolean;
  highestBidder: string;
  highestBid: bigint;
}

// Adapter interface for BiddingPopUp
interface NFT {
  id: number;
  image: string;
  title: string;
  price: number;
  owner: string;
  description: string;
  traits: Record<string, string>;
  // Additional properties from blockchain
  tokenId: bigint;
  basePrice: bigint;
  highestBid: bigint;
  highestBidder: string;
  seller: string;
  originalTraits: string[];
}

const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const fetchMetadata = async (uri: string) => {
  try {
    if (!uri) throw new Error("NFT URI is undefined");

    const metadataUrl = uri.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`
      : uri;

    console.log("Fetching metadata from:", metadataUrl);

    const response = await fetch(metadataUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch metadata from ${metadataUrl}`);

    const metadata = await response.json();
    console.log("Fetched Metadata:", metadata);

    if (!metadata || !metadata.image)
      throw new Error("Metadata does not contain an image field");

    const imageUrl = metadata.image.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`
      : metadata.image;

    console.log("Extracted Image URL:", imageUrl);

    return {
      image: imageUrl,
      description: metadata.description || "",
      traits: metadata.attributes
        ? metadata.attributes.reduce(
            (
              acc: Record<string, string>,
              attr: { trait_type: string; value: string }
            ) => {
              acc[attr.trait_type] = attr.value;
              return acc;
            },
            {}
          )
        : {},
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
};

const convertToNFTFormat = async (
  nft: NFTListing | undefined
): Promise<NFT | null> => {
  try {
    if (!nft) throw new Error("NFT object is undefined");

    console.log("Initial NFT Data:", nft);

    let imageUrl = nft.imageURI ?? ""; // Ensure it's a string
    let metadataDescription = nft.description ?? "No description available";
    let metadataTraits: Record<string, string> = {};

    console.log("Initial Image URI:", nft.imageURI);

    // Fetch metadata if the imageURI is actually a metadata link
    if (imageUrl.startsWith("ipfs://")) {
      const metadata = await fetchMetadata(imageUrl);
      if (metadata) {
        imageUrl = metadata.image; // Set image from metadata
        metadataDescription = metadata.description;
        metadataTraits = metadata.traits;
      }
    }

    console.log("Final Image URL:", imageUrl);

    return {
      id: Number(nft.tokenId ?? 0), // Default to 0 if undefined
      image: imageUrl,
      title: nft.name ?? "Unknown NFT",
      price: Number(
        formatEther(
          nft.highestBid && nft.highestBid > BigInt(0)
            ? nft.highestBid
            : nft.basePrice ?? BigInt(0)
        )
      ),
      owner: nft.seller ?? "Unknown",
      description: metadataDescription,
      traits: metadataTraits,
      tokenId: nft.tokenId ?? "0",
      basePrice: nft.basePrice ?? BigInt(0),
      highestBid: nft.highestBid ?? BigInt(0),
      highestBidder: nft.highestBidder ?? "Unknown",
      seller: nft.seller ?? "Unknown",
      originalTraits: Array.isArray(nft.traits) ? nft.traits : [],
    };
  } catch (error) {
    console.error("Error in convertToNFTFormat:", error);
    return null;
  }
};

const ExplorePage = () => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ITEMS_PER_PAGE = 12;

  const { address } = useAccount();

  // Get total listings
  const { data: totalListingsData, refetch: refetchTotalListings } =
    useReadContract({
      address: ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getTotalListings",
    });

  // Get active listings for current page
  const { data: activeListingsData, refetch: refetchListings } =
    useReadContract({
      address: ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getActiveListings",
      args: [BigInt(currentPage * ITEMS_PER_PAGE), BigInt(ITEMS_PER_PAGE)],
    });

  useEffect(() => {
    if (totalListingsData) {
      setTotalListings(Number(totalListingsData));
    }
  }, [totalListingsData]);

  useEffect(() => {
    if (activeListingsData) {
      setListings(activeListingsData as unknown as NFTListing[]);
      setIsLoading(false);
    }
  }, [activeListingsData]);

  const openBiddingPopup = async (nft: NFTListing) => {
    const formattedNFT = await convertToNFTFormat(nft);
    setSelectedNFT(formattedNFT);
  };

  const closeBiddingPopup = () => {
    setSelectedNFT(null);
    // Refresh data after popup closes
    refetchListings();
    refetchTotalListings();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setIsLoading(true);
  };

  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">NFT Bidding Platform</h1>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <section>
          <h2 className="text-xl font-semibold mb-6">Explore NFTs</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center p-12 bg-gray-800 rounded-lg">
              <p className="text-xl">No active NFT listings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((nft) => (
                <div
                  key={nft.tokenId.toString()}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-200"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        nft.imageURI.startsWith("ipfs://")
                          ? `https://ipfs.io/ipfs/${nft.imageURI.replace(
                              "ipfs://",
                              ""
                            )}`
                          : nft.imageURI
                      }
                      onError={async (e) => {
                        try {
                          const metadataUrl = nft.imageURI.startsWith("ipfs://")
                            ? `https://ipfs.io/ipfs/${nft.imageURI.replace(
                                "ipfs://",
                                ""
                              )}`
                            : nft.imageURI;

                          console.log("Fetching metadata from:", metadataUrl);

                          const response = await fetch(metadataUrl);
                          if (!response.ok)
                            throw new Error("Failed to fetch metadata");

                          const metadata = await response.json();
                          console.log("Fetched Metadata:", metadata);

                          if (
                            metadata.image &&
                            metadata.image.startsWith("ipfs://")
                          ) {
                            e.target.src = `https://ipfs.io/ipfs/${metadata.image.replace(
                              "ipfs://",
                              ""
                            )}`;
                          } else {
                            e.target.src =
                              metadata.image || "/default-image.png"; // Fallback image
                          }
                        } catch (error) {
                          console.error("Error fetching metadata:", error);
                          e.target.src = "/default-image.png"; // Show default image if fetching fails
                        }
                      }}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded-md text-xs">
                      #{nft.tokenId.toString()}
                    </div>
                    <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded-md text-xs">
                      {formatEther(nft.basePrice)} ETH
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">
                      {nft.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      By {formatAddress(nft.seller)}
                    </p>
                    <p className="mt-2 text-sm h-12 overflow-hidden">
                      {nft.description}
                    </p>

                    <div className="mt-4">
                      <div className="text-xs text-gray-400">
                        <span className="block">Highest bid:</span>
                        <span className="text-green-400 font-medium">
                          {nft.highestBid > BigInt(0)
                            ? `${formatEther(nft.highestBid)} ETH`
                            : "No bids yet"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBiddingPopup(nft)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-gray-800 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="px-4 py-2 bg-gray-800 rounded-md">
                  Page {currentPage + 1} of {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 bg-gray-800 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {selectedNFT && (
        <BiddingPopUp onClose={closeBiddingPopup} nft={selectedNFT} />
      )}
    </div>
  );
};

export default ExplorePage;
