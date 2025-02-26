"use client";

import { useState, useEffect } from "react";
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
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 text-center max-w-md">
          You need to connect your wallet to view your NFT listings.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My NFT Listings</h1>
          <button
            onClick={refreshListings}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Active Listings</h2>
            <div className="text-sm text-gray-400">
              Connected as: {formatAddress(address)}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : ownerListings.length === 0 ? (
            <div className="text-center p-12 bg-gray-800 rounded-lg">
              <p className="text-xl mb-4">
                You don't have any active NFT listings
              </p>
              <a
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Create New NFT
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerListings.map((nft) => (
                <div
                  key={nft.tokenId.toString()}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-200"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(nft)}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image if loading fails
                        (e.target as HTMLImageElement).src =
                          "/default-image.png";
                      }}
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
                    <p className="mt-2 text-sm h-12 overflow-hidden">
                      {getDescription(nft)}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-400">Base price: </span>
                        <span className="font-medium">
                          {formatEther(nft.basePrice)} ETH
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-400">Highest bid: </span>
                        <span className="text-green-400 font-medium">
                          {nft.highestBid > BigInt(0)
                            ? `${formatEther(nft.highestBid)} ETH`
                            : "No bids yet"}
                        </span>
                      </div>

                      {nft.highestBid > BigInt(0) && (
                        <div className="text-sm">
                          <span className="text-gray-400">
                            Highest bidder:{" "}
                          </span>
                          <span className="font-medium">
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
                      className={`mt-4 w-full ${
                        nft.highestBid > BigInt(0)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
