"use client";

import { useState, useEffect } from "react";
import { X, Info, User, FileText, Award } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";

// Contract configuration
import { ABI, ADDRESS } from "@/lib/constant_contracts";
import { NFT } from "@/types/nft";

interface BiddingPopUpProps {
  onClose: () => void;
  nft: NFT;
}

const formatAddress = (address: string) => {
  if (!address) return "Unknown";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const BiddingPopUp = ({ onClose, nft }: BiddingPopUpProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  console.log("NFT in BiddingPopUp:", nft); // Debug log

  const { address } = useAccount();

  // Place bid
  const { writeContract: placeBid, data: placeBidHash } = useWriteContract();

  // Wait for bid transaction to complete
  const { isSuccess: isBidSuccess, isError: isBidError } =
    useWaitForTransactionReceipt({
      hash: placeBidHash,
    });

  useEffect(() => {
    if (isBidSuccess) {
      setIsLoading(false);
      onClose();
    }
    if (isBidError) {
      setIsLoading(false);
      alert("Transaction failed. Please try again.");
    }
  }, [isBidSuccess, isBidError, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Safely ensure we have valid basePrice and highestBid values
    const currentBasePrice = nft.basePrice
      ? Number(formatEther(nft.basePrice))
      : 0.001;
    const currentHighestBid =
      nft.highestBid && nft.highestBid > BigInt(0)
        ? Number(formatEther(nft.highestBid))
        : 0;

    const bidAmountEth = parseFloat(bidAmount);

    // Validation with proper error messages
    if (isNaN(bidAmountEth)) {
      alert("Please enter a valid bid amount");
      return;
    }

    if (bidAmountEth < currentBasePrice) {
      alert(`Bid must be at least ${currentBasePrice} ETH (base price)`);
      return;
    }

    if (currentHighestBid > 0 && bidAmountEth <= currentHighestBid) {
      alert(
        `Bid must be higher than current highest bid (${currentHighestBid} ETH)`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Place bid with proper tokenId conversion
      placeBid({
        address: ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: "placeBid",
        args: [
          typeof nft.tokenId === "bigint" ? nft.tokenId : BigInt(nft.tokenId),
        ],
        value: parseEther(bidAmount),
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      setIsLoading(false);
      alert("Failed to place bid. Please try again.");
    }
  };

  // Safely calculate the minimum bid with null checks
  const minimumBid = (() => {
    // Always ensure we have a valid basePrice
    const basePrice = nft.basePrice ? formatEther(nft.basePrice) : "0.001";

    // If there's a valid highest bid, add a small increment
    if (nft.highestBid && nft.highestBid > BigInt(0)) {
      try {
        // Add 0.01 ETH to the current highest bid
        return formatEther(nft.highestBid + parseEther("0.01"));
      } catch (error) {
        return basePrice; // Fallback to basePrice if formatting fails
      }
    }

    // Otherwise use the basePrice
    return basePrice;
  })();

  // Fallback/default values for missing NFT data
  const nftId = nft?.id || 0;
  const nftImage = nft?.image || "/placeholder.png";
  const nftTitle = nft?.title || "Untitled NFT";
  const nftOwner = nft?.owner || nft?.seller || address || "Unknown";
  const nftDescription = nft?.description || "No description available";
  const nftTraits = nft?.traits || {};

  return (
    <section
      className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-[95%] max-w-[1000px] h-auto max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden shadow-lg relative border border-gray-800">
        {/* Header with title and close button */}
        <div className="flex items-center justify-between bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            NFT Details
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 sm:p-2 rounded-full transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content container with scrolling */}
        <div className="h-[calc(90vh-60px)] sm:h-[calc(90vh-70px)] overflow-y-auto py-4 sm:py-6 px-4 sm:px-6">
          {/* Main content flex container */}
          <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
            {/* Left column - NFT Image with proper aspect ratio handling */}
            <div className="lg:w-1/2 flex-shrink-0">
              <div className="relative w-full rounded-lg overflow-hidden bg-gray-800 shadow-md border border-gray-700">
                {/* Image container with fixed aspect ratio and adaptive fitting */}
                <div className="relative w-full pt-[100%]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="animate-pulse w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-500 border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={nftImage}
                    alt={nftTitle}
                    className={`absolute inset-0 w-full h-full object-contain p-2 sm:p-4 transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      setImageLoaded(true); // Still mark as loaded to remove spinner
                    }}
                  />
                </div>

                {/* NFT ID badge */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-900 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm text-white font-mono border border-gray-700">
                  #{nftId?.toString() || "N/A"}
                </div>
              </div>

              {/* NFT traits in grid */}
              <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                {Object.entries(nftTraits).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-800 p-2 sm:p-3 rounded-md border border-gray-700"
                  >
                    <p className="capitalize text-gray-400 text-xs mb-1">
                      {key}
                    </p>
                    <p className="font-medium text-white truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - NFT Details and Bidding */}
            <div className="lg:w-1/2 text-white flex flex-col gap-4 sm:gap-5 mt-4 lg:mt-0">
              {/* NFT Title and Price */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {nftTitle || "Untitled NFT"}
                  </h2>
                  <div className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-800 rounded-md text-xs sm:text-sm font-medium border border-gray-700">
                    Base:{" "}
                    <span className="text-blue-400">
                      {nft.basePrice !== undefined
                        ? `${formatEther(nft.basePrice)} ETH`
                        : "0.001 ETH"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-xs sm:text-sm text-gray-300 gap-2">
                  <User size={12} className="sm:hidden" />
                  <User size={14} className="hidden sm:block" />
                  <span>Owner:</span>
                  <span className="font-mono bg-gray-800 px-2 py-0.5 sm:py-1 rounded text-gray-300">
                    {formatAddress(nftOwner)}
                  </span>
                </div>
              </div>

              {/* NFT Description */}
              <div className="bg-gray-800 p-3 sm:p-4 rounded-md border border-gray-700">
                <h3 className="text-sm sm:text-md font-semibold mb-1.5 sm:mb-2 flex items-center">
                  <FileText
                    size={12}
                    className="mr-1.5 text-gray-400 sm:hidden"
                  />
                  <FileText
                    size={14}
                    className="mr-2 text-gray-400 hidden sm:block"
                  />
                  Description
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {nftDescription}
                </p>
              </div>

              {/* Current highest bidder info */}
              {nft.highestBidder &&
                nft.highestBidder !==
                  "0x0000000000000000000000000000000000000000" &&
                nft.highestBid &&
                nft.highestBid > BigInt(0) && (
                  <div className="p-3 sm:p-4 bg-gray-800 rounded-md border border-gray-700">
                    <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 flex items-center">
                      <Award
                        size={12}
                        className="mr-1.5 text-gray-400 sm:hidden"
                      />
                      <Award
                        size={14}
                        className="mr-2 text-gray-400 hidden sm:block"
                      />
                      Current Highest Bidder
                    </h3>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-md">
                      <span className="font-mono text-xs sm:text-sm">
                        {formatAddress(nft.highestBidder)}
                      </span>
                      <span className="text-white font-medium bg-blue-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm">
                        {`${formatEther(nft.highestBid)} ETH`}
                      </span>
                    </div>
                  </div>
                )}

              {/* Bidding UI */}
              <div className="p-3 sm:p-4 bg-gray-800 rounded-md border border-gray-700">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Place a Bid
                  </h3>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Current bid:
                      <span className="text-white ml-1 font-medium">
                        {nft.highestBid !== undefined &&
                        nft.highestBid > BigInt(0)
                          ? `${formatEther(nft.highestBid)} ETH`
                          : "No bids yet"}
                      </span>
                    </p>
                  </div>
                </div>

                {!address ? (
                  <div className="text-center p-3 sm:p-4 border border-gray-700 rounded-md bg-gray-700">
                    <p className="mb-2 sm:mb-3 text-xs sm:text-sm">
                      Connect your wallet to place a bid
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md font-medium transition-colors duration-200 text-xs sm:text-sm">
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  /* Bidding form */
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-2 sm:space-y-3"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter at least ${minimumBid} ETH`}
                        className="w-full bg-gray-700 border border-gray-600 p-2 sm:p-3 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white pr-10 sm:pr-12 text-sm"
                        disabled={isLoading}
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        ETH
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center text-sm"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                          Processing...
                        </>
                      ) : (
                        "Place Bid"
                      )}
                    </button>

                    <p className="text-xs text-gray-400 flex items-center justify-center">
                      <Info size={10} className="mr-1" />
                      Minimum bid:{" "}
                      <span className="font-mono ml-1 text-blue-400">
                        {minimumBid} ETH
                      </span>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiddingPopUp;
