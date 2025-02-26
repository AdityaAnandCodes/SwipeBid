"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import BiddingPopUp from "@/components/BiddingPopUp";
import { motion, PanInfo, useAnimation } from "framer-motion";

// Contract ABI and address
import { ABI, ADDRESS } from "@/lib/constant_contracts";
import {
  Heart,
  X,
  User,
  ArrowUpRight,
  Clock,
  DollarSign,
  Fingerprint,
  LayoutGrid,
  SwatchBook,
  ChevronRight,
  ChevronLeft,
  Info,
  Trophy,
  Cross,
} from "lucide-react";

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

    let imageUrl = nft.imageURI ?? "";
    let metadataDescription = nft.description ?? "No description available";
    let metadataTraits: Record<string, string> = {};

    console.log("Initial Image URI:", nft.imageURI);

    // Fetch metadata if the imageURI is actually a metadata link
    if (imageUrl.startsWith("ipfs://")) {
      const metadata = await fetchMetadata(imageUrl);
      if (metadata) {
        imageUrl = metadata.image;
        metadataDescription = metadata.description;
        metadataTraits = metadata.traits;
      }
    }

    console.log("Final Image URL:", imageUrl);

    return {
      id: Number(nft.tokenId ?? 0),
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
      tokenId: nft.tokenId ?? BigInt(0),
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
  const [allListings, setAllListings] = useState<NFTListing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [completedFirstCycle, setCompletedFirstCycle] = useState(false);
  const [showLoopNotification, setShowLoopNotification] = useState(false);
  const [showTraits, setShowTraits] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

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
      const newListings = activeListingsData as unknown as NFTListing[];
      setListings(newListings);

      // Add to our all listings collection if we're still in first cycle
      if (!completedFirstCycle) {
        setAllListings((prev) => {
          const combined = [...prev, ...newListings];
          // Remove duplicates (by tokenId)
          const uniqueListings = combined.filter(
            (listing, index, self) =>
              index ===
              self.findIndex(
                (l) => l.tokenId.toString() === listing.tokenId.toString()
              )
          );
          return uniqueListings;
        });
      }

      setIsLoading(false);
    }
  }, [activeListingsData, completedFirstCycle]);

  const handleSwipe = async (info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine if this is a left or right swipe based on offset and velocity
    if (offset < -100 || velocity < -500) {
      // Left swipe - show next NFT
      setSwipeDirection("left");
      await controls.start({
        x: -window.innerWidth,
        opacity: 0,
        transition: { duration: 0.3 },
      });
      showNextNFT();
    } else if (offset > 100 || velocity > 500) {
      // Right swipe - open bidding popup
      setSwipeDirection("right");
      await controls.start({
        x: window.innerWidth,
        opacity: 0,
        transition: { duration: 0.3 },
      });
      const currentNFT = getCurrentNFT();
      if (currentNFT) {
        const formattedNFT = await convertToNFTFormat(currentNFT);
        setSelectedNFT(formattedNFT);
      }
    } else {
      // Reset if it wasn't a strong enough swipe
      controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } });
    }
  };

  const showNextNFT = () => {
    if (currentIndex < listings.length - 1) {
      // Still have NFTs in the current page
      setCurrentIndex(currentIndex + 1);
    } else if (
      currentPage < Math.ceil(totalListings / ITEMS_PER_PAGE) - 1 &&
      !completedFirstCycle
    ) {
      // Need to load next page (during first cycle)
      setCurrentPage(currentPage + 1);
      setCurrentIndex(0);
      setIsLoading(true);
    } else {
      // We've reached the end of available NFTs
      if (!completedFirstCycle) {
        // Completed the first cycle through all NFTs
        setCompletedFirstCycle(true);
        setShowLoopNotification(true);
        setTimeout(() => setShowLoopNotification(false), 3000);
      }

      // Reset to the beginning with all collected NFTs
      setCurrentIndex(0);
      setListings(allListings);

      // Show notification about looping
      setShowLoopNotification(true);
      setTimeout(() => setShowLoopNotification(false), 3000);
    }

    // Reset traits view
    setShowTraits(false);

    // Reset the card position
    controls.start({ x: 0, opacity: 1, transition: { duration: 0 } });
    // Clear swipe direction
    setSwipeDirection(null);
  };

  const closeBiddingPopup = () => {
    setSelectedNFT(null);
    showNextNFT(); // Move to the next NFT after closing the popup
    // Refresh data
    refetchListings();
    refetchTotalListings();
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    handleSwipe(info);
  };

  const getCurrentNFT = () => {
    return listings[currentIndex];
  };

  // Get highest bid info string
  const getHighestBidInfo = (nft: NFTListing | undefined) => {
    if (!nft) return "No bids yet";

    if (nft.highestBid && nft.highestBid > BigInt(0)) {
      return `${formatEther(nft.highestBid)} ETH by ${formatAddress(
        nft.highestBidder
      )}`;
    }

    return "No bids yet";
  };

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex justify-center space-x-8 z-10">
        <button
          onClick={async () => {
            setSwipeDirection("left");
            await controls.start({
              x: -window.innerWidth,
              opacity: 0,
              transition: { duration: 0.3 },
            });
            showNextNFT();
          }}
          className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-2 border-red-300"
          aria-label="Pass"
        >
          <Cross className="text-white fill-current rotate-45 w-8 h-8" />
        </button>
        <button
          onClick={async () => {
            setSwipeDirection("right");
            await controls.start({
              x: window.innerWidth,
              opacity: 0,
              transition: { duration: 0.3 },
            });
            const currentNFT = getCurrentNFT();
            if (currentNFT) {
              const formattedNFT = await convertToNFTFormat(currentNFT);
              setSelectedNFT(formattedNFT);
            }
          }}
          className="bg-green-400 rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-2 border-green-200"
          aria-label="Bid"
        >
          <Heart className="text-white w-8 h-8 fill-white" />
        </button>
      </div>
    );
  };

  // Overlay indicators for swipe direction
  const renderSwipeOverlay = () => {
    if (!swipeDirection) return null;

    return (
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          swipeDirection === "left" ? "bg-gray-800/50" : "bg-gray-800/50"
        } z-20 rounded-3xl`}
      >
        <div
          className={`transform rotate-12 border-8 ${
            swipeDirection === "left"
              ? "border-white text-white"
              : "border-white text-white"
          } rounded-lg p-4`}
        >
          <span className="text-4xl font-extrabold flex items-center">
            {swipeDirection === "left" ? (
              <>
                <Cross className="fill-white text-5xl rotate-45" /> PASS
              </>
            ) : (
              <>
                <Heart className="mr-2 fill-white" /> BID
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

  // Render NFT traits
  const renderNFTTraits = (nft: NFTListing | undefined) => {
    if (!nft || !nft.traits || nft.traits.length === 0) {
      return (
        <div className="text-gray-400 text-center py-4 flex items-center justify-center">
          <Info className="w-4 h-4 mr-2" />
          <span>No traits available for this NFT</span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 p-4">
        {nft.traits.map((trait, index) => (
          <div
            key={index}
            className="bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm"
          >
            <p className="text-xs text-gray-400 flex items-center">
              <SwatchBook className="w-3 h-3 mr-1" /> Trait {index + 1}
            </p>
            <p className="text-sm font-medium text-white truncate">{trait}</p>
          </div>
        ))}
      </div>
    );
  };

  const currentNFT = getCurrentNFT();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <main className="container mx-auto py-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-md h-full flex flex-col items-center justify-center relative mt-4">
          {/* Loop notification */}
          {showLoopNotification && (
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center">
              <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg animate-pulse border border-gray-700 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                <p className="text-sm font-semibold">
                  Starting over with all available NFTs
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
              <p className="text-gray-400">Loading NFTs...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center p-12 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md border border-gray-700">
              <Info className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl">No active NFT listings found</p>
              <p className="text-sm text-gray-400 mt-2">
                Check back later for new listings
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md h-full relative">
              {/* Progress bar */}
              <div className="absolute -top-6 left-0 right-0 z-10">
                <div className="bg-gray-800/80 h-1 w-full rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300 ease-out"
                    style={{
                      width: `${(currentIndex / (listings.length - 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <motion.div
                ref={cardRef}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ x: 0, opacity: 1 }}
                className="w-full h-full relative"
              >
                <div className="w-full bg-gray-800/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700 shadow-2xl h-[650px] relative">
                  {/* Swipe overlay */}
                  {renderSwipeOverlay()}

                  {/* NFT Image */}
                  <div className="h-3/5 overflow-hidden relative">
                    <img
                      src={
                        currentNFT?.imageURI.startsWith("ipfs://")
                          ? `https://ipfs.io/ipfs/${currentNFT.imageURI.replace(
                              "ipfs://",
                              ""
                            )}`
                          : currentNFT?.imageURI
                      }
                      onError={async (e) => {
                        try {
                          const metadataUrl = currentNFT?.imageURI.startsWith(
                            "ipfs://"
                          )
                            ? `https://ipfs.io/ipfs/${currentNFT.imageURI.replace(
                                "ipfs://",
                                ""
                              )}`
                            : currentNFT?.imageURI;

                          if (!metadataUrl) throw new Error("No metadata URL");

                          const response = await fetch(metadataUrl);
                          if (!response.ok)
                            throw new Error("Failed to fetch metadata");

                          const metadata = await response.json();

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
                              metadata.image || "/default-image.png";
                          }
                        } catch (error) {
                          console.error("Error fetching metadata:", error);
                          e.target.src = "/default-image.png";
                        }
                      }}
                      alt={currentNFT?.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay gradient for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>

                    {/* Card badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Fingerprint className="w-3 h-3 mr-1" />
                        <span>#{currentNFT?.tokenId.toString()}</span>
                      </div>

                      <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {formatEther(currentNFT?.basePrice || BigInt(0))} ETH
                        </span>
                      </div>
                    </div>

                    {/* Navigation arrows for manual browsing */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-4">
                      <button
                        onClick={async () => {
                          if (currentIndex > 0) {
                            setCurrentIndex(currentIndex - 1);
                            setShowTraits(false);
                          }
                        }}
                        disabled={currentIndex === 0}
                        className={`bg-black/50 p-2 rounded-full ${
                          currentIndex === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-black/70"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 right-4">
                      <button
                        onClick={async () => {
                          if (currentIndex < listings.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setShowTraits(false);
                          }
                        }}
                        disabled={currentIndex === listings.length - 1}
                        className={`bg-black/50 p-2 rounded-full ${
                          currentIndex === listings.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-black/70"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Bid status badge */}
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
                      {currentNFT?.highestBid &&
                      currentNFT?.highestBid > BigInt(0) ? (
                        <span className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-white" />
                          <span>Bidding Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-white" />
                          <span>No Bids Yet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="p-6 h-2/5 flex flex-col justify-between">
                    {!showTraits ? (
                      <>
                        <div>
                          <div className="flex justify-between items-start">
                            <h2 className="font-bold text-2xl">
                              {currentNFT?.name}
                            </h2>
                            <div className="flex items-center space-x-1 text-gray-400">
                              <User className="h-4 w-4" />
                              <span className="text-sm">
                                {formatAddress(currentNFT?.seller || "")}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 text-gray-300 line-clamp-2">
                            {currentNFT?.description}
                          </p>
                        </div>

                        <div className="mt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-400 flex items-center">
                                <Trophy className="w-3 h-3 mr-1" /> Highest bid
                              </p>
                              <p className="text-lg font-semibold text-white">
                                {getHighestBidInfo(currentNFT)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-400 flex items-center justify-end">
                                <Fingerprint className="w-3 h-3 mr-1" />{" "}
                                Position
                              </p>
                              <p className="text-lg font-semibold">
                                {currentIndex + 1} / {listings.length}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowTraits(true)}
                            className="w-full py-2 bg-gray-700/60 hover:bg-gray-700/80 backdrop-blur-sm rounded-lg text-sm font-medium transition flex items-center justify-center"
                          >
                            <SwatchBook className="w-4 h-4 mr-2" /> View NFT
                            Traits
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                            <h3 className="font-bold flex items-center">
                              <SwatchBook className="w-4 h-4 mr-2" /> NFT Traits
                            </h3>
                            <button
                              onClick={() => setShowTraits(false)}
                              className="text-sm text-gray-400 hover:text-white transition flex items-center"
                            >
                              <Info className="w-3 h-3 mr-1" /> Back to details
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {renderNFTTraits(currentNFT)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Action buttons - now moved outside */}
              {renderActionButtons()}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-16 text-center text-gray-400 flex items-center justify-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowUpRight className="h-4 w-4" />
            <p>Swipe left to pass, swipe right to place a bid</p>
          </div>
        </div>
      </main>

      {selectedNFT && (
        <BiddingPopUp onClose={closeBiddingPopup} nft={selectedNFT} />
      )}
    </div>
  );
};

export default ExplorePage;
