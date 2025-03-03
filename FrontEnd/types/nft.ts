export interface HighestBidInfo {
  highestBid: bigint;
  highestBidder: string;
}

export interface NFTListing {
  tokenId: bigint;
  seller: string;
  basePrice: bigint;
  imageURI: string;
  price: bigint;

  // Make these optional to match component usage
  name?: string;
  description?: string;
  traits?: string[];

  // Standardize on one activity flag (using isActive)
  isActive: boolean;

  // Highest bid properties
  highestBid?: bigint;
  highestBidder?: string;
}

export interface FormattedNFT {
  tokenId: string;
  seller: string;
  price: string;
  image: string;
  imageURI: string;
  name: string;
  description: string;
  traits: string[] | Record<string, string>;

  // Properties that BiddingPopUp requires
  id: number;
  title: string;
  owner: string;
  basePrice: bigint;
  highestBid: bigint;
  highestBidder: string;

  // Support for attributes for NFT metadata
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;

  // Additional properties
  originalTraits?: any;
}

// Define the NFT interface expected by BiddingPopUp
export interface NFT {
  id: number;
  image: string;
  title: string;
  price: number;
  owner: string;
  description: string;
  traits: Record<string, string>;
  tokenId: bigint;
  basePrice: bigint;
  highestBid: bigint;
  highestBidder: string;
  seller: string;
  originalTraits?: string[];
}
