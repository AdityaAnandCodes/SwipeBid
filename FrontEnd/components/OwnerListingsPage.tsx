"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoveLeft, RefreshCw, Image as ImageIcon } from "lucide-react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";

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

    const response = await fetch(metadataUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch metadata from ${metadataUrl}`);

    const metadata = await response.json();

    const imageUrl =
      metadata.image && metadata.image.startsWith("ipfs://")
        ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`
        : metadata.image;

    return {
      image: imageUrl || uri,
      description: metadata.description || "",
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
};

const OwnerListingsPage = () => {
  const [ownerListings, setOwnerListings] = useState<NFTListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [endingBidding, setEndingBidding] = useState(false);
  const [metadata, setMetadata] = useState<
    Record<string, { image: string; description: string }>
  >({});

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const {
    data: txData,
    isPending,
    isSuccess,
    error: txError,
  } = useWaitForTransactionReceipt();

  // Get total listings
  const { data: totalListingsData, refetch: refetchTotalListings } =
    useReadContract({
      address: ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getTotalListings",
    });

  // Get active listings
  const { data: activeListingsData, refetch: refetchActiveListings } =
    useReadContract({
      address: ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getActiveListings",
      args: [BigInt(0), BigInt(100)], // Assuming a reasonable batch size
    });

  useEffect(() => {
    if (activeListingsData && address) {
      const listings = activeListingsData as unknown as NFTListing[];

      // Filter listings by owner
      const ownerNFTs = listings.filter(
        (nft) => nft.seller.toLowerCase() === address.toLowerCase()
      );

      console.log("Owner NFTs:", ownerNFTs);
      setOwnerListings(ownerNFTs);

      // Fetch metadata for all owner NFTs
      if (ownerNFTs.length > 0) {
        fetchNFTMetadata(ownerNFTs);
      }

      setIsLoading(false);
    }
  }, [activeListingsData, address]);

  const fetchNFTMetadata = async (nfts: NFTListing[]) => {
    try {
      const metadataPromises = nfts.map(async (nft) => {
        const data = await fetchMetadata(nft.imageURI);
        return { tokenId: nft.tokenId.toString(), data };
      });

      const metadataResults = await Promise.all(metadataPromises);
      const metadataMap: Record<
        string,
        { image: string; description: string }
      > = {};

      metadataResults.forEach((result) => {
        if (result.data) {
          metadataMap[result.tokenId] = {
            image: result.data.image,
            description: result.data.description,
          };
        }
      });

      setMetadata(metadataMap);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  // Refetch when transaction succeeds
  useEffect(() => {
    if (isSuccess && txData) {
      refetchTotalListings();
      refetchActiveListings();
      setEndingBidding(false);
      setSelectedTokenId(null);
    }
  }, [isSuccess, txData]);

  // Reset state if transaction errors
  useEffect(() => {
    if (txError) {
      console.error("Transaction error:", txError);
      setEndingBidding(false);
      setSelectedTokenId(null);
    }
  }, [txError]);

  const handleEndBidding = async (tokenId: bigint) => {
    try {
      setSelectedTokenId(tokenId);
      setEndingBidding(true);

      const tx = await writeContractAsync({
        address: ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: "endBidding",
        args: [tokenId],
      });

      console.log("Transaction submitted:", tx);

      // If for some reason the transaction completes but useWaitForTransactionReceipt doesn't catch it
      setTimeout(() => {
        if (endingBidding) {
          setEndingBidding(false);
          setSelectedTokenId(null);
          refetchTotalListings();
          refetchActiveListings();
        }
      }, 30000); // 30 second timeout as a fallback
    } catch (error) {
      console.error("Error ending bidding:", error);
      setEndingBidding(false);
      setSelectedTokenId(null);
    }
  };

  const refreshListings = () => {
    setIsLoading(true);
    refetchTotalListings();
    refetchActiveListings();
  };

  const getImageUrl = (nft: NFTListing) => {
    const tokenId = nft.tokenId.toString();
    if (metadata[tokenId] && metadata[tokenId].image) {
      return metadata[tokenId].image;
    }

    // Fallback to IPFS gateway if we have an IPFS URI
    if (nft.imageURI.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${nft.imageURI.replace("ipfs://", "")}`;
    }

    return nft.imageURI || "/default-image.png";
  };

  const getDescription = (nft: NFTListing) => {
    const tokenId = nft.tokenId.toString();
    if (metadata[tokenId] && metadata[tokenId].description) {
      return metadata[tokenId].description;
    }
    return nft.description || "No description available";
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 text-center mb-8">
            You need to connect your wallet to view your NFT listings.
          </p>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <MoveLeft size={20} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="border-b border-gray-800 py-6 px-1 sticky top-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm z-10">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-white flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg transition-all hover:bg-gray-700"
            >
              <MoveLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
              <span className="text-gray-400 mr-2 hidden sm:inline">
                Connected:
              </span>
              <span className="font-medium">{formatAddress(address)}</span>
            </div>
            <button
              onClick={refreshListings}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw
                size={18}
                className={`${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isLoading ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <section>
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              Your Active Listings
            </h2>
            <p className="text-gray-400">Manage and track your listed NFTs.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400">Loading your listings...</p>
            </div>
          ) : ownerListings.length === 0 ? (
            <div className="text-center p-12 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-700/50 p-4 rounded-full">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              </div>
              <p className="text-xl mb-6 text-gray-300">
                You don't have any active NFT listings
              </p>
              <Link
                href="/create"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Create New NFT
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ownerListings.map((nft) => (
                <div
                  key={nft.tokenId.toString()}
                  className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-900/20 hover:translate-y-[-4px] group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(nft)}
                      alt={nft.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image if loading fails
                        (e.target as HTMLImageElement).src =
                          "/default-image.png";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      #{nft.tokenId.toString()}
                    </div>
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-700 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      {formatEther(nft.basePrice)} ETH
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                      {nft.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-300 h-12 overflow-hidden line-clamp-2">
                      {getDescription(nft)}
                    </p>

                    <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Base price: </span>
                        <span className="font-medium bg-gray-700 px-2 py-1 rounded">
                          {formatEther(nft.basePrice)} ETH
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Highest bid: </span>
                        <span
                          className={`font-medium px-2 py-1 rounded ${
                            nft.highestBid > BigInt(0)
                              ? "bg-green-900/50 text-green-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {nft.highestBid > BigInt(0)
                            ? `${formatEther(nft.highestBid)} ETH`
                            : "No bids yet"}
                        </span>
                      </div>

                      {nft.highestBid > BigInt(0) && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Highest bidder:</span>
                          <span className="font-medium bg-gray-700 px-2 py-1 rounded">
                            {formatAddress(nft.highestBidder)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleEndBidding(nft.tokenId)}
                      disabled={
                        endingBidding && selectedTokenId === nft.tokenId
                      }
                      className={`mt-6 w-full py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg ${
                        endingBidding && selectedTokenId === nft.tokenId
                          ? "bg-gray-600 text-gray-300"
                          : nft.highestBid > BigInt(0)
                          ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                          : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                      }`}
                    >
                      {endingBidding && selectedTokenId === nft.tokenId
                        ? "Processing..."
                        : nft.highestBid > BigInt(0)
                        ? "End Bidding & Sell"
                        : "End Bidding & Cancel"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerListingsPage;
