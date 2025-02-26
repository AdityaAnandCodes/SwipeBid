"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    <section className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="w-[90%] max-w-[900px] h-auto max-h-[90vh] bg-gray-900 rounded-2xl p-6 flex flex-col gap-5 relative border border-gray-700 overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-200 shadow-lg z-10 flex items-center justify-center disabled:opacity-50"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* NFT image */}
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
          <img
            src={nft.image}
            alt={nft.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm text-white">
            #{nft.id.toString()}
          </div>
        </div>

        {/* NFT details */}
        <div className="text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{nft.title}</h2>
            <div className="px-3 py-1 bg-green-600 rounded-full text-sm font-medium">
              Base: {formatEther(nft.basePrice)} ETH
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Owner: {formatAddress(nft.owner)}
          </p>
          <p className="mt-2">{nft.description}</p>

          {/* NFT traits */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {Object.entries(nft.traits).map(([key, value]) => (
              <div key={key} className="bg-gray-800 p-2 rounded-lg">
                <strong className="capitalize">{key}:</strong> {value}
              </div>
            ))}
          </div>

          {/* Bidding information */}
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Place a Bid</h3>
              <p className="text-sm">
                <span className="text-gray-400">Current bid:</span>{" "}
                <span className="text-green-400 font-medium">
                  {nft.highestBid > BigInt(0)
                    ? `${formatEther(nft.highestBid)} ETH`
                    : "No bids yet"}
                </span>
              </p>
            </div>

            {!address ? (
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <p className="mb-2">Connect your wallet to place a bid</p>
              </div>
            ) : (
              /* Bidding form */
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid"
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    disabled={isLoading}
                    required
                  />
                  <span className="absolute right-3 top-3 text-gray-400">
                    ETH
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Bidding...
                    </>
                  ) : (
                    "Place Bid"
                  )}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Minimum bid: {minimumBid} ETH
            </p>
          </div>

          {/* Current highest bidder info */}
          {nft.highestBidder !==
            "0x0000000000000000000000000000000000000000" && (
            <div className="mt-6 p-4 bg-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold mb-3">
                Current Highest Bidder
              </h3>
              <div className="flex items-center justify-between">
                <span>{formatAddress(nft.highestBidder)}</span>
                <span className="text-green-400 font-medium">
                  {formatEther(nft.highestBid)} ETH
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BiddingPopUp;
