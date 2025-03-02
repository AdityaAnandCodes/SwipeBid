import { NFTListing, FormattedNFT, HighestBidInfo } from "@/types/nft";
import { formatEther } from "viem";

// Format address to shorter display format
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Get highest bid information with proper null checking
export const getHighestBidInfo = (nft: NFTListing | undefined): string => {
  if (!nft || !nft.highestBid || nft.highestBid <= BigInt(0)) {
    return "No bids yet";
  }

  const bidAmount = formatEther(nft.highestBid);

  // Check if highestBidder exists in the type
  // If not, use a fallback or handle it appropriately
  const bidder = (nft as any).highestBidder
    ? formatAddress((nft as any).highestBidder)
    : "Unknown";

  return `${bidAmount} ETH by ${bidder}`;
};
// Convert contract NFT format to formatted display version
export const convertToNFTFormat = async (nft: NFTListing): Promise<FormattedNFT> => {
  // Ensure all required properties exist
  if (!nft) {
    throw new Error("NFT data is undefined");
  }

  // For basePrice or price, depending on what's available
  const price = nft.basePrice || nft.price || BigInt(0);
  
  // Default formatted NFT
  const formattedNFT: FormattedNFT = {
    tokenId: nft.tokenId.toString(),
    seller: nft.seller,
    price: formatEther(price),
    image: nft.imageURI || "",
    name: nft.name || `NFT #${nft.tokenId.toString()}`,
    description: nft.description || "No description available",
    traits: nft.traits || []
  };

  // If the image is an IPFS URI, try to fetch metadata
  if (nft.imageURI && nft.imageURI.startsWith("ipfs://")) {
    try {
      const metadataUrl = `https://ipfs.io/ipfs/${nft.imageURI.replace("ipfs://", "")}`;
      const response = await fetch(metadataUrl);
      
      if (response.ok) {
        const metadata = await response.json();
        
        // Update with metadata if available
        if (metadata.image) {
          formattedNFT.image = metadata.image.startsWith("ipfs://") 
            ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}` 
            : metadata.image;
        }
        
        if (metadata.name) formattedNFT.name = metadata.name;
        if (metadata.description) formattedNFT.description = metadata.description;
        if (metadata.attributes || metadata.traits) {
          formattedNFT.traits = (metadata.attributes || metadata.traits || []).map(
            (attr: any) => `${attr.trait_type || "Trait"}: ${attr.value || "Unknown"}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      // Use defaults if metadata fetch fails
    }
  }

  return formattedNFT;
};