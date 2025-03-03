"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ABI, ADDRESS } from "@/lib/constant_contracts";
import { motion, useAnimation, PanInfo } from "framer-motion";
import BiddingPopUp from "@/components/BiddingPopUp";
import { NFTCard } from "@/components/NFTCard";
import { convertToNFTFormat, formatAddress } from "@/utils/nftUtils";
import { NFTListing, FormattedNFT } from "@/types/nft"; // Import the shared types

const ExplorePage = () => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [allListings, setAllListings] = useState<NFTListing[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [selectedNFT, setSelectedNFT] = useState<FormattedNFT | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [completedFirstCycle, setCompletedFirstCycle] =
    useState<boolean>(false);
  const [showLoopNotification, setShowLoopNotification] =
    useState<boolean>(false);
  const ITEMS_PER_PAGE = 12;

  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const { address } = useAccount();

  // Get total listings
  const { data: totalListingsData, refetch: refetchTotalListings } =
    useReadContract({
      address: ADDRESS,
      abi: ABI,
      functionName: "getTotalListings",
    });

  // Get active listings for current page
  const { data: activeListingsData, refetch: refetchListings } =
    useReadContract({
      address: ADDRESS,
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
      // Cast and map the data to ensure all required properties are present
      const newListings = (activeListingsData as any[]).map((listing) => ({
        ...listing,
        basePrice: listing.price, // Ensure basePrice exists (mapping price to basePrice)
        imageURI: listing.imageURI || "", // Ensure imageURI exists with a default
        // Fix: Add missing properties from the NFTListing interface
        price: listing.price, // Add price property
        isActive: true, // Add isActive property
      })) as NFTListing[];

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
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    handleSwipe(info);
  };

  const getCurrentNFT = (): NFTListing | undefined => {
    return listings[currentIndex];
  };

  // Fix: Update the type definition to match the NFTCard component's expected types
  const adaptedConvertToNFTFormat = async (
    nft: NFTListing
  ): Promise<FormattedNFT> => {
    return await convertToNFTFormat(nft);
  };

  // Function to convert FormattedNFT to the format expected by BiddingPopUp
  const convertToBiddingNFTFormat = (formattedNFT: FormattedNFT): any => {
    return {
      id:
        typeof formattedNFT.id === "string"
          ? parseInt(formattedNFT.id)
          : formattedNFT.id || Number(formattedNFT.tokenId),
      image: formattedNFT.image || formattedNFT.imageURI || "",
      title:
        formattedNFT.title ||
        formattedNFT.name ||
        `NFT #${formattedNFT.id || formattedNFT.tokenId}`,
      price: formattedNFT.price ? Number(formattedNFT.price) : 0,
      owner: formattedNFT.owner || formattedNFT.seller || address || "",
      description: formattedNFT.description || "",
      traits:
        formattedNFT.attributes?.reduce((acc: Record<string, string>, attr) => {
          if (attr.trait_type && attr.value) {
            acc[attr.trait_type] = attr.value.toString();
          }
          return acc;
        }, {} as Record<string, string>) || {},
      tokenId: formattedNFT.tokenId,
      basePrice: formattedNFT.basePrice || formattedNFT.price || BigInt(0),
      highestBid: formattedNFT.highestBid || BigInt(0),
      highestBidder:
        formattedNFT.highestBidder ||
        "0x0000000000000000000000000000000000000000",
      seller: formattedNFT.seller || "",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <main className="container mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 flex flex-col items-center">
        <div className="w-full min-h-screen max-w-xs sm:max-w-sm md:max-w-md h-full flex flex-col items-center justify-center relative mt-2 sm:mt-4">
          <NFTCard
            isLoading={isLoading}
            listings={listings}
            currentNFT={getCurrentNFT()}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            showLoopNotification={showLoopNotification}
            controls={controls}
            cardRef={cardRef}
            handleDragEnd={handleDragEnd}
            swipeDirection={swipeDirection}
            showNextNFT={showNextNFT}
            setSwipeDirection={setSwipeDirection}
            convertToNFTFormat={adaptedConvertToNFTFormat}
            setSelectedNFT={setSelectedNFT}
          />
        </div>
      </main>

      {selectedNFT && (
        <BiddingPopUp
          onClose={closeBiddingPopup}
          nft={convertToBiddingNFTFormat(selectedNFT)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
