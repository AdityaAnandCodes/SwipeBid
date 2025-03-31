"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MoveLeft,
  RefreshCw,
  Image as ImageIcon,
  PlusCircle,
} from "lucide-react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useConfig,
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

const BidderOwnedNFTsPage = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<NFTListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<
    Record<string, { image: string; description: string }>
  >({});
  const [addingToWallet, setAddingToWallet] = useState<Record<string, boolean>>(
    {}
  );
  const [addStatus, setAddStatus] = useState<Record<string, string>>({});

  const { address, isConnected, connector } = useAccount();
  const config = useConfig();

  // Get won NFTs
  const { data: wonNFTsData, refetch: refetchWonNFTs } = useReadContract({
    address: ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "getWonNFTsDetails",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (wonNFTsData && address) {
      const wonNFTs = wonNFTsData as unknown as NFTListing[];
      console.log("Won NFTs:", wonNFTs);
      setOwnedNFTs(wonNFTs);

      // Fetch metadata for all owned NFTs
      if (wonNFTs.length > 0) {
        fetchNFTMetadata(wonNFTs);
      }

      setIsLoading(false);
    } else if (address) {
      // If no data but address exists, set loading to false
      setIsLoading(false);
    }
  }, [wonNFTsData, address]);

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

  const refreshListings = () => {
    setIsLoading(true);
    refetchWonNFTs();
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

  // Function to add NFT to wallet using wagmi
  // Function to add NFT to wallet using wagmi
  const addNFTToWallet = async (nft: NFTListing) => {
    const tokenId = nft.tokenId.toString();
    try {
      setAddingToWallet((prev) => ({ ...prev, [tokenId]: true }));
      setAddStatus((prev) => ({ ...prev, [tokenId]: "Adding..." }));
      if (!connector) {
        throw new Error("No wallet connector found");
      }
      // Get the connector's provider
      const provider = await connector.getProvider();
      // Check if the provider has the watchAsset method (MetaMask-like)
      if (provider && typeof provider === "object" && "request" in provider) {
        await (provider as { request: (args: any) => Promise<any> }).request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC721",
            options: {
              address: ADDRESS,
              tokenId: tokenId,
              image: getImageUrl(nft),
              name: nft.name,
            },
          },
        });
        setAddStatus((prev) => ({ ...prev, [tokenId]: "Added successfully!" }));
        // Reset status after a delay
        setTimeout(() => {
          setAddStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[tokenId];
            return newStatus;
          });
        }, 3000);
      } else {
        throw new Error("Current wallet does not support adding NFTs");
      }
    } catch (error) {
      console.error("Error adding NFT to wallet:", error);
      setAddStatus((prev) => ({ ...prev, [tokenId]: "Failed to add" }));
      // Reset error status after a delay
      setTimeout(() => {
        setAddStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[tokenId];
          return newStatus;
        });
      }, 3000);
    } finally {
      setAddingToWallet((prev) => ({ ...prev, [tokenId]: false }));
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 text-center mb-8">
            You need to connect your wallet to view your won NFTs.
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
              Your Won NFTs
            </h2>
            <p className="text-gray-400">NFTs you've won in auctions.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400">Loading your NFTs...</p>
            </div>
          ) : ownedNFTs.length === 0 ? (
            <div className="text-center p-12 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-700/50 p-4 rounded-full">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              </div>
              <p className="text-xl mb-6 text-gray-300">
                You haven't won any NFTs yet
              </p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ownedNFTs.map((nft) => {
                const tokenId = nft.tokenId.toString();
                const isAdding = addingToWallet[tokenId];
                const status = addStatus[tokenId];

                return (
                  <div
                    key={tokenId}
                    className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-900/20 hover:translate-y-[-4px] group"
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
                        #{tokenId}
                      </div>
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-700 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {formatEther(nft.highestBid)} ETH
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg truncate group-hover:text-green-400 transition-colors">
                        {nft.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-300 h-12 overflow-hidden line-clamp-2">
                        {getDescription(nft)}
                      </p>

                      <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Won Price: </span>
                          <span className="font-medium bg-gray-700 px-2 py-1 rounded">
                            {formatEther(nft.highestBid)} ETH
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            Original Seller:
                          </span>
                          <span className="font-medium bg-gray-700 px-2 py-1 rounded">
                            {formatAddress(nft.seller)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            window.open(`/nft/${nft.tokenId}`, "_blank")
                          }
                          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => addNFTToWallet(nft)}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 transition-colors duration-200 text-white font-medium flex items-center justify-center gap-2"
                          disabled={isAdding}
                        >
                          <PlusCircle size={20} />
                          {isAdding ? "Adding..." : "Add to Wallet"}
                        </button>
                      </div>

                      {/* Status message */}
                      {status && (
                        <div
                          className={`mt-3 text-xs text-center ${
                            status === "Added successfully!"
                              ? "text-green-500"
                              : status === "Failed to add"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {status}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BidderOwnedNFTsPage;
