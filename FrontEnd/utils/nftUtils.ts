import { formatEther } from "viem";

/**
 * NFTListing interface
 * @typedef {Object} NFTListing
 * @property {bigint} tokenId - The NFT token ID
 * @property {string} seller - The address of the seller
 * @property {string} name - The name of the NFT
 * @property {string} description - The description of the NFT
 * @property {string} imageURI - The URI of the NFT image
 * @property {string[]} traits - The traits of the NFT
 * @property {bigint} basePrice - The base price of the NFT
 * @property {boolean} active - Whether the NFT is active
 * @property {string} highestBidder - The address of the highest bidder
 * @property {bigint} highestBid - The highest bid amount
 */

/**
 * NFT interface
 * @typedef {Object} NFT
 * @property {number} id - The NFT ID
 * @property {string} image - The image URL
 * @property {string} title - The NFT title
 * @property {number} price - The NFT price
 * @property {string} owner - The NFT owner
 * @property {string} description - The NFT description
 * @property {Object.<string, string>} traits - The NFT traits
 * @property {bigint} tokenId - The token ID from blockchain
 * @property {bigint} basePrice - The base price from blockchain
 * @property {bigint} highestBid - The highest bid from blockchain
 * @property {string} highestBidder - The highest bidder from blockchain
 * @property {string} seller - The seller from blockchain
 * @property {string[]} originalTraits - The original traits array from blockchain
 */

/**
 * Format an Ethereum address to a shorter version
 * @param {string} address - The Ethereum address to format
 * @returns {string} The formatted address
 */
export const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
        address.length - 4
    )}`;
};

/**
 * Fetch metadata from IPFS or regular URL
 * @param {string} uri - The URI to fetch metadata from
 * @returns {Promise<Object|null>} The metadata or null if an error occurred
 */
interface Metadata {
    image: string;
    description: string;
    traits: { [key: string]: string };
}

export const fetchMetadata = async (uri: string): Promise<Metadata | null> => {
    try {
        if (!uri) throw new Error("NFT URI is undefined");

        const metadataUrl = uri.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`
            : uri;

        console.log("Fetching metadata from:", metadataUrl);

        const response = await fetch(metadataUrl);
        if (!response.ok)
            throw new Error(`Failed to fetch metadata from ${metadataUrl}`);

        const metadata = await response.json();
        console.log("Fetched Metadata:", metadata);

        if (!metadata || !metadata.image)
            throw new Error("Metadata does not contain an image field");

        const imageUrl = metadata.image.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`
            : metadata.image;

        console.log("Extracted Image URL:", imageUrl);

        return {
            image: imageUrl,
            description: metadata.description || "",
            traits: metadata.attributes
                ? metadata.attributes.reduce((acc: { [key: string]: string }, attr: { trait_type: string; value: string }) => {
                        acc[attr.trait_type] = attr.value;
                        return acc;
                    }, {})
                : {},
        };
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
    }
};

/**
 * Convert NFTListing to NFT format
 * @param {NFTListing} nft - The NFTListing to convert
 * @returns {Promise<NFT|null>} The converted NFT or null if an error occurred
 */
interface NFT {
    id: number;
    image: string;
    title: string;
    price: number;
    owner: string;
    description: string;
    traits: { [key: string]: string };
    tokenId: bigint;
    basePrice: bigint;
    highestBid: bigint;
    highestBidder: string;
    seller: string;
    originalTraits: string[];
}

interface NFTListing {
    tokenId: bigint;
    seller: string;
    name: string;
    description: string;
    imageURI: string;
    traits: string[];
    basePrice: bigint;
    active: boolean;
    highestBidder: string;
    highestBid: bigint;
}

export const convertToNFTFormat = async (nft: NFTListing): Promise<NFT | null> => {
    try {
        if (!nft) throw new Error("NFT object is undefined");

        console.log("Initial NFT Data:", nft);

        let imageUrl = nft.imageURI ?? "";
        let metadataDescription = nft.description ?? "No description available";
        let metadataTraits: { [key: string]: string } = {};

        console.log("Initial Image URI:", nft.imageURI);

        // Fetch metadata if the imageURI is actually a metadata link
        if (imageUrl.startsWith("ipfs://")) {
            const metadata = await fetchMetadata(imageUrl);
            if (metadata) {
                imageUrl = metadata.image;
                metadataDescription = metadata.description;
                metadataTraits = metadata.traits;
            }
        }

        console.log("Final Image URL:", imageUrl);

        return {
            id: Number(nft.tokenId ?? 0),
            image: imageUrl,
            title: nft.name ?? "Unknown NFT",
            price: Number(
                formatEther(
                    nft.highestBid && nft.highestBid > BigInt(0)
                        ? nft.highestBid
                        : nft.basePrice ?? BigInt(0)
                )
            ),
            owner: nft.seller ?? "Unknown",
            description: metadataDescription,
            traits: metadataTraits,
            tokenId: nft.tokenId ?? BigInt(0),
            basePrice: nft.basePrice ?? BigInt(0),
            highestBid: nft.highestBid ?? BigInt(0),
            highestBidder: nft.highestBidder ?? "Unknown",
            seller: nft.seller ?? "Unknown",
            originalTraits: Array.isArray(nft.traits) ? nft.traits : [],
        };
    } catch (error) {
        console.error("Error in convertToNFTFormat:", error);
        return null;
    }
};

/**
 * Get highest bid information as a string
 * @param {NFTListing} nft - The NFT listing
 * @returns {string} A formatted string with bid information
 */
interface HighestBidInfo {
    highestBid: bigint;
    highestBidder: string;
}

export const getHighestBidInfo = (nft: HighestBidInfo): string => {
    if (!nft) return "No bids yet";

    if (nft.highestBid && nft.highestBid > BigInt(0)) {
        return `${formatEther(nft.highestBid)} ETH by ${formatAddress(
            nft.highestBidder
        )}`;
    }

    return "No bids yet";
};
