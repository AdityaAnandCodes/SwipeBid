import { NFTListing, FormattedNFT, HighestBidInfo } from "@/types/nft";
import { formatEther } from "viem";

// Format address to shorter display format
export const formatAddress = (address: string): string => {
  if (!address) return "Unknown";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Get highest bid information with proper null checking
// Updated to handle both interface versions
export const getHighestBidInfo = (nft: any): string => {
  if (!nft) return "No bids yet";

  // Check if highestBid exists and is greater than 0
  const highestBid = nft.highestBid;
  if (!highestBid || highestBid <= BigInt(0)) {
    return "No bids yet";
  }

  const bidAmount = formatEther(highestBid);
  const bidder = formatAddress(nft.highestBidder || "");

  return `${bidAmount} ETH by ${bidder}`;
};

// Convert contract NFT format to formatted display version
export const convertToNFTFormat = async (nft: any): Promise<FormattedNFT> => {
  // Ensure all required properties exist
  if (!nft) {
    throw new Error("NFT data is undefined");
  }

  // Ensure basePrice is never zero to match contract requirements
  const basePrice =
    nft.basePrice && nft.basePrice > BigInt(0)
      ? nft.basePrice
      : BigInt(1000000000000000); // Default to 0.001 ETH if missing or zero

  // For price compatibility
  const price = nft.price || basePrice;

  // Handle both active and isActive
  const isActive =
    typeof nft.active !== "undefined" ? nft.active : nft.isActive;

  // Default formatted NFT
  const formattedNFT: FormattedNFT = {
    tokenId: nft.tokenId.toString(),
    seller: nft.seller,
    price: formatEther(price),
    image: nft.imageURI || "",
    imageURI: nft.imageURI || "",
    name: nft.name || `NFT #${nft.tokenId.toString()}`,
    title: nft.name || `NFT #${nft.tokenId.toString()}`,
    description: nft.description || "No description available",
    traits: nft.traits || [],
    // Add properties needed by BiddingPopUp
    id: Number(nft.tokenId),
    owner: nft.seller,
    basePrice: basePrice,
    highestBid: nft.highestBid || BigInt(0),
    highestBidder:
      nft.highestBidder || "0x0000000000000000000000000000000000000000",
    originalTraits: nft.traits,
  };

  // Convert traits array to Record for BiddingPopUp
  const traitsRecord: Record<string, string> = {};
  if (nft.traits && nft.traits.length > 0) {
    nft.traits.forEach((trait: string, index: number) => {
      const parts = trait.split(":");
      if (parts.length > 1) {
        traitsRecord[parts[0].trim()] = parts[1].trim();
      } else {
        traitsRecord[`Trait ${index + 1}`] = trait.trim();
      }
    });
  }
  formattedNFT.traits = traitsRecord as any;

  // Fetch metadata if needed (rest of the function remains the same)
  if (nft.imageURI && nft.imageURI.startsWith("ipfs://")) {
    try {
      const metadataUrl = `https://ipfs.io/ipfs/${nft.imageURI.replace(
        "ipfs://",
        ""
      )}`;
      const response = await fetch(metadataUrl);

      if (response.ok) {
        const metadata = await response.json();

        // Update with metadata if available
        if (metadata.image) {
          formattedNFT.image = metadata.image.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`
            : metadata.image;
        }

        if (metadata.name) {
          formattedNFT.name = metadata.name;
          formattedNFT.title = metadata.name;
        }

        if (metadata.description)
          formattedNFT.description = metadata.description;

        // Store the original attributes
        if (metadata.attributes || metadata.traits) {
          formattedNFT.attributes = metadata.attributes || metadata.traits;

          // Convert attributes to traits record
          const metadataTraits: Record<string, string> = {};
          (metadata.attributes || metadata.traits || []).forEach(
            (attr: any) => {
              if (attr.trait_type && attr.value !== undefined) {
                metadataTraits[attr.trait_type] = String(attr.value);
              }
            }
          );
          formattedNFT.traits = metadataTraits as any;
        }
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      // Use defaults if metadata fetch fails
    }
  }

  return formattedNFT;
};
