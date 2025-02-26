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
  originalTraits?: string[];
}

interface BiddingPopUpProps {
  onClose: () => void;
  nft: NFT;
}

const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const BiddingPopUp = ({ onClose, nft }: BiddingPopUpProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

    const bidAmountEth = parseFloat(bidAmount);
    if (
      isNaN(bidAmountEth) ||
      bidAmountEth <= Number(formatEther(nft.highestBid)) ||
      bidAmountEth < Number(formatEther(nft.basePrice))
    ) {
      alert(
        "Please enter a valid bid higher than the current highest bid and base price"
      );
      return;
    }

    setIsLoading(true);

    // Place bid
    placeBid({
      address: ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "placeBid",
      args: [nft.tokenId],
      value: parseEther(bidAmount),
    });
  };

  const minimumBid = formatEther(
    nft.highestBid > BigInt(0)
      ? nft.highestBid + parseEther("0.01")
      : nft.basePrice
  );

  return (
    <section
      className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-[95%] max-w-[1000px] h-auto max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden shadow-lg relative border border-gray-800">
        {/* Header with title and close button */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">NFT Details</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content container with scrolling */}
        <div className="h-[calc(90vh-70px)] overflow-y-auto py-6 px-6">
          {/* Main content flex container */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - NFT Image with proper aspect ratio handling */}
            <div className="lg:w-1/2 flex-shrink-0">
              <div className="relative w-full rounded-lg overflow-hidden bg-gray-800 shadow-md border border-gray-700">
                {/* Image container with fixed aspect ratio and adaptive fitting */}
                <div className="relative w-full pt-[100%]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="animate-pulse w-10 h-10 rounded-full border-2 border-gray-500 border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={nft.image}
                    alt={nft.title}
                    className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>

                {/* NFT ID badge */}
                <div className="absolute top-4 left-4 bg-gray-900 px-3 py-1 rounded-md text-sm text-white font-mono border border-gray-700">
                  #{nft.id.toString()}
                </div>
              </div>

              {/* NFT traits in grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {Object.entries(nft.traits).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-800 p-3 rounded-md border border-gray-700"
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
            <div className="lg:w-1/2 text-white flex flex-col gap-5">
              {/* NFT Title and Price */}
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-white">{nft.title}</h2>
                  <div className="px-4 py-2 bg-gray-800 rounded-md text-sm font-medium border border-gray-700">
                    Base:{" "}
                    <span className="text-blue-400">
                      {formatEther(nft.basePrice)} ETH
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-300 gap-2">
                  <User size={14} />
                  <span>Owner:</span>
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {formatAddress(nft.owner)}
                  </span>
                </div>
              </div>

              {/* NFT Description */}
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                <h3 className="text-md font-semibold mb-2 flex items-center">
                  <FileText size={14} className="mr-2 text-gray-400" />
                  Description
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {nft.description}
                </p>
              </div>

              {/* Current highest bidder info */}
              {nft.highestBidder !==
                "0x0000000000000000000000000000000000000000" && (
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                  <h3 className="text-md font-semibold mb-3 flex items-center">
                    <Award size={14} className="mr-2 text-gray-400" />
                    Current Highest Bidder
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="font-mono text-sm">
                      {formatAddress(nft.highestBidder)}
                    </span>
                    <span className="text-white font-medium bg-blue-900 px-3 py-1 rounded-md text-sm">
                      {formatEther(nft.highestBid)} ETH
                    </span>
                  </div>
                </div>
              )}

              {/* Bidding UI */}
              <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Place a Bid</h3>
                  <div>
                    <p className="text-sm text-gray-400">
                      Current bid:
                      <span className="text-white ml-1 font-medium">
                        {nft.highestBid > BigInt(0)
                          ? `${formatEther(nft.highestBid)} ETH`
                          : "No bids yet"}
                      </span>
                    </p>
                  </div>
                </div>

                {!address ? (
                  <div className="text-center p-4 border border-gray-700 rounded-md bg-gray-700">
                    <p className="mb-3 text-sm">
                      Connect your wallet to place a bid
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 text-sm">
                      Connect Wallet
                    </button>
                  </div>
                ) : (
                  /* Bidding form */
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter at least ${minimumBid} ETH`}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white pr-12"
                        disabled={isLoading}
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ETH
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
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
