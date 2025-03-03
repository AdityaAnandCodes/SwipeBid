// types/nft.ts

export interface HighestBidInfo {
  highestBid?: bigint;
  highestBidder?: string;
}

export interface NFTListing {
  tokenId: bigint;
  seller: string;
  basePrice: bigint;
  imageURI: string;
  name?: string;
  description?: string;
  highestBid?: bigint;
  highestBidder?: string; // Added this property
  traits?: string[];
  price: bigint; // Required by NFTCard component
  isActive: boolean; // Required by NFTCard component
}

export interface FormattedNFT {
  tokenId: string;
  seller: string;
  price: string;
  image?: string;
  imageURI?: string; // Added this property
  name?: string;
  description?: string;
  traits?: string[];
  // Add properties that BiddingPopUp requires
  id?: number | string;
  title?: string;
  owner?: string;
  basePrice?: bigint | string;
  highestBid?: bigint | string; // Added this property
  highestBidder?: string; // Added this property
  // Add support for attributes for NFT metadata
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Define the NFT interface expected by BiddingPopUp
export interface NFT {
  id: number; // Changed to number only to match BiddingPopUp requirements
  image: string;
  title: string;
  price: number;
  owner: string;
  description: string;
  traits: Record<string, string>;
  tokenId: string;
  basePrice: bigint | string;
  highestBid: bigint | string;
  highestBidder: string;
  seller: string;
}
