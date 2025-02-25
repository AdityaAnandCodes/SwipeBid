"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";
import NFTCollections from "@/lib/constant";
import BiddingPopUp from "@/components/BiddingPopUp";

const Explore = () => {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Current NFT being displayed
  const currentNFT = NFTCollections[index];

  // Toggle modal and advance to next NFT when liked
  const handleLike = () => {
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Advance to next NFT
  const handleDislike = () => {
    setIndex((prev) => (prev !== NFTCollections.length - 1 ? prev + 1 : 0));
  };

  // Advance to next NFT after closing modal
  const handleAfterClose = () => {
    setShowModal(false);
    setIndex((prev) => (prev !== NFTCollections.length - 1 ? prev + 1 : 0));
  };

  return (
    <main className="w-full relative min-h-screen bg-gradient-to-b from-gray-900 to-transparent p-5 flex flex-col gap-10 justify-start items-center">
      {/* Modal - Pass the current NFT and close handlers */}
      {showModal && (
        <BiddingPopUp onClose={handleAfterClose} nft={currentNFT} />
      )}

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-5 left-5 p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
      >
        <ArrowBigLeft className="fill-current" />
      </Link>

      {/* NFT display */}
      <div className="rounded-3xl w-[500px] h-[500px] overflow-hidden shadow-2xl">
        <img
          src={currentNFT.image}
          alt={currentNFT.title}
          className="w-full h-full rounded-3xl p-0 border-white border-2 object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <div className="flex gap-10">
        <button
          onClick={handleLike}
          className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-blue-500 hover:text-white transition-colors duration-200"
        >
          Bid Now
        </button>
        <button
          onClick={handleDislike}
          className="bg-gray-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
        >
          Skip
        </button>
      </div>
    </main>
  );
};

export default Explore;
