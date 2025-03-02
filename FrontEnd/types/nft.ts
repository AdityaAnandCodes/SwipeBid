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
  traits?: string[];
  price: bigint; // Required by NFTCard component
  isActive: boolean; // Required by NFTCard component
}

export interface FormattedNFT {
  tokenId: string;
  seller: string;
  price: string;
  image?: string;
  name?: string;
  description?: string;
  traits?: string[];
  // Add these properties if BiddingPopUp requires them
  id?: string;
  title?: string;
  owner?: string;
  basePrice?: string;
  // Add any other properties needed by BiddingPopUp
}

// Define the NFT interface expected by BiddingPopUp
export interface NFT {
  id: string;
  title: string;
  owner: string;
  basePrice: string;
  // Add any other required properties
}