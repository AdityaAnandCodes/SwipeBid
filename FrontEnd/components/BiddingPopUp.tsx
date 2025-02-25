"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NFT {
  id: number;
  image: string;
  title: string;
  price: number;
  owner: string;
  description: string;
  traits: Record<string, string>;
}

interface BiddingPopUpProps {
  onClose: () => void;
  nft: NFT;
}

const BiddingPopUp = ({ onClose, nft }: BiddingPopUpProps) => {
  const [bidAmount, setBidAmount] = useState("");

  // Handle bid submission
interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (
        !bidAmount ||
        isNaN(parseFloat(bidAmount)) ||
        parseFloat(bidAmount) <= nft.price
    ) {
        alert("Please enter a valid bid higher than the current price");
        return;
    }
    // Here you would handle the actual bid submission
    alert(`Bid of ${bidAmount} ETH submitted successfully!`);
    onClose();
};

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e : any) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <section className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="w-[90%] max-w-[900px] h-auto max-h-[90vh] bg-gray-900 rounded-2xl p-6 flex flex-col gap-5 relative border border-gray-700 overflow-auto">
        {/* Improved close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-200 shadow-lg z-10 flex items-center justify-center"
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
            #{nft.id}
          </div>
        </div>

        {/* NFT details */}
        <div className="text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{nft.title}</h2>
            <div className="px-3 py-1 bg-green-600 rounded-full text-sm font-medium">
              {nft.price} ETH
            </div>
          </div>
          <p className="text-sm text-gray-400">Owner: {nft.owner}</p>
          <p className="mt-2">{nft.description}</p>

          {/* NFT traits */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
                <span className="text-gray-400">Last bid:</span>{" "}
                <span className="text-green-400 font-medium">
                  {nft.price} ETH
                </span>
              </p>
            </div>

            {/* Bidding form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid"
                  className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
                <span className="absolute right-3 top-3 text-gray-400">
                  ETH
                </span>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Place Bid
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              Minimum bid: {(nft.price + 0.01).toFixed(2)} ETH
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiddingPopUp;
